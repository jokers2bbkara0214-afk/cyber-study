/* E2E sync test (2 devices). Needs: public-site copy on :8766 (no lessons) + `node tools/mock_supabase.js <bucket-dir>` on :8790. */
const { chromium } = require('playwright');
const SITE = 'http://localhost:8766/';
const log = (...a) => console.log(...a);
async function device(browser, name, vp) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_TUNNEL|ERR_FAILED/.test(m.text())) page.errors.push(m.text()); });
  await page.goto(SITE, { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  return { ctx, page, name };
}
async function login(page, pw) {
  await page.evaluate(() => navigate('settings'));
  await page.fill('#cs-email', 'me@example.com'); await page.fill('#cs-password', pw);
  await page.click('#cs-login button[type=submit]');
  await page.waitForTimeout(1500);
}
const notes = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('cyber-study-state-v1') || '{}').notes?.map(n => n.title) || []);
(async () => {
  const browser = await chromium.launch();
  const pc = await device(browser, 'pc', { width: 1440, height: 900 });
  // PC already has study data (e.g. restored from the Windows app backup)
  await pc.page.evaluate(() => { state.notes.push({ id: 'n-pc', title: 'PCのメモ', body: 'サブネット', updatedAt: new Date().toISOString() }); state.cards['bit'] = 'known'; persist(); });
  await pc.page.evaluate(() => navigate('textbook')); await pc.page.waitForTimeout(800);
  log('1 textbook before login shows notice:', await pc.page.evaluate(() => !!document.body.innerText.includes('この端末にはまだ教材がありません')));
  await login(pc.page, 'wrong');
  log('2 wrong password message:', await pc.page.textContent('#cs-login-msg'));
  await pc.page.fill('#cs-password', 'pw'); await pc.page.click('#cs-login button[type=submit]'); await pc.page.waitForTimeout(2000);
  const rows = await (await fetch('http://localhost:8790/__rows', { headers: { authorization: 'Bearer tok' } })).json();
  log('3 server keys after PC login:', rows);
  await pc.page.click('#cs-dl-lessons'); await pc.page.waitForFunction(() => /保存しました|失敗/.test(document.getElementById('cs-sync-msg')?.textContent || ''), null, { timeout: 60000 });
  await pc.page.waitForTimeout(1000); log('4 download:', await pc.page.textContent('#cs-sync-msg'), '|', await pc.page.textContent('#cs-lesson-count'), await pc.page.evaluate(() => CSSync.cachedLessonCount()));
  await pc.page.evaluate(() => navigate('textbook')); await pc.page.waitForTimeout(2000);
  log('5 lesson renders after download:', await pc.page.evaluate(() => { const f = document.getElementById('cs4-import-frame'); const d = f?.contentDocument; return !!d && d.body.innerText.length > 200 && getComputedStyle(d.body).backgroundColor; }));

  const phone = await device(browser, 'phone', { width: 390, height: 844 });
  log('6 phone notes before login:', await notes(phone.page));
  await login(phone.page, 'pw');
  await phone.page.waitForLoadState('networkidle'); await phone.page.waitForTimeout(1500);
  log('7 phone notes after login (expects PCのメモ):', await notes(phone.page), 'cards:', await phone.page.evaluate(() => state.cards));
  // phone studies offline
  await phone.ctx.setOffline(true);
  await phone.page.evaluate(() => { state.notes.push({ id: 'n-ph', title: 'スマホのメモ', body: '電車で', updatedAt: new Date().toISOString() }); persist(); });
  log('8 offline sync result:', await phone.page.evaluate(() => CSStore.sync()));
  await phone.ctx.setOffline(false);
  await phone.page.evaluate(() => window.dispatchEvent(new Event('online'))); await phone.page.waitForTimeout(1500);
  log('9 server has phone note:', (await (await fetch('http://localhost:8790/__rows', { headers: { authorization: 'Bearer tok' } })).json()), 'keys');
  // PC returns to the app
  await pc.page.evaluate(() => CSStore.sync()); await pc.page.waitForLoadState('networkidle'); await pc.page.waitForTimeout(1500);
  log('10 PC notes after phone study:', await notes(pc.page));
  // both edit while offline -> merge
  await pc.ctx.setOffline(true); await phone.ctx.setOffline(true);
  await pc.page.evaluate(() => { state.notes.push({ id: 'n-pc2', title: 'PC オフライン', body: '', updatedAt: new Date().toISOString() }); persist(); });
  await phone.page.evaluate(() => { state.notes.push({ id: 'n-ph2', title: 'スマホ オフライン', body: '', updatedAt: new Date().toISOString() }); persist(); });
  await pc.ctx.setOffline(false); await phone.ctx.setOffline(false);
  await phone.page.evaluate(() => CSStore.sync()); await phone.page.waitForTimeout(800);
  await pc.page.evaluate(() => CSStore.sync()); await pc.page.waitForLoadState('networkidle'); await pc.page.waitForTimeout(1500);
  await phone.page.evaluate(() => CSStore.sync()); await phone.page.waitForLoadState('networkidle'); await phone.page.waitForTimeout(1500);
  log('11 merged PC:', await notes(pc.page)); log('   merged phone:', await notes(phone.page));
  await phone.page.evaluate(() => navigate('settings')); await phone.page.waitForTimeout(500);
  await phone.page.screenshot({ path: process.argv[2] + '/phone-settings.png' });
  log('errors pc:', pc.page.errors, 'phone:', phone.page.errors);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
