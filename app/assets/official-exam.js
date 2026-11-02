/* 2026-10-23 additive layer: six IPA-sourced adapted questions.
   Original 1200-question exam and all existing modules are preserved.
   No external requests are made by this layer. */
(() => {
  'use strict';
  const official = [
    {id:'2025a-2',no:2,topic:'待ち行列',prompt:'M/M/1待ち行列で平均サービス時間がT秒。平均待ち時間がT秒以上になる最小の利用率は何%か。',opts:['33%','50%','67%','80%'],answer:1,why:'待ち時間とサービス時間の比はρ/(1−ρ)。この比が1以上となるのはρ≧0.5なので50%。'},
    {id:'2025a-5',no:5,topic:'OS・メモリ',prompt:'メモリの空き領域を割り当てるベストフィット方式の特徴はどれか。',opts:['低いアドレスから順に割り当てる','要求を満たす最小の空き領域を割り当てる','ハッシュ関数で空き領域を検索する','隣接する空き領域を常に先に結合する'],answer:1,why:'ベストフィットは要求サイズを満たす空き領域の中から最小のものを選ぶ方式。'},
    {id:'2025a-7',no:7,topic:'プログラミング',prompt:'Scalaの特徴として正しいものはどれか。',opts:['オブジェクト指向と関数型の両方を扱える','クラスの多重継承を直接使える','実行前に必ずネイティブコードに変換する','実行時にのみ変数の型が決まる動的型付け言語である'],answer:0,why:'Scalaはオブジェクト指向と関数型の両方をサポートする静的型付け言語。'},
    {id:'2025a-8',no:8,topic:'プロセッサ',prompt:'コンパイル時に複数の独立した動作をまとめ、1つの長い命令語として同時実行を指示する方式はどれか。',opts:['CISC','MIMD','RISC','VLIW'],answer:3,why:'VLIWはコンパイラが並列実行できる複数の動作を長い命令語にまとめる方式。'},
    {id:'2025a-9',no:9,topic:'メモリ',prompt:'画面表示用フレームバッファがユニファイドメモリ方式である場合の特徴はどれか。',opts:['専用のフレームバッファを主記憶と別に備える','主記憶の一部を表示領域として利用する','表示デバイスに描画命令だけを送り続ける','画面の再描画を行う必要がない'],answer:1,why:'ユニファイドメモリ方式では主記憶の一部を表示用に共用する。'},
    {id:'2025a-10',no:10,topic:'計算・センサ',prompt:'1MHzのタイマで隣接するパルス間が10,000カウントだった。軸1回転につき2パルス出るとき、回転数は毎秒何回転か。',opts:['50','100','200','5,000'],answer:0,why:'1秒のパルス数は1,000,000÷10,000＝100。1回転で2パルスなので100÷2＝50回転/秒。'}
  ];
  const source = {
    portal:'https://www.ipa.go.jp/shiken/mondai-kaiotu/2025r07.html',
    question:'https://www.ipa.go.jp/shiken/mondai-kaiotu/nl10bi0000009lh8-att/2025r07a_ap_am_qs.pdf',
    answer:'https://www.ipa.go.jp/shiken/mondai-kaiotu/nl10bi0000009lh8-att/2025r07a_ap_am_ans.pdf'
  };
  let officialMode = false;
  const originalRenderExam = renderExam;
  const originalBindExam = bindExam;
  const originalRenderHistory = renderHistory;
  const html = s => escapeHTML(s);

  function examHeader(){
    return `<div class="official-tabs" role="group" aria-label="問題集の切替"><button type="button" class="btn ${officialMode?'':'primary'}" data-exam-switch="original">オリジナル問題（${questions.length}問）</button><button type="button" class="btn ${officialMode?'primary':''}" data-exam-switch="official">IPA公式問題の改題（${official.length}問）</button></div>`;
  }
  function renderOfficial(){
    const results = state.officialExam || {};
    const attempts = Object.values(results);
    const solved = attempts.filter(x=>x && typeof x.correct==='boolean');
    const right = solved.filter(x=>x.correct).length;
    return pageHeader('IPA OFFICIAL SOURCE · ADAPTED','応用情報技術者 公式問題の改題','2025年度秋期 午前6問を短く改題。オリジナル1200問とは別に管理します。') +
      `<section class="panel"><div class="official-stats"><span>収録 <b>${official.length}問</b></span><span>回答済み <b id="officialAnswered">${solved.length}問</b></span><span>正答 <b id="officialCorrect">${right}問</b></span></div><p class="helper">出典：独立行政法人情報処理推進機構（IPA）「令和7年度秋期 応用情報技術者試験 午前 問2・5・7・8・9・10」（一部改題）。<strong>原文そのままではありません。</strong></p><div class="official-links"><a href="${source.portal}" target="_blank" rel="noopener noreferrer">IPA過去問一覧 ↗</a><a href="${source.question}" target="_blank" rel="noopener noreferrer">問題冊子PDF ↗</a><a href="${source.answer}" target="_blank" rel="noopener noreferrer">公式解答PDF ↗</a></div><p class="helper">全80問・午後問題・年度別検索は未実装です。正答と問題番号はIPA公開PDFと照合済み。</p></section>` +
      official.map((q,i)=>`<section class="panel official-question"><span class="kicker">2025秋 午前 問${q.no} · ${html(q.topic)}</span><h2>Q${i+1}. ${html(q.prompt)}</h2>${q.opts.map((opt,j)=>`<label class="official-choice"><input type="radio" name="official-${q.id}" value="${j}"> ${'アイウエ'[j]} ${html(opt)}</label>`).join('')}<button type="button" class="btn primary" data-grade-official="${q.id}">採点する</button><div id="official-result-${q.id}" class="official-result" role="status" aria-live="polite"></div><p class="helper">出典：令和7年度秋期 午前 問${q.no}（一部改題）</p></section>`).join('');
  }
  renderExam = function(){return examHeader() + (officialMode ? renderOfficial() : originalRenderExam());};
  bindExam = function(){
    document.querySelectorAll('[data-exam-switch]').forEach(b=>b.onclick=()=>{
      officialMode = b.dataset.examSwitch==='official';
      navigate('exam');
    });
    if(!officialMode){originalBindExam();return;}
    document.querySelectorAll('[data-grade-official]').forEach(b=>b.onclick=()=>{
      const q=official.find(x=>x.id===b.dataset.gradeOfficial);
      const picked=document.querySelector(`input[name="official-${q.id}"]:checked`);
      const out=document.getElementById(`official-result-${q.id}`);
      if(!picked){out.textContent='選択肢を選んでください。';return;}
      const correct=Number(picked.value)===q.answer;
      state.officialExam ||= {};
      state.officialExam[q.id]={correct,selected:Number(picked.value),at:new Date().toISOString()};
      persist();logActivity('official-exam',`IPA 2025秋 午前 問${q.no}：${correct?'正解':'不正解'}`);
      const completed=Object.values(state.officialExam).filter(x=>x && typeof x.correct==='boolean');
      document.getElementById('officialAnswered').textContent=`${completed.length}問`;
      document.getElementById('officialCorrect').textContent=`${completed.filter(x=>x.correct).length}問`;
      out.textContent=`${correct?'✓ 正解！':'✕ 不正解。'} 正解：${'アイウエ'[q.answer]} ${q.opts[q.answer]}。${q.why}`;
    });
  };

  // Clearly disclose source-review status without altering any existing lesson or reference image.
  renderHistory = function(){
    const original=originalRenderHistory();
    const day0=new Date();day0.setHours(0,0,0,0);
    const days=Array.from({length:7},(_,i)=>{const d=new Date(day0);d.setDate(d.getDate()-6+i);const end=new Date(d);end.setDate(d.getDate()+1);return {d,count:(state.history||[]).filter(h=>{const t=new Date(h.at);return t>=d&&t<end;}).length};});
    const max=Math.max(1,...days.map(x=>x.count));
    return original + `<section class="panel"><h2>直近7日間の学習操作</h2><div class="official-daily" role="img" aria-label="${days.map(x=>`${x.d.getMonth()+1}月${x.d.getDate()}日 ${x.count}件`).join('、')}">${days.map(x=>`<div class="official-day"><b>${x.count}</b><div class="official-track"><span style="height:${Math.round(x.count/max*100)}%"></span></div><small>${x.d.getMonth()+1}/${x.d.getDate()}</small></div>`).join('')}</div><p class="helper">回答・学習完了などの記録件数です。実際の学習時間ではありません。</p></section>`;
  };
  // The new script is loaded after the original init(). Re-render only the active page.
  if(page==='exam'||page==='textbook'||page==='history')navigate(page);
  window.CS4_OFFICIAL_COUNT=official.length;
})();
