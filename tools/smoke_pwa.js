/* Smoke test: start `python -m http.server 8765` in app/, then `node tools/smoke_pwa.js <screenshot-dir>` */
const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const results = {};
  for (const [name, vp] of [['phone', { width: 390, height: 844 }], ['pc', { width: 1440, height: 900 }]]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: name === 'phone', hasTouch: name === 'phone', deviceScaleFactor: name === 'phone' ? 2 : 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => navigator.serviceWorker.controller || navigator.serviceWorker.ready.then(() => true), null, { timeout: 15000 });
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.screenshot({ path: `${OUT}/${name}-home.png` });
    // store behaviour
    const store = await page.evaluate(() => {
      const before = CSStore.pendingCount();
      localStorage.setItem('cs-test-key', JSON.stringify({ a: 1 }));
      const after = CSStore.pendingCount();
      const dump = CSStore.exportAll();
      localStorage.removeItem('cs-test-key');
      return { before, after, keys: Object.keys(dump.data), label: document.querySelector('.side-bottom small').textContent };
    });
    // textbook + lesson iframe
    await page.evaluate(() => navigate('textbook'));
    await page.waitForTimeout(1500);
    const frameOk = await page.evaluate(() => { const f = document.getElementById('cs4-import-frame'); return !!(f && f.contentDocument && f.contentDocument.body && f.contentDocument.body.innerText.length > 200); });
    await page.screenshot({ path: `${OUT}/${name}-textbook.png` });
    // offline reload
    await page.reload({ waitUntil: 'networkidle' });
    await ctx.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const offlineOk = await page.evaluate(() => !!document.querySelector('#nav .nav-btn') && typeof questions !== 'undefined');
    await page.evaluate(() => navigate('textbook'));
    await page.waitForTimeout(1200);
    const offlineLesson = await page.evaluate(() => { const f = document.getElementById('cs4-import-frame'); return !!(f && f.contentDocument && f.contentDocument.body && f.contentDocument.body.innerText.length > 200); });
    await ctx.setOffline(false);
    const manifest = await page.evaluate(async () => (await fetch('manifest.webmanifest')).ok);
    results[name] = { errors, store, frameOk, offlineOk, offlineLesson, manifest };
    await ctx.close();
  }
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
