/* CYBER STUDY: Supabase login, sync adapter, private lesson download, and the settings panel.
   Plain fetch against Supabase's REST endpoints — no library, so it works offline-first. */
(() => {
  'use strict';

  const CFG = window.CS_CONFIG || {};
  const BASE = (CFG.supabaseUrl || '').replace(/\/+$/, '');
  const ANON = CFG.supabaseAnonKey || '';
  const configured = !!(BASE && ANON);
  const SESSION_KEY = 'sb-cs-session'; // "sb-" keys are never synced
  const LESSON_CACHE = 'cs-lessons-v1';
  const STATE_KEY = 'cyber-study-state-v1';

  // ---------- session ----------
  function loadSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
  function saveSession(s) { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); }
  let session = loadSession();

  function fromAuthResponse(j) {
    return { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_at || Math.floor(Date.now() / 1000) + (j.expires_in || 3600), user: { id: j.user?.id, email: j.user?.email } };
  }

  async function authRequest(grant, body) {
    const res = await fetch(`${BASE}/auth/v1/token?grant_type=${grant}`, {
      method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error_description || j.msg || j.message || `ログインに失敗しました（${res.status}）`);
    return fromAuthResponse(j);
  }

  async function signIn(email, password) { session = await authRequest('password', { email, password }); saveSession(session); return session; }

  let refreshing = null;
  async function token() {
    if (!session) throw new Error('ログインしていません');
    if (session.expires_at - 60 > Date.now() / 1000) return session.access_token;
    refreshing ||= authRequest('refresh_token', { refresh_token: session.refresh_token })
      .then((s) => { session = s; saveSession(s); return s; })
      .catch((e) => { if (/invalid|not found|revoked/i.test(e.message)) { session = null; saveSession(null); } throw e; })
      .finally(() => { refreshing = null; });
    return (await refreshing).access_token;
  }

  async function signOut() {
    try { if (session) await fetch(`${BASE}/auth/v1/logout`, { method: 'POST', headers: { apikey: ANON, Authorization: `Bearer ${session.access_token}` } }); } catch { /* offline */ }
    session = null; saveSession(null);
    window.CSStore.setAdapter(null);
  }

  async function api(path, opts = {}) {
    const res = await fetch(`${BASE}${path}`, { ...opts, headers: { apikey: ANON, Authorization: `Bearer ${await token()}`, ...(opts.headers || {}) } });
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(`サーバーエラー ${res.status} ${t.slice(0, 160)}`); }
    return res;
  }

  // ---------- sync adapter ----------
  const adapter = {
    async pull(since) {
      const out = [];
      const pageSize = 500;
      for (let offset = 0; ; offset += pageSize) {
        let q = `/rest/v1/kv?select=key,value,updated_at,server_at&order=server_at.asc&limit=${pageSize}&offset=${offset}`;
        if (since) q += `&server_at=gt.${encodeURIComponent(since)}`;
        const rows = await (await api(q)).json();
        out.push(...rows);
        if (rows.length < pageSize) break;
      }
      return out;
    },
    async push(rows) {
      // Conditional save on the server (kv_put): refuses a row if another device saved it first.
      const result = { saved: {}, conflicts: [] };
      let batch = [], size = 0;
      const flush = async () => {
        if (!batch.length) return;
        const res = await api('/rest/v1/rpc/kv_put', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: batch })
        });
        const j = await res.json();
        Object.assign(result.saved, j.saved || {});
        result.conflicts.push(...(j.conflicts || []));
        batch = []; size = 0;
      };
      for (const r of rows) {
        const len = (r.value || '').length;
        if (size + len > 2_000_000) await flush();
        batch.push({ key: r.key, value: r.value, updated_at: r.updated_at, base: r.base });
        size += len;
      }
      await flush();
      return result;
    }
  };

  // Main app state: if both devices changed it offline, combine instead of dropping one side.
  function mergeState(localRaw, remoteRaw) {
    try {
      const L = JSON.parse(localRaw), R = JSON.parse(remoteRaw);
      const out = { ...R, ...L };
      for (const k of ['cards', 'exam', 'lessons', 'sqlSolved', 'dojoSolved', 'importedLessons', 'settings']) {
        if ((L[k] && typeof L[k] === 'object') || (R[k] && typeof R[k] === 'object')) out[k] = { ...(R[k] || {}), ...(L[k] || {}) };
      }
      const byId = new Map();
      for (const n of [...(R.notes || []), ...(L.notes || [])]) {
        const prev = byId.get(n.id);
        if (!prev || String(n.updatedAt || n.updated || '') >= String(prev.updatedAt || prev.updated || '')) byId.set(n.id, n);
      }
      out.notes = [...byId.values()];
      const seen = new Set();
      out.history = [...(L.history || []), ...(R.history || [])]
        .filter((h) => { const id = `${h.at}|${h.type}|${h.label}`; if (seen.has(id)) return false; seen.add(id); return true; })
        .sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 150);
      return JSON.stringify(out);
    } catch { return localRaw; }
  }
  window.CSStore.registerMerger(STATE_KEY, mergeState);

  // After other devices' data arrives, reload so every module reads the fresh values
  // (keeps stale in-memory state from overwriting it).
  window.CSStore.onSynced((r) => {
    if (r.pulled > 0) {
      try { sessionStorage.setItem('cs-just-synced', String(r.pulled)); sessionStorage.setItem('cs-return-page', typeof page === 'string' ? page : 'home'); } catch { /* ignore */ }
      location.reload();
    }
  });
  try {
    const n = sessionStorage.getItem('cs-just-synced');
    if (n) {
      sessionStorage.removeItem('cs-just-synced');
      const back = sessionStorage.getItem('cs-return-page'); sessionStorage.removeItem('cs-return-page');
      setTimeout(() => { if (back && back !== 'home') window.navigate?.(back); window.toast?.(`他の端末の記録を取り込みました（${n}件）`); }, 300);
    }
  } catch { /* ignore */ }

  // ---------- private lessons ----------
  function lessonCatalog() { return window.cyberStudyImported?.catalog || []; }
  async function cachedLessonCount() {
    if (!('caches' in window)) return 0;
    const cache = await caches.open(LESSON_CACHE);
    let n = 0;
    for (const x of lessonCatalog()) if (await cache.match(new URL(`lessons/${x.file}`, location.href).href)) n++;
    return n;
  }
  // Shared lesson CSS/JS from the original site: stored in the bucket under imported/.
  const SHARED = ['common.css', 'foundation.css', 'foundation.js', 'learning-asides.js', 'learning-progress.js'];
  const TYPES = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8' };
  async function downloadLessons(onProgress) {
    const cache = await caches.open(LESSON_CACHE);
    const items = [
      ...SHARED.map((n) => ({ remote: `imported/${n}`, local: `assets/imported/${n}` })),
      ...lessonCatalog().map((x) => ({ remote: x.file, local: `lessons/${x.file}` }))
    ];
    let done = 0;
    const failed = [];
    for (const it of items) {
      try {
        const res = await api(`/storage/v1/object/authenticated/lessons/${it.remote.split('/').map(encodeURIComponent).join('/')}`);
        const body = await res.blob();
        const type = TYPES[it.local.split('.').pop()] || 'application/octet-stream';
        await cache.put(new URL(it.local, location.href).href, new Response(body, { headers: { 'Content-Type': type } }));
      } catch (e) { failed.push(it.remote); console.warn(it.remote, e); }
      onProgress?.(++done, items.length);
    }
    return { ok: items.length - failed.length, failed };
  }

  // ---------- settings panel ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function panelHTML() {
    if (!configured) return `<section class="panel" id="cs-sync-panel"><h2>☁ 同期とログイン</h2><p class="sub">接続先がまだ設定されていません（assets/cs-config.js）。</p></section>`;
    if (!session) {
      return `<section class="panel" id="cs-sync-panel"><h2>☁ 同期とログイン</h2>
        <p class="sub">ログインすると、PCとスマホで学習記録が自動で揃い、教材71講をこの端末に保存できます。</p>
        <form id="cs-login" class="flex" style="align-items:flex-end;margin-top:14px">
          <label class="field" style="flex:1 1 220px">メールアドレス<input class="input" id="cs-email" type="email" autocomplete="username" required></label>
          <label class="field" style="flex:1 1 180px">パスワード<input class="input" id="cs-password" type="password" autocomplete="current-password" required></label>
          <button class="btn primary" type="submit">ログイン</button>
        </form><p class="helper" id="cs-login-msg" role="status"></p></section>`;
    }
    const st = window.CSStore;
    return `<section class="panel" id="cs-sync-panel"><h2>☁ 同期とログイン</h2>
      <p class="sub">ログイン中：<b>${esc(session.user?.email)}</b></p>
      <div class="flex" style="margin-top:12px"><span class="pill" id="cs-sync-state">状態：${esc(st.status)}</span><span class="pill" id="cs-lesson-count">教材：確認中…</span></div>
      <div class="flex" style="margin-top:14px">
        <button class="btn primary" id="cs-sync-now">今すぐ同期</button>
        <button class="btn" id="cs-dl-lessons">教材71講をこの端末に保存</button>
        <button class="btn danger" id="cs-logout">ログアウト</button>
      </div><p class="helper" id="cs-sync-msg" role="status"></p>
      <p class="helper">記録はまずこの端末に保存され、アプリを開いたとき・閉じたとき・通信が戻ったときに自動で同期します。</p></section>`;
  }

  async function bindPanel() {
    const login = document.getElementById('cs-login');
    if (login) {
      login.onsubmit = async (e) => {
        e.preventDefault();
        const msg = document.getElementById('cs-login-msg');
        msg.textContent = 'ログイン中…';
        try {
          await signIn(document.getElementById('cs-email').value.trim(), document.getElementById('cs-password').value);
          window.CSStore.setAdapter(adapter);
          msg.textContent = '同期しています…';
          const r = await window.CSStore.sync();
          if (r.error) msg.textContent = `ログインしましたが同期に失敗：${r.error}`;
          else if (!r.pulled) window.navigate?.('settings');
        } catch (err) { msg.textContent = err.message; }
      };
      return;
    }
    const msg = document.getElementById('cs-sync-msg');
    const count = document.getElementById('cs-lesson-count');
    const refreshCount = async () => { if (count) count.textContent = `教材：${await cachedLessonCount()} / ${lessonCatalog().length} 講を保存済み`; };
    refreshCount();
    const now = document.getElementById('cs-sync-now');
    if (now) now.onclick = async () => {
      msg.textContent = '同期しています…';
      const r = await window.CSStore.sync();
      msg.textContent = r.error ? `同期に失敗：${r.error}` : r.skipped === 'offline' ? 'オフラインです。つながったら自動で同期します。' : `同期しました（受信 ${r.pulled}・送信 ${r.pushed}）`;
      const s = document.getElementById('cs-sync-state'); if (s) s.textContent = `状態：${window.CSStore.status}`;
    };
    const dl = document.getElementById('cs-dl-lessons');
    if (dl) dl.onclick = async () => {
      dl.disabled = true;
      try {
        const r = await downloadLessons((d, t) => { msg.textContent = `教材を保存中… ${d} / ${t}`; });
        msg.textContent = r.failed.length ? `${r.ok}件を保存。失敗：${r.failed.slice(0, 5).join(', ')}${r.failed.length > 5 ? ' ほか' : ''}` : `教材${lessonCatalog().length}講と共通ファイルを保存しました。オフラインでも読めます。`;
      } catch (e) { msg.textContent = e.message; }
      dl.disabled = false; await refreshCount();
    };
    const out = document.getElementById('cs-logout');
    if (out) out.onclick = async () => {
      if (!confirm('ログアウトしますか？（この端末の記録は残ります）')) return;
      await signOut(); window.navigate?.('settings');
    };
  }

  if (typeof renderSettings === 'function') {
    const prevRender = renderSettings, prevBind = bindSettings;
    renderSettings = function () { return panelHTML() + prevRender(); };
    bindSettings = function () { prevBind(); bindPanel(); };
  }

  // Textbook: on the public site, lessons exist only after "教材をこの端末に保存".
  if (typeof bindTextbook === 'function' && /^https?:$/.test(location.protocol) && configured) {
    const prevBindTextbook = bindTextbook;
    bindTextbook = function () {
      prevBindTextbook();
      const frame = document.getElementById('cs4-import-frame');
      if (!frame || !('caches' in window)) return;
      caches.open(LESSON_CACHE).then((c) => c.match(new URL(frame.getAttribute('src'), location.href).href)).then((hit) => {
        if (hit) return;
        fetch(frame.getAttribute('src'), { method: 'HEAD' }).then((r) => { if (r.ok) return; throw new Error(); }).catch(() => {
          const note = document.createElement('div');
          note.className = 'panel';
          note.innerHTML = `<h3>この端末にはまだ教材がありません</h3><p class="sub">設定 → 「同期とログイン」でログインし、「教材71講をこの端末に保存」を押してください。</p><button class="btn primary" type="button">設定を開く</button>`;
          note.querySelector('button').onclick = () => window.navigate?.('settings');
          frame.replaceWith(note);
        });
      });
    };
  }

  // ---------- start ----------
  window.CSSync = { configured, get session() { return session; }, signIn, signOut, downloadLessons, cachedLessonCount, adapter };
  if (configured && session) {
    window.CSStore.setAdapter(adapter);
    window.CSStore.sync();
  }
})();
