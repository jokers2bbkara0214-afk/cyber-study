/* 2026-10-25: imported user-authorized textbook pages. Additive; no original module removed. */

(() => {

  'use strict';

  const catalog = [{"id":"1-1","file":"ch01-1.html","title":"1-1 2進数って何？","chapter":"第1章"},{"id":"1-2","file":"ch01-2.html","title":"1-2 10進数→2進数と16進数","chapter":"第1章"},{"id":"1-3","file":"ch01-3.html","title":"1-3 マイナスの数（2の補数）","chapter":"第1章"},{"id":"1-4","file":"ch01-4.html","title":"1-4 小数のワナと誤差","chapter":"第1章"},{"id":"1-5","file":"ch01-5.html","title":"1-5 論理演算とシフト演算","chapter":"第1章"},{"id":"1-6","file":"ch01-6.html","title":"1-6 デジタル化と情報量","chapter":"第1章"},{"id":"1-7","file":"ch01-7.html","title":"1-7 文字コード","chapter":"第1章"},{"id":"1-8","file":"ch01-8.html","title":"1-8 確率・統計とAIの基礎","chapter":"第1章"},{"id":"1-9","file":"ch01-9.html","title":"1-9 マルチメディアと画面設計","chapter":"第1章"},{"id":"1-10","file":"ch01-10.html","title":"章末仕上げ 一問一答","chapter":"第1章"},{"id":"2-1","file":"ch02-1.html","title":"2-1 アルゴリズムと計算量","chapter":"第2章"},{"id":"2-2","file":"ch02-2.html","title":"2-2 配列とリスト","chapter":"第2章"},{"id":"2-3","file":"ch02-3.html","title":"2-3 スタックとキュー","chapter":"第2章"},{"id":"2-4","file":"ch02-4.html","title":"2-4 木構造","chapter":"第2章"},{"id":"2-5","file":"ch02-5.html","title":"2-5 探索アルゴリズム","chapter":"第2章"},{"id":"2-6","file":"ch02-6.html","title":"2-6 整列アルゴリズム","chapter":"第2章"},{"id":"2-7","file":"ch02-7.html","title":"2-7 擬似言語の読み方","chapter":"第2章"},{"id":"2-8","file":"ch02-8.html","title":"章末仕上げ 一問一答","chapter":"第2章"},{"id":"3-1","file":"ch03-1.html","title":"3-1 CPUの仕組み","chapter":"第3章"},{"id":"3-2","file":"ch03-2.html","title":"3-2 CPUの性能","chapter":"第3章"},{"id":"3-3","file":"ch03-3.html","title":"3-3 メモリとキャッシュ","chapter":"第3章"},{"id":"3-4","file":"ch03-4.html","title":"3-4 OSと仮想記憶","chapter":"第3章"},{"id":"3-5","file":"ch03-5.html","title":"3-5 システム構成","chapter":"第3章"},{"id":"3-6","file":"ch03-6.html","title":"3-6 信頼性の計算","chapter":"第3章"},{"id":"3-7","file":"ch03-7.html","title":"3-7 ハードウェアと組込みシステム","chapter":"第3章"},{"id":"3-8","file":"ch03-8.html","title":"章末仕上げ 一問一答","chapter":"第3章"},{"id":"4-1","file":"ch04-1.html","title":"4-1 関係データベースの基本","chapter":"第4章"},{"id":"4-2","file":"ch04-2.html","title":"4-2 正規化","chapter":"第4章"},{"id":"4-3","file":"ch04-3.html","title":"4-3 SQLの基本","chapter":"第4章"},{"id":"4-4","file":"ch04-4.html","title":"4-4 SQLの応用","chapter":"第4章"},{"id":"4-5","file":"ch04-5.html","title":"4-5 トランザクション","chapter":"第4章"},{"id":"4-6","file":"ch04-6.html","title":"4-6 障害回復","chapter":"第4章"},{"id":"4-7","file":"ch04-7.html","title":"章末仕上げ 一問一答","chapter":"第4章"},{"id":"5-1","file":"ch05-1.html","title":"5-1 ネットワークの全体像","chapter":"第5章"},{"id":"5-2","file":"ch05-2.html","title":"5-2 IPアドレス","chapter":"第5章"},{"id":"5-3","file":"ch05-3.html","title":"5-3 サブネットマスク","chapter":"第5章"},{"id":"5-4","file":"ch05-4.html","title":"5-4 TCPとUDP","chapter":"第5章"},{"id":"5-5","file":"ch05-5.html","title":"5-5 DNS・DHCP・NAT","chapter":"第5章"},{"id":"5-6","file":"ch05-6.html","title":"5-6 アプリのプロトコル図鑑","chapter":"第5章"},{"id":"5-7","file":"ch05-7.html","title":"章末仕上げ 一問一答","chapter":"第5章"},{"id":"6-1","file":"ch06-1.html","title":"6-1 情報セキュリティの3要素","chapter":"第6章"},{"id":"6-2","file":"ch06-2.html","title":"6-2 暗号のしくみ","chapter":"第6章"},{"id":"6-3","file":"ch06-3.html","title":"6-3 デジタル署名とハッシュ","chapter":"第6章"},{"id":"6-4","file":"ch06-4.html","title":"6-4 攻撃手法①","chapter":"第6章"},{"id":"6-5","file":"ch06-5.html","title":"6-5 攻撃手法②","chapter":"第6章"},{"id":"6-6","file":"ch06-6.html","title":"6-6 防御技術","chapter":"第6章"},{"id":"6-7","file":"ch06-7.html","title":"6-7 セキュリティマネジメント","chapter":"第6章"},{"id":"6-8","file":"ch06-8.html","title":"章末仕上げ 一問一答","chapter":"第6章"},{"id":"7-1","file":"ch07-1.html","title":"7-1 開発プロセス","chapter":"第7章"},{"id":"7-2","file":"ch07-2.html","title":"7-2 アジャイル開発","chapter":"第7章"},{"id":"7-3","file":"ch07-3.html","title":"7-3 オブジェクト指向とUML","chapter":"第7章"},{"id":"7-4","file":"ch07-4.html","title":"7-4 モジュール設計","chapter":"第7章"},{"id":"7-5","file":"ch07-5.html","title":"7-5 テスト技法","chapter":"第7章"},{"id":"7-6","file":"ch07-6.html","title":"7-6 テスト工程・レビュー・保守","chapter":"第7章"},{"id":"7-7","file":"ch07-7.html","title":"章末仕上げ 一問一答","chapter":"第7章"},{"id":"8-1","file":"ch08-1.html","title":"8-1 プロジェクトマネジメント","chapter":"第8章"},{"id":"8-2","file":"ch08-2.html","title":"8-2 アローダイアグラム","chapter":"第8章"},{"id":"8-3","file":"ch08-3.html","title":"8-3 コスト管理とEVM","chapter":"第8章"},{"id":"8-4","file":"ch08-4.html","title":"8-4 見積り手法","chapter":"第8章"},{"id":"8-5","file":"ch08-5.html","title":"8-5 サービスマネジメント","chapter":"第8章"},{"id":"8-6","file":"ch08-6.html","title":"8-6 システム監査","chapter":"第8章"},{"id":"8-7","file":"ch08-7.html","title":"章末仕上げ 一問一答","chapter":"第8章"},{"id":"9-1","file":"ch09-1.html","title":"9-1 システム戦略とEA","chapter":"第9章"},{"id":"9-2","file":"ch09-2.html","title":"9-2 調達とIT投資の評価","chapter":"第9章"},{"id":"9-3","file":"ch09-3.html","title":"9-3 経営戦略の基本","chapter":"第9章"},{"id":"9-4","file":"ch09-4.html","title":"9-4 マーケティングとイノベーション","chapter":"第9章"},{"id":"9-5","file":"ch09-5.html","title":"9-5 ビジネスと技術","chapter":"第9章"},{"id":"9-6","file":"ch09-6.html","title":"9-6 企業活動とOR・IE","chapter":"第9章"},{"id":"9-7","file":"ch09-7.html","title":"9-7 会計と財務","chapter":"第9章"},{"id":"9-8","file":"ch09-8.html","title":"9-8 法務と標準化","chapter":"第9章"},{"id":"9-9","file":"ch09-9.html","title":"章末仕上げ 一問一答","chapter":"第9章"}];

  const ids = new Set(catalog.map(x => x.id));

  let importedView = true;

  let current = catalog[0].id;

  let filter = '';

  const previousHome = renderHome;

  const previousHistory = renderHistory;

  const html = escapeHTML;

  const extraKeys = [

    'apzk-ch01', 'apzk-ch02', 'ap-foundation-v1', 'learn-learning-progress-v1',

    'cyber-study-lesson03-deep-v1', 'ap-study-cards-records-v1', 'it-learning-lab-lessons-v1'

  ];

  for (const key of extraKeys) if (!MODULE_PROGRESS_KEYS.includes(key)) MODULE_PROGRESS_KEYS.push(key);



  function completed(){return catalog.filter(x => !!state.importedLessons?.[x.id]).length;}

  function currentEntry(){return catalog.find(x=>x.id===current) || catalog[0];}

function tabs(){

  return '';

}

  function index(){

    const q = filter.trim().toLocaleLowerCase();

    const entries = catalog.filter(x=>!q||(x.id+' '+x.title+' '+x.chapter).toLocaleLowerCase().includes(q));

    const chapters=[...new Set(entries.map(x=>x.chapter))];

    return chapters.map(ch=>`<div class="cs4-import-group">${html(ch)}　${entries.filter(x=>x.chapter===ch).length}講</div>`+

      entries.filter(x=>x.chapter===ch).map(x=>`<button type="button" class="cs4-import-item" data-cs4-import-lesson="${x.id}" aria-current="${current===x.id?'page':'false'}"><b>${html(x.id)}</b><span>${html(x.title.replace(/^\d+-\d+\s*/,''))}</span>${state.importedLessons?.[x.id]?'<i aria-label="学習済み">✓</i>':''}</button>`).join('')).join('') || '<p class="helper">該当する教材はありません。</p>';

  }

  function importedPage(){

    const entry=currentEntry(), pos=catalog.findIndex(x=>x.id===entry.id), done=!!state.importedLessons?.[entry.id];

    return pageHeader('IMPORTED TEXTBOOK / LOCAL HTML','教材本文で学ぶ','提供されたHTML教材を元の文章・SVG図解・操作・問題付きで収録。見た目のみSlate Tealに調整しています。')+tabs()+

      `<div class="cs4-import-grid"><section class="panel"><h2>◫ 教材目次</h2><p class="cs4-import-summary">第1章〜第9章の全71講を収録。各講の操作・演習は順次検証中です。</p>

      <label class="field">教材を検索<input class="input" id="cs4-import-search" placeholder="例：2進数、探索" value="${html(filter)}"></label>

      <div id="cs4-import-list" class="cs4-import-list">${index()}</div></section>

      <section class="panel"><div class="flex space"><span class="pill">${html(entry.id)} / ${catalog.length}講中 ${pos+1}講目</span><span class="pill ${done?'good':'warn'}">${done?'✓ 学習済み':'未学習'}</span></div>

      <h2 style="margin:16px 0">${html(entry.title)}</h2>

      <div class="cs4-import-actions"><button class="btn" id="cs4-import-prev" ${pos===0?'disabled':''}>← 前の教材</button><button class="btn" id="cs4-import-next" ${pos===catalog.length-1?'disabled':''}>次の教材 →</button>

      <button class="btn ${done?'':'success'}" id="cs4-import-done">${done?'✓ 学習済みを解除':'✓ この教材を学習済みにする'}</button>

      <a class="btn" href="lessons/${html(entry.file)}" id="cs4-import-open" target="\_blank" rel="noopener">別タブで開く ↗</a></div>

      <iframe id="cs4-import-frame" class="cs4-import-frame" title="${html(entry.title)} 教材本文" src="lessons/${html(entry.file)}" loading="eager" referrerpolicy="no-referrer"></iframe>

      <p class="cs4-import-status">本文内の「チェック」は原文教材の進捗、上の「学習済み」はCYBER STUDYの記録です。両方のデータは設定のバックアップに含まれます。教材は端末内で動作し、公式過去問の出典検証は別途必要です。</p>

      </section></div>`;

  }

  renderTextbook = function(){

  return importedPage();

};

  function changeCurrent(id){if(!ids.has(id))return;current=id;navigate('textbook');}

  window.cyberStudyImported = {

  catalog,

  openLesson: changeCurrent

};

  bindTextbook = function(){

    document.querySelectorAll('[data-cs4-import-view]').forEach(b=>b.onclick=()=>{

      importedView=b.dataset.cs4ImportView==='imported';navigate('textbook');

    });

// 新71講専用のため、旧教材の操作処理は呼び出さない
    document.querySelectorAll('[data-cs4-import-lesson]').forEach(b=>b.onclick=()=>changeCurrent(b.dataset.cs4ImportLesson));

    // Imported HTML contains links back to its original index.html.
    // Keep navigation inside the 71-lesson application instead.
    const lessonFrame = document.getElementById('cs4-import-frame');
    lessonFrame?.addEventListener('load', () => {
      try {
        const doc = lessonFrame.contentDocument;
        if (!doc) return;
        doc.addEventListener('click', event => {
          const link = event.target.closest?.('a[href]');
          if (!link) return;
          const label = (link.textContent || '').trim();
          const href = link.getAttribute('href') || '';
          if (label.includes('教材一覧') || label.includes('APの目次') ||
              (label.includes('目次') && /(?:^|\/)index\.html(?:[?#]|$)/i.test(href))) {
            event.preventDefault();
            event.stopPropagation();
            // The 71-lesson index is already in the outer pane.
            document.getElementById('cs4-import-search')?.focus();
            document.getElementById('cs4-import-list')?.scrollIntoView({block:'nearest'});
          }
        }, true);
      } catch (error) {
        console.warn('教材内リンクの制御ができませんでした:', error);
      }
    });
    document.getElementById('cs4-import-search').oninput=e=>{

      filter=e.target.value;

      document.getElementById('cs4-import-list').innerHTML=index();

      document.querySelectorAll('[data-cs4-import-lesson]').forEach(b=>b.onclick=()=>changeCurrent(b.dataset.cs4ImportLesson));

    };

    const pos=catalog.findIndex(x=>x.id===current);

    document.getElementById('cs4-import-prev').onclick=()=>changeCurrent(catalog[pos-1]?.id);

    document.getElementById('cs4-import-next').onclick=()=>changeCurrent(catalog[pos+1]?.id);

    document.getElementById('cs4-import-done').onclick=()=>{

      state.importedLessons ||= {};

      const was=!!state.importedLessons[current];

      state.importedLessons[current]=!was;

      persist();logActivity('imported-textbook',`${currentEntry().title}：${was?'学習済み解除':'学習完了'}`);

      navigate('textbook');

    };

  };

  // Clicking original chapter navigation inside the iframe keeps the outer index in sync.

  window.addEventListener('message',e=>{

    const frame=document.getElementById('cs4-import-frame');

    if(!importedView||page!=='textbook'||!frame||e.source!==frame.contentWindow)return;

    if (

  e.data?.type === 'cs4-lesson-progress' &&

  ids.has(e.data.id) &&

  typeof e.data.completed === 'boolean'

) {

  state.importedLessons ||= {};

  state.importedLessons[e.data.id] = e.data.completed;



persist();



const done = e.data.completed;



// 教材一覧のチェックマークを更新

document.querySelectorAll('[data-cs4-import-lesson]').forEach(button => {

  if (button.dataset.cs4ImportLesson !== e.data.id) return;



  const oldMark = button.querySelector('i');

  if (oldMark) oldMark.remove();



  if (done) {

    const mark = document.createElement('i');

    mark.textContent = '✓';

    mark.setAttribute('aria-label', '学習済み');

    button.appendChild(mark);

  }

});



// 教材上部の学習状態を更新

if (e.data.id === current) {

  const status = document.querySelector('.cs4-import-grid .pill.good, .cs4-import-grid .pill.warn');



  if (status) {

    status.textContent = done ? '✓ 学習済み' : '未学習';

    status.classList.toggle('good', done);

    status.classList.toggle('warn', !done);

  }



  const button = document.getElementById('cs4-import-done');



  if (button) {

    button.textContent = done

      ? '✓ 学習済みを解除'

      : '✓ この教材を学習済みにする';



    button.classList.toggle('success', !done);

  }

}



return;

}

    if(e.data?.type==='cs4-imported-lesson'&&ids.has(e.data.id)&&e.data.id!==current){

      current=e.data.id;navigate('textbook');

    }

  });

  renderHome=function(){return previousHome()+`<section class="panel"><h2>📚 提供教材の学習状況</h2><p class="sub">HTML本文 ${catalog.length}講を収録（第1章〜第9章）。手動の学習済み記録：<b>${completed()} / ${catalog.length}</b>。未収録の章は完成扱いにしていません。</p><button class="btn primary" id="cs4-import-home">教材本文を開く →</button></section>`;};

  const previousBindHome=bindHome;

  bindHome=function(){previousBindHome();document.getElementById('cs4-import-home').onclick=()=>{importedView=true;navigate('textbook');};};

  renderHistory=function(){return previousHistory()+`<section class="panel"><h2>📚 提供教材の学習記録</h2><p class="sub">学習済み ${completed()} / ${catalog.length}講。原文教材内のチェック記録は別キーで保存されます。</p></section>`;};

  window.CS4_IMPORTED_LESSONS=Object.freeze({count:catalog.length,ids:catalog.map(x=>x.id)});

  if(['textbook','home','history'].includes(page))navigate(page);

  // CYBER STUDY 4.0：本文チェックの進捗通知

document.addEventListener('change', (event) => {

  const checkbox = event.target;



  if (!checkbox.matches('input.done[data-sec]')) return;



  const filename = location.pathname.split('/').pop();

  const match = filename.match(/^ch(\d+)-(\d+)\.html$/);



  if (!match) return;



  const lessonId = `${Number(match[1])}-${Number(match[2])}`;



  if (window.parent === window) return;



  window.parent.postMessage({

    type: 'cs4-lesson-progress',

    id: lessonId,

    completed: checkbox.checked

  }, '*');

});

})();
