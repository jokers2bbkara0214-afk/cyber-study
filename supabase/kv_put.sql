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
