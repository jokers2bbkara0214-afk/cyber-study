"""2026-10-25 imported textbook integration + source HTML behavior + legacy regressions.
Browser policy disallows navigation to file:// or localhost; test the production markup/scripts
using DOM injection, then separately execute the imported HTML's actual scripts in Chromium.
"""
from pathlib import Path
import json,re,base64
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
CATALOG=json.loads((ROOT/'assets/imported/catalog.json').read_text(encoding='utf-8'))
assert len(CATALOG)==15

soup=BeautifulSoup((ROOT/'index.html').read_text(encoding='utf-8'),'html.parser')
styles=[el['href'] for el in soup.select('link[rel=stylesheet]')]
scripts=[el['src'] for el in soup.select('script[src]')]
for el in soup.select('script,link[rel=stylesheet]'):el.decompose()
markup=str(soup)
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
        css=re.sub(r'@import\s+url\([^)]*\);','',(ROOT/rel).read_text(encoding='utf-8'))
        page.add_style_tag(content=css)
    for rel in scripts:
        page.add_script_tag(content=(ROOT/rel).read_text(encoding='utf-8'))

def source_html(entry):
    """Inline the exact packaged local dependencies, preserving the original inline JS."""
    source=(ROOT/'lessons'/entry['file']).read_text(encoding='utf-8')
    for rel in ('../assets/imported/common.css','../assets/imported/foundation.css','../assets/imported/cyber-theme.css'):
        pattern=r'<link\s+rel="stylesheet"\s+href="'+re.escape(rel)+r'"\s*/?>'
        source,n=re.subn(pattern,lambda m:'<style>'+ (ROOT/'lessons'/rel).resolve().read_text(encoding='utf-8')+'</style>',source)
        assert n==1,(entry['id'],rel,n)
    for rel in ('../assets/imported/foundation.js','../assets/imported/learning-progress.js','../assets/imported/learning-asides.js'):
        if f'src="{rel}"' not in source:continue
        pattern=r'<script\s+src="'+re.escape(rel)+r'"\s+defer\s*></script>'
        encoded=base64.b64encode((ROOT/'lessons'/rel).resolve().read_bytes()).decode('ascii')
        source,n=re.subn(pattern,lambda m:'<script src="data:text/javascript;base64,'+encoded+'" defer></script>',source)
        assert n==1,(entry['id'],rel,n)
    return source

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1366,'height':900},accept_downloads=True)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    setup(page)
    # Regression: original textbook, all six menu modules, home and legacy widgets retained.
    assert page.locator('#nav .nav-btn').count()==8
    assert page.locator('[data-cs4-import-view]').count()==0
    page.evaluate("navigate('textbook')")
    assert page.locator('[data-cs4-import-view]').count()==2
    assert page.locator('[data-lesson]').count()==14
    assert page.locator('#lessonDone').count()==1
    assert page.locator('.cs4-deep-switch').count()==0
    page.get_by_role('button',name=re.compile('教材本文')).click()
    assert page.locator('#cs4-import-frame').count()==1
    assert page.locator('[data-cs4-import-lesson]').count()==15
    assert page.locator('#cs4-import-frame').get_attribute('src')=='lessons/ch01-1.html'
    assert page.locator('#cs4-import-done').inner_text().find('学習済み')>=0
    page.locator('#cs4-import-done').click()
    assert page.evaluate("state.importedLessons['1-1']") is True
    assert page.locator('#cs4-import-done').inner_text().find('解除')>=0
    page.locator('#cs4-import-next').click()
    assert page.locator('#cs4-import-frame').get_attribute('src')=='lessons/ch01-2.html'
    page.locator('#cs4-import-search').fill('スタック')
    assert page.locator('[data-cs4-import-lesson]').count()==1
    page.locator('[data-cs4-import-lesson]').click()
    assert page.locator('#cs4-import-frame').get_attribute('src')=='lessons/ch02-3.html'
    page.get_by_role('button',name=re.compile('従来の教科書')).click()
    assert page.locator('[data-lesson]').count()==14
    page.evaluate("lessonId=3;navigate('textbook')")
    assert page.locator('.cs4-deep-switch').count()==8
    page.evaluate("navigate('cards')")
    assert page.locator('#flash').count()==1
    page.evaluate("navigate('simulator')")
    assert page.locator('[data-go="sql"]').count()==1
    assert page.locator('[data-go="phantom"]').count()==1
    assert page.locator('[data-go="incident"]').count()==1
    page.evaluate("navigate('notes')")
    assert page.locator('#saveNote').count()==1
    page.evaluate("navigate('history')")
    assert '提供教材の学習記録' in page.locator('#main').inner_text()
    page.evaluate("navigate('exam')")
    assert page.locator('[data-exam-switch]').count()==2
    print('PASS original 6 functions and 14-lesson index preserved; imported 15-lesson navigation/search/mark works')

    # Auxiliary backup includes imported source progress, and 8-bit mission legacy key.
    page.evaluate("localStorage.setItem('apzk-ch01',JSON.stringify({'1-1':true}));localStorage.setItem('cyber-study-lesson03-deep-v1','1');navigate('settings')")
    with page.expect_download() as info: page.locator('#exportData').click()
    path=ROOT/'tests/20261025-test-backup.json'
    info.value.save_as(path)
    backup=json.loads(path.read_text())
    assert backup['state']['importedLessons']['1-1'] is True
    assert backup['auxiliary']['apzk-ch01']=={'1-1':True}
    assert backup['auxiliary']['cyber-study-lesson03-deep-v1']==1
    page.evaluate("state.importedLessons={};persist();localStorage.removeItem('apzk-ch01');localStorage.removeItem('cyber-study-lesson03-deep-v1')")
    page.on('dialog',lambda d:d.accept())
    page.locator('#importData').set_input_files(str(path))
    page.wait_for_function("state.importedLessons?.['1-1']===true")
    assert page.evaluate("JSON.parse(localStorage.getItem('apzk-ch01'))['1-1']") is True
    assert page.evaluate("localStorage.getItem('cyber-study-lesson03-deep-v1')")=='1'
    path.unlink()
    print('PASS import completion and source/8-bit progress roundtrip through JSON backup')
    assert not errors,errors
    print('PASS no uncaught parent JavaScript exceptions')

    # Every imported source page retains original HTML and executes in Chromium.
    for i,entry in enumerate(CATALOG):
        src=source_html(entry)
        child=browser.new_page(viewport={'width':900,'height':800})
        failures=[]
        child.on('pageerror',lambda e:failures.append(str(e)))
        child.set_content('<html><body>placeholder</body></html>')
        child.evaluate(shim)
        child.set_content(src,wait_until='load',timeout=20000)
        assert child.locator('main').count()==1,entry
        assert child.locator('main .section').count()>0,entry
        assert child.locator('svg, button').count()>0,entry
        assert child.locator('link[href^="/ap/"]').count()==0,entry
        assert child.locator('script[src^="/ap/"]').count()==0,entry
        assert not failures,(entry['id'],failures)
        if entry['id']=='1-1':
            assert child.locator('[data-counter-decimal]').inner_text()=='0'
            child.locator('[data-counter-add]').click()
            assert child.locator('[data-counter-decimal]').inner_text()=='1'
            child.locator('[data-counter-add]').click()
            assert child.locator('[data-counter-decimal]').inner_text()=='2'
            child.locator('[data-counter-reset]').click()
            assert child.locator('[data-counter-decimal]').inner_text()=='0'
            child.locator('input.done').check()
            assert child.evaluate("JSON.parse(localStorage.getItem('apzk-ch01'))['s1-1']") is True
        child.close()
    print('PASS all 15 source HTML pages: local dependencies, JS initialization; lesson 1-1 counter and progress checkbox')
    mobile=browser.new_page(viewport={'width':390,'height':844})
    setup(mobile)
    mobile.evaluate("navigate('textbook')")
    mobile.get_by_role('button',name=re.compile('教材本文')).click()
    assert mobile.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    print('PASS imported index at 390px without parent horizontal overflow')
    browser.close()
