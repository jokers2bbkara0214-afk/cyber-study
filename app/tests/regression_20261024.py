"""Incremental regression of 2026-10-24 accessible textbook labs and backup roundtrip.
This test loads the real HTML markup and all production JS/CSS into Chromium DOM;
Chromium policy in this environment prevents file:// and localhost navigation.
"""
from pathlib import Path
import json
import re
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
soup=BeautifulSoup((ROOT/'index.html').read_text(),'html.parser')
styles=[el['href'] for el in soup.select('link[rel=stylesheet]')]
scripts=[el['src'] for el in soup.select('script[src]')]
for el in soup.select('script,link[rel=stylesheet]'): el.decompose()
markup=str(soup)
for f in styles+scripts: assert (ROOT/f).is_file(), f

shim="""() => {
  const data={};
  Object.defineProperty(window,'localStorage',{configurable:true,value:{
    getItem(k){return Object.prototype.hasOwnProperty.call(data,k)?data[k]:null;},
    setItem(k,v){data[k]=String(v)},removeItem(k){delete data[k]},clear(){Object.keys(data).forEach(k=>delete data[k])}
  }});
  window.__testStorage=data;
}"""

def setup(page):
    page.set_content(markup)
    page.evaluate(shim)
    for rel in styles:
        css=re.sub(r'@import\s+url\([^)]*\);','',(ROOT/rel).read_text())
        page.add_style_tag(content=css)
    for rel in scripts: page.add_script_tag(content=(ROOT/rel).read_text())

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1366,'height':900},accept_downloads=True)
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    setup(page)

    # Data preservation / every textbook lesson gets a truthful coverage label.
    counts=page.evaluate('({cards:CARDS.length,lessons:LESSONS.length,questions:questions.length,sql:SQL_MISSIONS.length,incidents:INCIDENT_SCENARIOS.length,official:CS4_OFFICIAL_COUNT,labs:CS4_LESSON_LABS.count})')
    assert counts=={'cards':66,'lessons':14,'questions':1200,'sql':200,'incidents':3,'official':6,'labs':2},counts
    for i in range(1,15):
        page.evaluate(f"lessonId={i};navigate('textbook')")
        assert page.locator('.cs4-source').count()==1,i
        assert page.locator('[data-lesson]').count()==14
        if i in (3,7):
            assert '章単位の対応' in page.locator('.cs4-source').inner_text()
        else:
            assert '参考画像は未収録' in page.locator('.cs4-source').inner_text()
    print('PASS all 14 lessons show source audit and original navigation remains')

    # Binary: boundaries, reverse conversion, invalid input and original lesson exercises.
    page.evaluate("lessonId=3;navigate('textbook')")
    assert page.locator('.reference-lessons img').count()==10
    assert page.locator('[data-bit]').count()==5
    assert page.locator('[data-practice]').count()==6
    assert '00001101₂' in page.locator('#cs4-binary-output').inner_text()
    page.locator('#cs4-decimal').fill('255')
    page.locator('#cs4-decimal-form button').click()
    assert '11111111₂' in page.locator('#cs4-binary-output').inner_text()
    page.locator('#cs4-decimal').fill('0')
    page.locator('#cs4-decimal-form button').click()
    assert '00000000₂' in page.locator('#cs4-binary-output').inner_text()
    page.locator('#cs4-decimal').fill('-1')
    page.locator('#cs4-decimal-form').evaluate('(f)=>f.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))')
    assert '0～255の整数' in page.locator('#cs4-decimal-error').inner_text()
    page.locator('#cs4-decimal').fill('12.5')
    page.locator('#cs4-decimal-form').evaluate('(f)=>f.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))')
    assert '0～255の整数' in page.locator('#cs4-decimal-error').inner_text()
    page.locator('#cs4-binary-input').fill('10110')
    page.locator('#cs4-binary-form button').click()
    assert '22₁₀' in page.locator('#cs4-reverse-output').inner_text()
    page.locator('#cs4-binary-input').fill('102')
    page.locator('#cs4-binary-form button').click()
    assert '0と1だけ' in page.locator('#cs4-reverse-output').inner_text()
    print('PASS 8-bit converter: 0/13/255, decimal invalid, reverse valid/invalid, original quiz and images')

    # Binary search: found and missing values; visual range, reset, existing gallery.
    page.evaluate("lessonId=7;navigate('textbook')")
    assert page.locator('.reference-lessons img').count()==8
    assert page.locator('.cs4-cell').count()==10
    assert page.locator('#cs4-search-output').inner_text().find('比較回数：0')!=-1
    for _ in range(3): page.locator('#cs4-search-step').click()
    assert '23は6番目。3回の比較' in page.locator('#cs4-search-output').inner_text()
    assert page.locator('#cs4-search-step').is_disabled()
    assert page.locator('#cs4-search-log li').count()==3
    page.locator('#cs4-target').select_option('40')
    for _ in range(4): page.locator('#cs4-search-step').click()
    assert '存在しません。4回比較' in page.locator('#cs4-search-output').inner_text()
    assert page.locator('#cs4-search-step').is_disabled()
    page.locator('#cs4-search-reset').click()
    assert '比較回数：0' in page.locator('#cs4-search-output').inner_text()
    assert page.locator('#cs4-search-log li').count()==0
    page.locator('#cs4-target').select_option('91')
    while not page.locator('#cs4-search-step').is_disabled():
        page.locator('#cs4-search-step').click()
    assert '91は10番目' in page.locator('#cs4-search-output').inner_text()
    print('PASS binary-search stepper: found/missing/reset, original lesson images retained')

    # Existing simulator regression: 100 fallback SQL missions and all three incident scenarios.
    sql_results=page.evaluate("""() => SQL_MISSIONS.slice(0,100).map((m,i)=>{
      try{sqlMission=i;const rows=executeStudySQL(m.sql);return missionPass(m.sql,rows,m.test)}
      catch(e){return false}
    })""")
    assert len(sql_results)==100 and all(sql_results),[i+1 for i,x in enumerate(sql_results) if not x]
    page.evaluate("navigate('incident')")
    for incident in range(3):
        page.locator('#incidentSelect').select_option(str(incident))
        commands=page.evaluate(f'INCIDENT_SCENARIOS[{incident}].tasks.map(t=>t.commands[0])')
        for command in commands:
            page.locator('#incidentInput').fill(command)
            page.locator('#incidentForm').evaluate('(f)=>f.requestSubmit()')
        assert 'MISSION CLEAR' in page.locator('#incidentOutput').inner_text(),incident
    assert page.evaluate("Object.values(JSON.parse(window.__testStorage['cyber-incident-progress-v1'])).filter(Boolean).length")==3
    print('PASS 100 fallback SQL model answers and all 3 simulated incident scenarios')

    # Backup roundtrip including official-exam answers and notes.
    page.evaluate("navigate('notes')")
    page.locator('#noteTitle').fill('10月24日保存テスト')
    page.locator('#noteBody').fill('保存→書出し→復元')
    page.locator('#saveNote').click()
    page.evaluate("navigate('exam')")
    page.get_by_role('button',name='IPA公式問題の改題（6問）').click()
    page.locator('input[name="official-2025a-2"][value="1"]').check()
    page.locator('[data-grade-official="2025a-2"]').click()
    page.evaluate("navigate('settings')")
    with page.expect_download() as download_info:
        page.locator('#exportData').click()
    download=download_info.value
    assert download.suggested_filename=='cyber-study-backup.json'
    backup_path=ROOT/'tests/20261024-test-backup.json'
    download.save_as(backup_path)
    backup=json.loads(backup_path.read_text())
    assert backup['version']==2
    assert backup['state']['notes'][0]['title']=='10月24日保存テスト'
    assert backup['state']['officialExam']['2025a-2']['correct'] is True
    assert backup['auxiliary'] is not None
    # Mutate state then restore via the real input handler.
    page.evaluate("state.notes=[];state.officialExam={};persist()")
    page.on('dialog',lambda d:d.accept())
    page.locator('#importData').set_input_files(str(backup_path))
    page.wait_for_function("state.notes.length===1 && !!state.officialExam?.['2025a-2']")
    assert page.evaluate("state.notes[0].title")=='10月24日保存テスト'
    assert page.evaluate("state.officialExam['2025a-2'].correct") is True
    backup_path.unlink()
    print('PASS JSON backup export/import roundtrip: note + sourced exam result + auxiliary included')

    # Mobile checks for new labs (existing home/mobile covered in prior regression).
    mobile=browser.new_page(viewport={'width':390,'height':844})
    setup(mobile)
    for lesson in (3,7):
        mobile.evaluate(f"lessonId={lesson};navigate('textbook')")
        assert mobile.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),f'mobile overflow lesson {lesson}'
    print('PASS 390px mobile textbook labs without document horizontal overflow')
    assert not errors,errors
    print('PASS no uncaught JavaScript errors')
    browser.close()
