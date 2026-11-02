/* CYBER STUDY: install as an app (PWA), offline cache, update banner, sync status label. */
(() => {
  'use strict';

  function banner(text, actionLabel, onAction) {
    let el = document.getElementById('cs-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cs-banner';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = text;
    el.appendChild(span);
    if (actionLabel) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = actionLabel;
      b.onclick = onAction;
      el.appendChild(b);
    }
    el.hidden = false;
  }

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('sw.js');
        let userAskedUpdate = false;
        const offerUpdate = (worker) => banner('新しいバージョンがあります', '更新する', () => { userAskedUpdate = true; worker.postMessage('skip-waiting'); });
        if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const w = reg.installing;
          w?.addEventListener('statechange', () => {
            if (w.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(w);
          });
        });
        let reloaded = false;
        // Reload only when the user pressed "更新する" (not on the very first install).
        navigator.serviceWorker.addEventListener('controllerchange', () => { if (userAskedUpdate && !reloaded) { reloaded = true; location.reload(); } });
        // Check for updates when the app is reopened.
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
      } catch (err) {
        console.warn('オフライン機能を有効にできませんでした', err);
      }
    });
  }

  // Sidebar label: where the data lives and whether it is synced.
  const LABELS = {
    local: '学習データはこの端末に保存',
    ready: '同期の準備ができています',
    syncing: '同期中…',
    synced: '同期済み',
    error: '同期エラー（端末には保存済み）'
  };
  function updateLabel(s) {
    const el = document.querySelector('.side-bottom small');
    if (!el) return;
    const offline = !navigator.onLine ? '・オフライン' : '';
    el.textContent = (LABELS[s.status] || LABELS.local) + offline + (s.pending && s.status !== 'local' ? `（未送信 ${s.pending}）` : '');
  }
  if (window.CSStore) {
    window.CSStore.onChange(updateLabel);
    window.addEventListener('online', () => updateLabel({ status: window.CSStore.status }));
    window.addEventListener('offline', () => updateLabel({ status: window.CSStore.status }));
    document.addEventListener('DOMContentLoaded', () => updateLabel({ status: window.CSStore.status }));
  }
})();
