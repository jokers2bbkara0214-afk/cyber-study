-- CYBER STUDY: Supabase の初期設定（SQL Editor に全部貼り付けて Run）
-- 1) 学習データ（端末間で同期する保存データ）
create table if not exists public.kv (
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  key        text not null,
  value      text,
  updated_at timestamptz not null default now(),  -- その端末で変更した時刻（どちらが新しいかの判定用）
  server_at  timestamptz not null default now(),  -- サーバーに届いた時刻（差分の取得用）
  primary key (user_id, key)
);
create index if not exists kv_user_server_at on public.kv (user_id, server_at);

create or replace function public.kv_touch() returns trigger
language plpgsql as $$
begin
  new.server_at := now();
  return new;
end $$;

drop trigger if exists kv_touch on public.kv;
create trigger kv_touch before insert or update on public.kv
for each row execute function public.kv_touch();

alter table public.kv enable row level security;
drop policy if exists "own rows only" on public.kv;
create policy "own rows only" on public.kv
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 2) 教材71講の保管庫（非公開。ログインした本人だけ読める）
insert into storage.buckets (id, name, public)
values ('lessons', 'lessons', false)
on conflict (id) do nothing;

drop policy if exists "signed-in user reads lessons" on storage.objects;
create policy "signed-in user reads lessons" on storage.objects
  for select to authenticated
  using (bucket_id = 'lessons');
-- 追加分：同時に保存されたときに上書きで消えないようにする関数（SQL Editorで1回 Run）
create or replace function public.kv_put(items jsonb)
returns jsonb
language plpgsql
security invoker
as $$
declare
  it jsonb;
  cur timestamptz;
  saved jsonb := '{}'::jsonb;
  conflicts jsonb := '[]'::jsonb;
  new_at timestamptz;
begin
  for it in select * from jsonb_array_elements(items) loop
    select server_at into cur from public.kv where user_id = auth.uid() and key = it->>'key';
    -- 他の端末が先に保存していたら書き込まず、端末側で合体してからやり直す
    if cur is not null and (it->>'base' is null or cur <> (it->>'base')::timestamptz) then
      conflicts := conflicts || to_jsonb(it->>'key');
      continue;
    end if;
    insert into public.kv (user_id, key, value, updated_at)
    values (auth.uid(), it->>'key', it->>'value', coalesce((it->>'updated_at')::timestamptz, now()))
    on conflict (user_id, key) do update
      set value = excluded.value, updated_at = excluded.updated_at
    returning server_at into new_at;
    saved := saved || jsonb_build_object(it->>'key', new_at);
  end loop;
  return jsonb_build_object('saved', saved, 'conflicts', conflicts);
end $$;
