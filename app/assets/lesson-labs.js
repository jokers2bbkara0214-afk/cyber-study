/* CYBER STUDY 4.0 - 2026-10-24 incremental, original educational exercises.
 * Additive layer: keeps all existing lessons, galleries, quiz handlers and progress keys.
 * No commands, SQL, or remote services are executed by these visual labs.
 */
(() => {
  'use strict';
  const previousRender = renderTextbook;
  const previousBind = bindTextbook;
  const sequence = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  let search = null;
  const get = id => document.getElementById(id);

  function sourceBadge(id) {
    const images = id === 3 ? 10 : id === 7 ? 8 : 0;
    const label = images ? `関連参考画像 ${images}枚（章単位の対応）` : 'このレッスンに対応する参考画像は未収録';
    return `<aside class="cs4-source" aria-label="教材の出典確認状況"><strong>資料対応：</strong>${label}。元資料との本文・設問の全件照合は未完了。追加演習は独自作成です。</aside>`;
  }
  function binaryLab() {
    return `<section class="cs4-lab" aria-labelledby="cs4-binary-title">
      <span class="cs4-lab-tag">NEW · INTERACTIVE / LESSON 03</span>
      <h3 id="cs4-binary-title">🔢 8ビット変換ラボ</h3>
      <p>10進数を8桁の2進数へ変換し、各桁の重みを確認しよう。8ビットの符号なし整数（0～255）を扱います。</p>
      <form id="cs4-decimal-form" class="cs4-form"><label for="cs4-decimal">10進数</label><input id="cs4-decimal" type="number" min="0" max="255" step="1" value="13" required inputmode="numeric"><button class="btn primary" type="submit">2進数に変換</button></form>
      <div id="cs4-decimal-error" class="cs4-error" role="alert"></div>
      <div class="cs4-bit-grid" id="cs4-bit-grid" role="group" aria-label="8ビットの重みと値"></div>
      <output id="cs4-binary-output" class="cs4-lab-output" aria-live="polite"></output>
      <form id="cs4-binary-form" class="cs4-form"><label for="cs4-binary-input">2進数から逆変換</label><input id="cs4-binary-input" type="text" maxlength="8" inputmode="numeric" placeholder="例：10110" autocomplete="off"><button class="btn" type="submit">10進数に変換</button></form>
      <output id="cs4-reverse-output" class="cs4-feedback" aria-live="polite"></output>
      <p class="helper">例題：19 = 16 + 2 + 1 = 00010011₂。入力値を変えて各桁の重みを確かめよう。</p>
    </section>`;
  }
  function algorithmLab() {
    return `<section class="cs4-lab" aria-labelledby="cs4-search-title">
      <span class="cs4-lab-tag">NEW · INTERACTIVE / LESSON 07</span>
      <h3 id="cs4-search-title">🔎 二分探索ステップ実験</h3>
      <p>昇順に整列済みの10個の数値を使い、探索範囲が半分ずつ狭まる過程を1回ずつ確認できます。</p>
      <div class="cs4-form"><label for="cs4-target">探したい数値</label><select id="cs4-target" class="select">${[23, 2, 91, 40].map(n=>`<option value="${n}">${n}${n===40?'（存在しない例）':''}</option>`).join('')}</select><button type="button" id="cs4-search-reset" class="btn">最初から</button><button type="button" id="cs4-search-step" class="btn primary">次の比較 →</button></div>
      <div class="cs4-search-grid" id="cs4-search-grid" role="group" aria-label="整列済みの数値一覧"></div>
      <output id="cs4-search-output" class="cs4-lab-output" aria-live="polite"></output>
      <ol id="cs4-search-log" class="cs4-search-log" aria-label="比較の履歴"></ol>
      <p class="helper">二分探索は<strong>整列済み</strong>のデータが前提。線形探索は先頭から確認します。どちらもここでは架空の配列だけを操作します。</p>
    </section>`;
  }
  function drawBinary(n) {
    const bits = n.toString(2).padStart(8, '0');
    const weights = [128, 64, 32, 16, 8, 4, 2, 1];
    get('cs4-bit-grid').innerHTML = weights.map((weight, i) =>
      `<div class="cs4-bit ${bits[i]==='1'?'active':''}"><small>重み ${weight}</small><strong>${bits[i]}</strong></div>`).join('');
    const active = weights.filter((_, i) => bits[i] === '1');
    get('cs4-binary-output').textContent = `${n}₁₀ = ${bits}₂ ｜ ${active.length?active.join(' + '):'0'} = ${n}`;
  }
  function bindBinary() {
    const dec = get('cs4-decimal');
    get('cs4-decimal-form').addEventListener('submit', event => {
      event.preventDefault();
      const raw = dec.value.trim();
      const n = Number(raw);
      if (raw === '' || !Number.isInteger(n) || n < 0 || n > 255) {
        get('cs4-decimal-error').textContent = '0～255の整数を入力してください。';
        return;
      }
      get('cs4-decimal-error').textContent = '';
      drawBinary(n);
    });
    get('cs4-binary-form').addEventListener('submit', event => {
      event.preventDefault();
      const raw = get('cs4-binary-input').value.trim();
      if (!/^[01]{1,8}$/.test(raw)) {
        get('cs4-reverse-output').textContent = '1～8桁の0と1だけを入力してください。';
        return;
      }
      const n = parseInt(raw, 2);
      get('cs4-reverse-output').textContent = `${raw}₂ = ${n}₁₀（8ビット表記：${raw.padStart(8,'0')}）`;
      dec.value = String(n);
      get('cs4-decimal-error').textContent = '';
      drawBinary(n);
    });
    drawBinary(13);
  }
  function resetSearch() {
    search = {low:0, high:sequence.length-1, target:Number(get('cs4-target').value), comparisons:0, mid:-1, found:false, done:false, log:[]};
    renderSearch();
  }
  function renderSearch() {
    if (!search) return;
    const {low,high,mid,done,found,target,comparisons} = search;
    get('cs4-search-grid').innerHTML = sequence.map((value, index) => {
      const active = index >= low && index <= high && !done;
      const selected = index === mid;
      const classes = ['cs4-cell',active?'candidate':'',selected?'selected':'',done&&found&&selected?'found':'',!active&&!selected?'excluded':''].join(' ');
      return `<div class="${classes}" aria-label="${index+1}番目、値${value}${selected?'、直近の比較位置':''}"><small>${index+1}番目</small><strong>${value}</strong></div>`;
    }).join('');
    get('cs4-search-step').disabled = done;
    const message = done ? (found ? `発見！ ${target}は${mid+1}番目。${comparisons}回の比較で見つかりました。` : `${target}は存在しません。${comparisons}回比較して探索終了。`)
      : `探す値：${target} ｜ 現在の範囲：${low+1}～${high+1}番目 ｜ 比較回数：${comparisons}`;
    get('cs4-search-output').textContent = message;
    get('cs4-search-log').innerHTML = search.log.map(line=>`<li>${line}</li>`).join('');
  }
  function stepSearch() {
    if (!search || search.done) return;
    if (search.low > search.high) {search.done = true;renderSearch();return;}
    const mid = Math.floor((search.low + search.high)/2);
    const value = sequence[mid];
    search.mid = mid;
    search.comparisons++;
    if (value === search.target) {
      search.done = true; search.found = true;
      search.log.push(`${search.comparisons}回目：中央 ${value} = ${search.target} → 発見`);
    } else if (value < search.target) {
      search.log.push(`${search.comparisons}回目：中央 ${value} < ${search.target} → 右半分を残す`);
      search.low = mid + 1;
    } else {
      search.log.push(`${search.comparisons}回目：中央 ${value} > ${search.target} → 左半分を残す`);
      search.high = mid - 1;
    }
    if (search.low > search.high) search.done = true;
    renderSearch();
  }
  function bindSearch() {
    get('cs4-target').addEventListener('change',resetSearch);
    get('cs4-search-reset').addEventListener('click',resetSearch);
    get('cs4-search-step').addEventListener('click',stepSearch);
    resetSearch();
  }
  renderTextbook = function () {
    const existing = previousRender();
    const lab = lessonId===3 ? binaryLab() : lessonId===7 ? algorithmLab() : '';
    const content = existing.replace('<section class="reference-lessons">', `${lab}<section class="reference-lessons">`);
    return content.replace('<h3>◈ 従来の図解で復習</h3>', `${sourceBadge(lessonId)}<h3>◈ 従来の図解で復習</h3>`);
  };
  bindTextbook = function () {
    previousBind();
    if (lessonId===3 && get('cs4-decimal-form')) bindBinary();
    if (lessonId===7 && get('cs4-search-step')) bindSearch();
  };
  if (page === 'textbook') navigate('textbook');
  window.CS4_LESSON_LABS = Object.freeze({count:2,lessonIds:[3,7]});
})();
