/* CYBER STUDY original lesson 03 extension. Keeps legacy widgets and storage untouched. */
(() => {
  'use strict';
  const oldRender = renderTextbook;
  const oldBind = bindTextbook;
  const weights = [128,64,32,16,8,4,2,1];
  const $ = id => document.getElementById(id);
  const markup = `<section class="cs4-lab cs4-deep" aria-labelledby="cs4-deep-title">
    <span class="cs4-lab-tag">LESSON 03 · HANDS-ON</span>
    <h3 id="cs4-deep-title">💡 ビットを押して、2進数を組み立てよう</h3>
    <p>コンピューターの数字は、0（OFF）と1（ON）の組み合わせ。各桁は右から1、2、4、8…と2倍になります。下の8個のスイッチを押して確かめよう。</p>
    <div class="cs4-deep-powers" aria-label="2進数の位取り">${weights.map(w=>`<span>${w}</span>`).join('')}</div>
    <div class="cs4-deep-switches" role="group" aria-label="8ビット切替スイッチ">${weights.map(w=>`<button type="button" class="cs4-deep-switch" data-cs4-weight="${w}" aria-pressed="false"><small>${w}</small><strong>0</strong><span>OFF</span></button>`).join('')}</div>
    <output id="cs4-deep-result" class="cs4-lab-output" aria-live="polite"></output>
    <div class="cs4-form"><button type="button" class="btn" id="cs4-deep-plus">＋1（繰り上がりを体験）</button><button type="button" class="btn" id="cs4-deep-reset">0に戻す</button></div>
    <p id="cs4-deep-carry" class="cs4-deep-note" aria-live="polite">＋1を押すと、右端のビットから変化します。</p>
    <h4>🎯 ミッション：指定された数を作ろう</h4>
    <p>スイッチを使って、下の目標値と同じ10進数にしてみよう。</p>
    <div class="cs4-deep-target">目標：<strong id="cs4-deep-goal">13</strong> <span id="cs4-deep-stage">1 / 4</span></div>
    <div class="cs4-form"><button type="button" class="btn primary" id="cs4-deep-check">答え合わせ</button><button type="button" class="btn" id="cs4-deep-hint">ヒント</button></div>
    <p id="cs4-deep-feedback" class="cs4-deep-note" role="status"></p>
    <p class="helper">8ビットの符号なし整数として、0〜255を扱います。目標をすべて解くと、このブラウザに達成状況を保存します。</p>
  </section>`;
  renderTextbook = function () {
    const html = oldRender();
    if (lessonId !== 3 || html.includes('id="cs4-deep-title"')) return html;
    const anchor = '<section class="reference-lessons">';
    return html.includes(anchor) ? html.replace(anchor, markup + anchor) : html + markup;
  };
  function bindDeep() {
    const buttons = [...document.querySelectorAll('[data-cs4-weight]')];
    const goals = [13, 42, 128, 255];
    const storageKey = 'cyber-study-lesson03-deep-v1';
    let number = 0, stage = 0;
    try { stage = Math.max(0, Math.min(goals.length, Number(localStorage.getItem(storageKey)) || 0)); } catch {}
    function draw() {
      buttons.forEach(button => {
        const weight = Number(button.dataset.cs4Weight);
        const on = (number & weight) !== 0;
        button.setAttribute('aria-pressed', String(on));
        button.querySelector('strong').textContent = on ? '1' : '0';
        button.querySelector('span').textContent = on ? 'ON' : 'OFF';
      });
      const binary = number.toString(2).padStart(8,'0');
      const selected = weights.filter(w => (number & w) !== 0);
      $('cs4-deep-result').textContent = `${binary}₂ = ${selected.length ? selected.join(' + ') : '0'} = ${number}₁₀`;
      $('cs4-deep-goal').textContent = stage < goals.length ? goals[stage] : '達成！';
      $('cs4-deep-stage').textContent = `${Math.min(stage+1,goals.length)} / ${goals.length}`;
      $('cs4-deep-check').disabled = stage === goals.length;
    }
    buttons.forEach(button => button.addEventListener('click', () => {
      number ^= Number(button.dataset.cs4Weight);
      $('cs4-deep-carry').textContent = '各スイッチのON/OFFが、合計にどう影響するか確認しよう。';
      draw();
    }));
    $('cs4-deep-plus').addEventListener('click', () => {
      const before = number;
      number = (number + 1) % 256;
      const changed = (before ^ number).toString(2).split('1').length - 1;
      $('cs4-deep-carry').textContent = before === 255 ? '255 → 0：8ビットの上限を超えたため、0に戻ります。' : changed > 1 ? `${before} → ${number}：${changed}桁が切り替わりました。1が続くところで繰り上がり！` : `${before} → ${number}：右端のビットが切り替わりました。`;
      draw();
    });
    $('cs4-deep-reset').addEventListener('click', () => { number = 0; $('cs4-deep-carry').textContent = '0に戻しました。'; draw(); });
    $('cs4-deep-hint').addEventListener('click', () => {
      if (stage >= goals.length) return;
      const goal = goals[stage];
      $('cs4-deep-feedback').textContent = `ヒント：${weights.filter(w => (goal & w) !== 0).join(' ＋ ')} をONにしよう。`;
    });
    $('cs4-deep-check').addEventListener('click', () => {
      if (stage >= goals.length) return;
      if (number !== goals[stage]) { $('cs4-deep-feedback').textContent = `今は${number}。目標の${goals[stage]}になるように調整しよう。`; return; }
      stage++;
      try { localStorage.setItem(storageKey, String(stage)); } catch {}
      $('cs4-deep-feedback').textContent = stage === goals.length ? '🎉 全4問クリア！位取りをマスターしたね。' : `正解！ 次は${goals[stage]}を作ろう。`;
      draw();
    });
    draw();
  }
  bindTextbook = function () {
    oldBind();
    if (lessonId === 3 && $('cs4-deep-title')) bindDeep();
  };
  if (page === 'textbook') navigate('textbook');
})();
