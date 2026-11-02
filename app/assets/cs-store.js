/* CYBER STUDY data store: one place that knows every saved key, tracks local changes,
   and merges remote data. The cloud adapter (Supabase) plugs in via CSStore.setAdapter().
   Loaded before every other script so it sees all writes from the main window.
   Writes made inside lesson iframes are picked up by scan() (same origin, same storage). */
(() => {
  'use strict';

  const META_KEY = 'cs-sync-meta-v1';
  const IGNORE = (k) => k.startsWith('cs-sync-') || k.startsWith('sb-'); // own meta + auth tokens
  const mergers = new Map();
  let adapter = null;
  let syncing = null;
  const listeners = new Set();
  const afterSync = new Set();

  const raw = window.localStorage;
  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;

  function hash(str) { // FNV-1a 32-bit
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }

  function loadMeta() {
    try {
      const m = JSON.parse(raw.getItem(META_KEY) || '{}');
      m.deviceId ||= (crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(36).slice(2));
      m.synced ||= {};   // key -> {h, at}  value hash at last successful sync
      m.dirtyAt ||= {};  // key -> ISO time the local change was first noticed
      return m;
    } catch { return { deviceId: String(Date.now()), synced: {}, dirtyAt: {} }; }
  }
  let meta = loadMeta();
  function saveMeta() { try { nativeSet.call(raw, META_KEY, JSON.stringify(meta)); } catch { /* full storage */ } }

  function keys() {
    const out = [];
    for (let i = 0; i < raw.length; i++) { const k = raw.key(i); if (k && !IGNORE(k)) out.push(k); }
    return out.sort();
  }

  function markDirty(key) {
    if (IGNORE(key)) return;
    if (!meta.dirtyAt[key]) { meta.dirtyAt[key] = new Date().toISOString(); saveMeta(); }
    emit();
  }

  // Record the moment of every local write in this window.
  Storage.prototype.setItem = function (key, value) {
    nativeSet.call(this, key, value);
    if (this === raw) markDirty(String(key));
  };
  Storage.prototype.removeItem = function (key) {
    nativeRemove.call(this, key);
    if (this === raw) markDirty(String(key));
  };

  /** Compare every key with the last synced hash; stamp newly changed keys. Returns changed keys. */
  function scan() {
    const now = new Date().toISOString();
    const changed = [];
    const present = new Set(keys());
    for (const k of new Set([...present, ...Object.keys(meta.synced)])) {
      const v = raw.getItem(k);
      const h = v === null ? null : hash(v);
      if ((meta.synced[k]?.h ?? null) !== h) { changed.push(k); meta.dirtyAt[k] ||= now; }
      else delete meta.dirtyAt[k];
    }
    saveMeta();
    return changed;
  }

  function pendingCount() { return scan().length; }

  /** Rows to send: [{key, value (string|null for deleted), updated_at}] */
  function outgoing() {
    // base = the server version this change was made on top of; the server refuses it if someone saved in between.
    return scan().map((k) => ({ key: k, value: raw.getItem(k), updated_at: meta.dirtyAt[k], base: meta.synced[k]?.at ?? null }));
  }

  /** Apply rows from the cloud. A key changed on both sides is merged (if a merger exists) or the newer one wins.
      On a device's first sync the cloud is authoritative, so a fresh phone never overwrites real data with defaults. */
  function applyRemote(rows, { remoteWins = false } = {}) {
    let applied = 0;
    const localChanged = new Set(scan());
    for (const row of rows) {
      const { key, value, updated_at } = row;
      if (IGNORE(key)) continue;
      const local = raw.getItem(key);
      let next = value;
      if (!remoteWins && localChanged.has(key) && local !== value) {
        const merge = mergers.get(key);
        if (merge && local !== null && value !== null) next = merge(local, value);
        else if ((meta.dirtyAt[key] || '') > (updated_at || '')) next = local; // local edit is newer
      }
      if (next !== local) {
        if (next === null) nativeRemove.call(raw, key); else nativeSet.call(raw, key, next);
        applied++;
      }
      // Remote now reflects `value`; if we kept/merged something else it stays dirty and is pushed next.
      meta.synced[key] = { h: value === null ? null : hash(value), at: row.server_at || updated_at };
      if (next === value) delete meta.dirtyAt[key];
    }
    saveMeta();
    return applied;
  }

  /** saved: {key: server_at} for rows the server accepted. */
  function markPushed(rows, saved) {
    for (const r of rows) {
      if (!saved[r.key]) continue;                    // conflict: retried after the next pull
      meta.synced[r.key] = { h: r.value === null ? null : hash(r.value), at: saved[r.key] };
      if (raw.getItem(r.key) === r.value) delete meta.dirtyAt[r.key]; // else changed again while pushing
    }
    saveMeta();
  }

  /** Full sync: pull remote changes, merge, push local changes. Returns {pulled, pushed}. */
  async function sync() {
    if (!adapter) return { pulled: 0, pushed: 0, skipped: 'no-adapter' };
    if (!navigator.onLine) return { pulled: 0, pushed: 0, skipped: 'offline' };
    if (syncing) return syncing;
    syncing = (async () => {
      setStatus('syncing');
      try {
        const first = !meta.lastSyncAt;
        let pulled = 0, pushed = 0, conflicts = [];
        for (let round = 0; round < 4; round++) {
          const remote = await adapter.pull(first && round === 0 ? null : (meta.lastPullAt || null));
          pulled += applyRemote(remote, { remoteWins: first && round === 0 });
          const latest = remote.reduce((m, r) => { const t = r.server_at || r.updated_at; return t > m ? t : m; }, meta.lastPullAt || '');
          if (latest) meta.lastPullAt = latest;
          const rows = outgoing();
          if (!rows.length) { conflicts = []; break; }
          const now = new Date().toISOString();
          const res = await adapter.push(rows.map((r) => ({ ...r, updated_at: r.updated_at || now })));
          markPushed(rows, res.saved || {});
          pushed += Object.keys(res.saved || {}).length;
          conflicts = res.conflicts || [];
          if (!conflicts.length) break;               // another device saved first: pull, merge, try again
        }
        if (conflicts.length) throw new Error(`競合が解消できませんでした: ${conflicts.join(', ')}`);
        meta.lastSyncAt = new Date().toISOString();
        saveMeta();
        setStatus('synced');
        const result = { pulled, pushed, first };
        for (const fn of afterSync) { try { fn(result); } catch (e) { console.warn(e); } }
        return result;
      } catch (err) {
        console.warn('同期に失敗しました', err);
        setStatus('error', err);
        return { pulled: 0, pushed: 0, error: String(err?.message || err) };
      } finally { syncing = null; }
    })();
    return syncing;
  }

  let status = 'local';
  function setStatus(s, err) { status = s; emit(err); }
  function emit(err) { for (const fn of listeners) { try { fn({ status, pending: Object.keys(meta.dirtyAt).length, lastSyncAt: meta.lastSyncAt, error: err }); } catch { /* listener */ } } }

  /** Everything in one object — used for the JSON backup and the first upload from the old PC app. */
  function exportAll() {
    const data = {};
    for (const k of keys()) data[k] = raw.getItem(k);
    return { format: 'cyber-study-store', version: 1, exportedAt: new Date().toISOString(), deviceId: meta.deviceId, data };
  }
  function importAll(dump) {
    if (dump?.format !== 'cyber-study-store' || typeof dump.data !== 'object') throw new Error('形式が違います');
    for (const [k, v] of Object.entries(dump.data)) if (!IGNORE(k) && typeof v === 'string') raw.setItem(k, v);
    scan();
  }

  window.CSStore = Object.freeze({
    keys, scan, pendingCount, outgoing, applyRemote, sync, exportAll, importAll,
    get deviceId() { return meta.deviceId; },
    get status() { return status; },
    setAdapter(a) { adapter = a; setStatus(a ? 'ready' : 'local'); },
    registerMerger(key, fn) { mergers.set(key, fn); },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    onSynced(fn) { afterSync.add(fn); return () => afterSync.delete(fn); },
    reset() { meta = { deviceId: meta.deviceId, synced: {}, dirtyAt: {} }; saveMeta(); },
    _hash: hash
  });

  // Sync when the app comes back to the foreground or the network returns.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sync(); else if (adapter) sync(); });
  window.addEventListener('online', () => sync());
})();
