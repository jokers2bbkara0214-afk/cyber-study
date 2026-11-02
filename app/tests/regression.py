"""2026-10-23 browser-DOM regression of the real integrated 14-lesson mainline.
Chromium URLBlocklist prevents file:// and localhost navigation; production scripts/styles
are injected into about:blank in the same order as index.html. Image files checked on disk.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright, expect
import re, json

ROOT=Path(__file__).resolve().parents[1]
raw=(ROOT/'index.html').read_text()
soup=BeautifulSoup(raw,'html.parser')
styles=[link['href'] for link in soup.select('link[rel=stylesheet]')]
scripts=[el['src'] for el in soup.select('script[src]')]
for el in soup.select('script,link[rel=stylesheet]'): el.decompose()
markup=str(soup)
for rel in styles+scripts: assert (ROOT/rel).is_file(),rel
for f in ROOT.glob('assets/**/*.js'): assert f.stat().st_size>0
reference=list((ROOT/'assets/reference').rglob('*.png'))
assert len(reference)==18,len(reference)
print('PASS all static script/style references + 18 retained reference images')

shim="""() => {
 const data={};
 Object.defineProperty(window,'localStorage',{configurable:true,value:{
   getItem(k){return Object.prototype.hasOwnProperty.call(data,k)?data[k]:null;},
   setItem(k,v){data[k]=String(v)},removeItem(k){delete data[k]},clear(){Object.keys(data).forEach(k=>delete data[k])}
 }});
 window.__testStorage=data;
}"""
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1366,'height':900},accept_downloads=True)
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content(markup)
    page.evaluate(shim)
    for path in styles: page.add_style_tag(content=re.sub(r'@import\s+url\([^)]*\);','',(ROOT/path).read_text()))
    for path in scripts: page.add_script_tag(content=(ROOT/path).read_text())
    assert page.locator('#nav .nav-btn').count()==8
    assert 'CYBER STUDY' in page.title()
    page.screenshot(path=str(ROOT/'tests/mainline-home.png'),full_page=True)
    print('PASS 8 main navigation items and home screen')

    counts=page.evaluate('({cards:CARDS.length,lessons:LESSONS.length,questions:questions.length,sql:SQL_MISSIONS.length,incidents:INCIDENT_SCENARIOS.length,official:CS4_OFFICIAL_COUNT})')
    assert counts=={'cards':66,'lessons':14,'questions':1200,'sql':200,'incidents':3,'official':6},counts
    print('PASS 66 cards / 14 lessons / 1200 original questions / 200 SQL missions / 3 incidents / 6 sourced adapted questions')

    page.evaluate("navigate('cards')")
    assert page.locator('#flash').count()==1
    page.locator('#flash').click()
    assert page.locator('#cardCategory').count()==1
    print('PASS existing flashcards flip and category selector')

    page.evaluate("navigate('textbook')")
    assert page.locator('[data-lesson]').count()==14
    assert '教材照合の進捗：未完了' in page.locator('#main').inner_text()
    page.evaluate("lessonId=3;navigate('textbook')")
    assert page.locator('.reference-lessons img').count()==10
    page.evaluate("lessonId=7;navigate('textbook')")
    assert page.locator('.reference-lessons img').count()==8
    page.screenshot(path=str(ROOT/'tests/mainline-textbook.png'),full_page=True)
    print('PASS existing 14-lesson navigation and 18 reference image tags')

    page.evaluate("navigate('simulator')")
    for mod in ['sql','phantom','terminal','incident','security','dojo']:
        assert page.locator(f'[data-go="{mod}"]').count()>=1,mod
    page.evaluate("navigate('sql')")
    assert page.locator('#sqlEditor').count()==1
    assert page.locator('#missionSelect option').count()==200
    assert page.evaluate("(()=>{try{safeReadSQL33('DELETE FROM customers;');return false}catch{return true}})()")
    assert page.evaluate("safeReadSQL33('SELECT * FROM customers;')")=='SELECT * FROM customers'
    page.evaluate("navigate('incident')")
    assert page.locator('#incidentSelect option').count()==3
    page.locator('#incidentInput').fill('cat .env')
    page.locator('#incidentForm').evaluate('(form)=>form.requestSubmit()')
    page.locator('#incidentInput').fill('fix env API_ULR API_URL')
    page.locator('#incidentForm').evaluate('(form)=>form.requestSubmit()')
    assert 'MISSION CLEAR' in page.locator('#incidentOutput').inner_text()
    assert page.evaluate('JSON.parse(window.__testStorage["cyber-incident-progress-v1"])[0]') is True
    page.evaluate("navigate('phantom')")
    assert page.locator('#main').inner_text().strip()
    page.evaluate("navigate('security')")
    assert page.locator('#main').inner_text().strip()
    print('PASS SQL read-only guard + incident 2-step completion + virtual defense/security entry points')

    page.evaluate("navigate('exam')")
    assert 'オリジナル問題（1200問）' in page.locator('#main').inner_text()
    assert page.locator('#examStart').count()==1
    page.get_by_role('button',name='IPA公式問題の改題（6問）').click()
    assert page.locator('.official-question').count()==6
    for no,correct in [(2,1),(5,1),(7,0),(8,3),(9,1),(10,0)]:
        page.locator(f'input[name="official-2025a-{no}"][value="{correct}"]').check()
        page.locator(f'[data-grade-official="2025a-{no}"]').click()
        assert '正解！' in page.locator(f'#official-result-2025a-{no}').inner_text()
    assert page.evaluate('Object.keys(state.officialExam).length')==6
    page.screenshot(path=str(ROOT/'tests/mainline-ipa.png'),full_page=True)
    page.get_by_role('button',name='オリジナル問題（1200問）').click()
    assert page.locator('#examStart').count()==1
    print('PASS 6 IPA-sourced adapted questions + original 1200-question mode retained')

    page.evaluate("navigate('notes')")
    assert page.locator('#noteTitle').count()==1
    page.locator('#noteTitle').fill('結合テストの学び')
    page.locator('#noteBody').fill('期待値・DB・APIの照合')
    page.locator('#saveNote').click()
    assert '結合テストの学び' in page.locator('#main').inner_text()
    page.evaluate("navigate('history')")
    assert page.locator('.official-day').count()==7
    assert 'IPA 2025秋 午前 問2' in page.locator('#main').inner_text()
    print('PASS note saved + 7-day activity chart + official-exam activity')

    page.evaluate("navigate('settings')")
    assert 'バックアップ' in page.locator('#main').inner_text()
    assert page.evaluate('!!JSON.parse(window.__testStorage["cyber-study-state-v1"]).officialExam')
    page.evaluate("navigate('home')")
    assert page.locator('#nav .nav-btn').count()==8
    print('PASS original state key preserved and 8-menu navigation after operations')

    mobile=browser.new_page(viewport={'width':390,'height':844})
    mobile.set_content(markup);mobile.evaluate(shim)
    for path in styles: mobile.add_style_tag(content=re.sub(r'@import\s+url\([^)]*\);','',(ROOT/path).read_text()))
    for path in scripts: mobile.add_script_tag(content=(ROOT/path).read_text())
    assert mobile.locator('#nav .nav-btn').count()==8
    assert mobile.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    mobile.screenshot(path=str(ROOT/'tests/mainline-mobile.png'),full_page=True)
    print('PASS mobile 390px home without page overflow')
    assert not errors,errors
    print('PASS no uncaught JavaScript exceptions during tested flows')
    browser.close()
