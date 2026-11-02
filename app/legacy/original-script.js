
"use strict";
// JavaScriptを厳密にチェックするモード。
// 変数の宣言ミスなどを発見しやすくする。

// ========================================
// ① 学習カードのデータ
// ========================================
// id       : 問題ごとに付ける固有番号
// category : 問題の分野
// question : カード表面の問題文
// answer   : カード裏面の答え
//
// 第3部の問題を追加するときは、
// この配列に新しいデータを追加する。
// idは既存の番号と重複させない。

const cards = [

  // ----------------------------------------
  // 第1部：セキュリティ
  // ----------------------------------------
  { id: 1, category: "セキュリティ", question: "マルウェアとは？", answer: "悪意のあるソフトウェアの総称。" },
  { id: 2, category: "セキュリティ", question: "ランサムウェアとは？", answer: "データを暗号化するなどして、復旧と引き換えに金銭を要求するマルウェア。" },
  { id: 3, category: "セキュリティ", question: "フィッシングとは？", answer: "偽サイトや偽メールなどで個人情報をだまし取る攻撃。" },
  { id: 4, category: "セキュリティ", question: "SQLインジェクションとは？", answer: "不正なSQLを入力して、データベースを不正操作する攻撃。" },
  { id: 5, category: "セキュリティ", question: "XSSとは？", answer: "Webページに悪意のあるスクリプトを混入させ、利用者のブラウザで実行させる攻撃。" },
  { id: 6, category: "セキュリティ", question: "DDoS攻撃とは？", answer: "多数の端末から大量の通信を送り、サービスを利用しにくくする攻撃。" },
  { id: 7, category: "セキュリティ", question: "情報セキュリティのCIAとは？", answer: "機密性・完全性・可用性の3要素。" },

  // ----------------------------------------
  // 第1部：ネットワーク
  // ----------------------------------------
  { id: 8, category: "ネットワーク", question: "IPアドレスとは？", answer: "ネットワーク上で通信先を識別するためのアドレス。" },
  { id: 9, category: "ネットワーク", question: "MACアドレスとは？", answer: "ネットワークインターフェースを識別するためのアドレス。" },
  { id: 10, category: "ネットワーク", question: "DNSとは？", answer: "ドメイン名からIPアドレスなどを調べる仕組み。" },
  { id: 11, category: "ネットワーク", question: "DHCPとは？", answer: "端末にIPアドレスなどのネットワーク設定を自動配布する仕組み。" },
  { id: 12, category: "ネットワーク", question: "TCPとは？", answer: "通信の順序や到達を確認し、信頼性を提供するプロトコル。" },
  { id: 13, category: "ネットワーク", question: "UDPとは？", answer: "到達確認などを基本的に行わず、軽量にデータを送るプロトコル。" },
  { id: 14, category: "ネットワーク", question: "NATとは？", answer: "IPアドレスを変換する技術。" },
  { id: 15, category: "ネットワーク", question: "NAPTとは？", answer: "IPアドレスとポート番号を変換する技術。" },
  { id: 16, category: "ネットワーク", question: "HTTPSとは？", answer: "HTTP通信をTLSなどで保護する仕組み。" },

  // ----------------------------------------
  // 第1部：データベース
  // ----------------------------------------
  { id: 17, category: "データベース", question: "DBMSとは？", answer: "データベースを管理するソフトウェア。" },
  { id: 18, category: "データベース", question: "主キーとは？", answer: "表の各行を一意に識別するためのキー。" },
  { id: 19, category: "データベース", question: "外部キーとは？", answer: "別の表などのキーを参照し、表同士を関連付ける列。" },
  { id: 20, category: "データベース", question: "正規化とは？", answer: "データの重複や更新時の不整合を減らすために表を整理すること。" },
  { id: 21, category: "データベース", question: "SQLとは？", answer: "データベースの検索・追加・更新・削除などを行う言語。" },
  { id: 22, category: "データベース", question: "インデックスとは？", answer: "データ検索を高速化するための索引。" },
  { id: 23, category: "データベース", question: "トランザクションとは？", answer: "一連の処理をひとまとまりとして扱う仕組み。" },
  { id: 24, category: "データベース", question: "ロールバックとは？", answer: "トランザクションの変更を取り消すこと。" },
  { id: 25, category: "データベース", question: "ACID特性とは？", answer: "原子性・一貫性・独立性・永続性の4特性。" },

  // ----------------------------------------
  // 第2部：システムの信頼性
  // ----------------------------------------
  { id: 26, category: "システムの信頼性", question: "MTBFとは？", answer: "平均故障間隔。大きいほど故障しにくい。" },
  { id: 27, category: "システムの信頼性", question: "MTTRとは？", answer: "平均修復時間。小さいほど復旧が速い。" },
  { id: 28, category: "システムの信頼性", question: "稼働率の計算式は？", answer: "MTBF ÷ (MTBF + MTTR)" },
  { id: 29, category: "システムの信頼性", question: "フェールセーフとは？", answer: "故障時に安全な状態へ移行する設計。" },
  { id: 30, category: "システムの信頼性", question: "フェールソフトとは？", answer: "故障時に機能を制限してでも動作を継続する設計。" },
  { id: 31, category: "システムの信頼性", question: "フールプルーフとは？", answer: "利用者の誤操作を防止する設計。" },
  { id: 32, category: "システムの信頼性", question: "RAID 0とは？", answer: "データを複数ディスクに分散して高速化する方式。冗長性はない。" },
  { id: 33, category: "システムの信頼性", question: "RAID 1とは？", answer: "複数ディスクに同じデータを書き込むミラーリング方式。" },
  { id: 34, category: "システムの信頼性", question: "BCPとは？", answer: "災害や障害が起きても重要業務を継続・早期復旧するための計画。" },
  { id: 35, category: "システムの信頼性", question: "RTOとは？", answer: "目標復旧時間。いつまでに業務を復旧させるか。" },
  { id: 36, category: "システムの信頼性", question: "RPOとは？", answer: "目標復旧時点。どの時点のデータまで戻すか。" },

  // ----------------------------------------
  // 第2部：コンピューター
  // ----------------------------------------
  { id: 37, category: "コンピューター", question: "CPUとは？", answer: "命令の解読・実行や装置の制御を行う中央処理装置。" },
  { id: 38, category: "コンピューター", question: "レジスタとは？", answer: "CPU内部にある非常に高速な小容量の記憶装置。" },
  { id: 39, category: "コンピューター", question: "キャッシュメモリとは？", answer: "CPUと主記憶の速度差を補う高速な記憶装置。" },
  { id: 40, category: "コンピューター", question: "DRAMとは？", answer: "定期的なリフレッシュが必要なRAM。主記憶に多く使われる。" },
  { id: 41, category: "コンピューター", question: "SRAMとは？", answer: "リフレッシュが不要な高速RAM。キャッシュに多く使われる。" },
  { id: 42, category: "コンピューター", question: "HDDとSSDの違いは？", answer: "HDDは磁気ディスクを使用。SSDはフラッシュメモリを使用。" },
  { id: 43, category: "コンピューター", question: "仮想記憶とは？", answer: "主記憶と補助記憶を組み合わせ、広い記憶空間を利用できるようにする仕組み。" },
  { id: 44, category: "コンピューター", question: "スラッシングとは？", answer: "ページの入替えが頻発し、処理性能が大きく低下する現象。" },
  { id: 45, category: "コンピューター", question: "スループットとは？", answer: "単位時間当たりに処理できる仕事量。" },
  { id: 46, category: "コンピューター", question: "IaaS・PaaS・SaaSの違いは？", answer: "IaaSは基盤、PaaSは開発・実行環境、SaaSは完成したソフトウェアを提供する。" },

  // ----------------------------------------
  // 第2部：基礎理論
  // ----------------------------------------
  { id: 47, category: "基礎理論", question: "スタックとは？", answer: "後入れ先出し（LIFO）のデータ構造。" },
  { id: 48, category: "基礎理論", question: "キューとは？", answer: "先入れ先出し（FIFO）のデータ構造。" },
  { id: 49, category: "基礎理論", question: "二分探索の条件は？", answer: "データがあらかじめ整列されていること。" },
  { id: 50, category: "基礎理論", question: "教師あり学習とは？", answer: "正解付きのデータを使って機械学習する方法。" },
  { id: 51, category: "基礎理論", question: "教師なし学習とは？", answer: "正解を与えずにデータの特徴や構造を学習する方法。" },
  { id: 52, category: "基礎理論", question: "強化学習とは？", answer: "報酬を手がかりに行動方針を学習する方法。" },
  { id: 53, category: "基礎理論", question: "1バイトは何ビット？", answer: "8ビット。" },
  { id: 54, category: "基礎理論", question: "2進数1011を10進数にすると？", answer: "11。8 + 2 + 1 = 11。" },
  { id: 55, category: "基礎理論", question: "2の補数の作り方は？", answer: "固定したビット幅で全ビットを反転し、1を足す。" },
  { id: 56, category: "基礎理論", question: "XORとは？", answer: "2つのビットが異なるときに1になる排他的論理和。" },
  { id: 57, category: "基礎理論", question: "ハッシュ関数とは？", answer: "データから固定長のハッシュ値を生成する関数。" },

  // ----------------------------------------
  // 第2部：セキュリティ防御
  // ----------------------------------------
  { id: 58, category: "セキュリティ防御", question: "認証とは？", answer: "利用者が本人であることを確認すること。" },
  { id: 59, category: "セキュリティ防御", question: "認可とは？", answer: "利用者が行える操作やアクセス範囲を決めること。" },
  { id: 60, category: "セキュリティ防御", question: "多要素認証とは？", answer: "知識・所持・生体など異なる種類の要素を組み合わせた認証。" },
  { id: 61, category: "セキュリティ防御", question: "共通鍵暗号方式とは？", answer: "暗号化と復号に同じ鍵を使う方式。" },
  { id: 62, category: "セキュリティ防御", question: "公開鍵暗号方式とは？", answer: "公開鍵と秘密鍵のペアを使う暗号方式。" },
  { id: 63, category: "セキュリティ防御", question: "デジタル署名とは？", answer: "署名者の確認とデータの改ざん検知に利用する技術。" },
  { id: 64, category: "セキュリティ防御", question: "TLSとは？", answer: "通信内容の暗号化や通信相手の認証などを行うプロトコル。" },
  { id: 65, category: "セキュリティ防御", question: "IDSとIPSの違いは？", answer: "IDSは侵入を検知・通知し、IPSは侵入を検知・防御する。" },
  { id: 66, category: "セキュリティ防御", question: "WAFとは？", answer: "Webアプリケーションへの攻撃を検査・防御する仕組み。" }
];

// ========================================
// ② 学習記録の保存・読み込み
// ========================================
// 目的：ブラウザを閉じても学習状態を保持する。
//
// localStorage：ブラウザ内にデータを保存する機能。
// 保存先はブラウザ・サイトごとに分かれる。
//
// STORAGE_KEY：保存データに付ける名前。
// 以前の試作版の記録と混ざらないようにする。

const STORAGE_KEY = "ap-study-cards-records-v1";

// 問題IDをキーにして学習状態を保存する。
// 例：{ "1": "覚えた", "2": "苦手" }
let studyRecords = {};

try {
  // 保存された文字列をJavaScriptのデータに戻す。
  const saved = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "{}"
  );

  // 正しい形式のデータなら読み込む。
  if (
    saved &&
    typeof saved === "object" &&
    !Array.isArray(saved)
  ) {
    studyRecords = saved;
  }

} catch (error) {
  // 保存データが壊れていてもアプリを停止させない。
  console.warn("学習記録を読み込めませんでした", error);
}

// ========================================
// ③ 現在の学習状態を管理する変数
// ========================================

// 現在の検索・分野条件に一致する問題一覧
let selectedCards = [];

// 表示している問題の位置。0から始まる。
let index = 0;

// false：問題を表示
// true ：答えを表示
let flipped = false;

// ========================================
// ④ HTML要素を取得する
// ========================================
// 目的：JavaScriptから画面を操作できるようにする。
//
// document.getElementById("ID名")
// → HTMLのidに一致する要素を取得する。

const categorySelect = document.getElementById("category");
const searchInput = document.getElementById("search");
const reviewCheckbox = document.getElementById("reviewMode");

const flashcard = document.getElementById("flashcard");
const cardCategory = document.getElementById("cardCategory");
const cardText = document.getElementById("cardText");
const cardHint = document.getElementById("cardHint");
const counter = document.getElementById("counter");
const studyStatus = document.getElementById("studyStatus");

const weakBtn = document.getElementById("weakBtn");
const learnedBtn = document.getElementById("learnedBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const flipBtn = document.getElementById("flipBtn");

// ========================================
// ⑤ 分野の選択肢を作成する
// ========================================
/**
 * 【目的】
 * cardsに登録されている分野を取得し、
 * 分野選択のプルダウンに追加する。
 *
 * 【使用する処理】
 * map：各カードからcategoryを取り出す。
 * Set：重複している分野名を取り除く。
 * forEach：分野ごとに繰り返し処理する。
 */
function setupCategories() {

  // カード一覧から分野名を取り出し、重複を除く。
  const categories = [
    ...new Set(cards.map(card => card.category))
  ];

  // 分野の数だけ繰り返す。
  categories.forEach(category => {

    // option要素を新しく作る。
    const option = document.createElement("option");

    // 選択されたときに取得する値
    option.value = category;

    // 画面に表示する分野名
    option.textContent = category;

    // selectの中にoptionを追加する。
    categorySelect.appendChild(option);
  });
}

// ========================================
// ⑥ 学習対象のカードを絞り込む
// ========================================
/**
 * 【目的】
 * 分野・検索文字・復習モードの条件に
 * 一致するカードだけを表示対象にする。
 *
 * 【呼び出すタイミング】
 * ・初回表示
 * ・分野変更
 * ・検索文字入力
 * ・復習モード切替
 * ・復習中に「覚えた」を押したとき
 *
 * filter：
 * 条件に一致した要素だけで新しい配列を作る。
 */
function updateSelectedCards() {

  // 現在選択されている分野
  const category = categorySelect.value;

  // 検索文字を取得する。
  // trim：前後の空白を除去
  // toLowerCase：英字を小文字に統一
  const keyword = searchInput.value
    .trim()
    .toLowerCase();

  // 苦手復習モードが有効かどうか
  const reviewOnly = reviewCheckbox.checked;

  // 3つの条件に一致する問題だけ抽出する。
  selectedCards = cards.filter(card => {

    // ① 分野が一致するか
    const categoryMatch =
      category === "all" ||
      card.category === category;

    // ② 問題文または答えに検索文字が含まれるか
    const searchMatch =
      card.question.toLowerCase().includes(keyword) ||
      card.answer.toLowerCase().includes(keyword);

    // ③ 復習モードなら苦手な問題だけ対象にする
    const reviewMatch =
      !reviewOnly ||
      studyRecords[card.id] === "苦手";

    // すべての条件を満たす場合だけ残す。
    return categoryMatch && searchMatch && reviewMatch;
  });
}

// ========================================
// ⑦ 単語カードを画面に表示する
// ========================================
/**
 * 【目的】
 * 現在選択されている問題または答えを表示する。
 *
 * 【呼び出すタイミング】
 * ・初回表示
 * ・前へ／次へ
 * ・カードの表裏切替
 * ・学習記録の変更
 * ・検索条件の変更
 */
function showCard() {

  // 表示できる問題がない場合
  if (selectedCards.length === 0) {

    cardCategory.textContent = "対象なし";
    cardText.textContent = "条件に合う問題がありません";
    cardHint.textContent = "検索や分野を変更してね";
    counter.textContent = "0 / 0";
    studyStatus.textContent = "状態：対象なし";

    // 操作できる問題がないのでボタンを無効化する。
    weakBtn.disabled = true;
    learnedBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    flipBtn.disabled = true;
    flashcard.disabled = true;

    return;
  }

  // 問題数が変化しても範囲外にならないよう調整
  if (index >= selectedCards.length) {
    index = 0;
  }

  if (index < 0) {
    index = selectedCards.length - 1;
  }

  // 現在表示する問題を取得する。
  const card = selectedCards[index];

  // 分野名を表示する。
  cardCategory.textContent = card.category;

  // flippedがtrueなら答え、falseなら問題を表示
  cardText.textContent = flipped
    ? card.answer
    : card.question;

  // カード下部の操作案内
  cardHint.textContent = flipped
    ? "タップして問題に戻る"
    : "タップして答えを見る";

  // 現在位置と対象問題数を表示
  counter.textContent =
    `${index + 1} / ${selectedCards.length}`;

  // 保存済みの学習状態を取得
  const status = studyRecords[card.id] || "未学習";

  studyStatus.textContent = `状態：${status}`;

  // 問題が存在するので各ボタンを有効にする。
  weakBtn.disabled = false;
  learnedBtn.disabled = false;
  prevBtn.disabled = false;
  nextBtn.disabled = false;
  flipBtn.disabled = false;
  flashcard.disabled = false;

  // 表裏の状態に合わせてボタン名を変更
  flipBtn.textContent = flipped
    ? "問題に戻る"
    : "答えを見る";
}

// ========================================
// ⑧ 問題と答えを切り替える
// ========================================
/**
 * 【目的】
 * カードをクリックしたときに表裏を切り替える。
 *
 * !flipped：
 * trueとfalseを反転する。
 */
function flipCard() {

  // 問題がなければ何もしない。
  if (selectedCards.length === 0) return;

  // 表裏を反転
  flipped = !flipped;

  // 新しい状態で画面を更新
  showCard();
}

// ========================================
// ⑨ 次のカードへ移動する
// ========================================
function nextCard() {

  if (selectedCards.length === 0) return;

  // % は余りを求める演算子。
  // 最後の問題の次は最初に戻る。
  index = (index + 1) % selectedCards.length;

  // 次の問題は必ず表面から表示する。
  flipped = false;

  showCard();
}

// ========================================
// ⑩ 前のカードへ移動する
// ========================================
function prevCard() {

  if (selectedCards.length === 0) return;

  // 最初の問題から前へ進むと最後の問題へ移動
  index =
    (index - 1 + selectedCards.length) %
    selectedCards.length;

  flipped = false;

  showCard();
}

// ========================================
// ⑪ 学習状態を保存する
// ========================================
/**
 * 【目的】
 * 「覚えた」「苦手」の結果を保存する。
 *
 * 【引数】
 * status：保存する状態
 * 例："覚えた" または "苦手"
 *
 * 【処理の流れ】
 * ① 現在のカードを取得
 * ② 学習記録を書き換える
 * ③ localStorageへ保存
 * ④ 進捗ダッシュボードを更新
 * ⑤ 必要なら復習対象を更新
 * ⑥ カード表示を更新
 */
function markCard(status) {

  // 問題がなければ処理しない。
  if (selectedCards.length === 0) return;

  // 現在表示しているカードを取得
  const card = selectedCards[index];

  // 問題IDに対応する学習状態を変更
  studyRecords[card.id] = status;

  // ブラウザに保存する。
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(studyRecords)
    );

  } catch (error) {
    console.warn("学習記録を保存できませんでした", error);
    alert("学習記録を保存できませんでした。");
  }

  // 進捗の数字とバーを更新する。
  updateDashboard();

  // 苦手復習中に「覚えた」に変更した場合
  if (reviewCheckbox.checked && status === "覚えた") {

    // 苦手ではなくなった問題を一覧から外す。
    updateSelectedCards();

    // 問題数が減って範囲外になった場合の調整
    if (index >= selectedCards.length) {
      index = 0;
    }

    flipped = false;
  }

  // 最新の学習状態を画面へ反映
  showCard();
}

// ========================================
// ⑫ 学習進捗ダッシュボードを更新する
// ========================================
/**
 * 【目的】
 * 登録問題数・覚えた数・苦手数・達成率を
 * 最新の学習記録に合わせて表示する。
 *
 * 【重要】
 * この関数はHTMLの次のidを使用する。
 *
 * totalCount
 * learnedCount
 * weakCount
 * progressText
 * progressFill
 *
 * HTML側のidと一致していないとエラーになる。
 *
 * 【呼び出すタイミング】
 * ・初回表示
 * ・覚えたボタン押下
 * ・苦手ボタン押下
 */
function updateDashboard() {

  // 登録されている問題の総数
  const total = cards.length;

  // filterで「覚えた」問題だけ抽出し、件数を数える。
  const learned = cards.filter(
    card => studyRecords[card.id] === "覚えた"
  ).length;

  // filterで「苦手」問題だけ抽出し、件数を数える。
  const weak = cards.filter(
    card => studyRecords[card.id] === "苦手"
  ).length;

  // 達成率を計算する。
  // Math.round：小数点以下を四捨五入する。
  // totalが0なら0除算を避ける。
  const percent = total === 0
    ? 0
    : Math.round((learned / total) * 100);

  // HTMLの数字を更新する。
  document.getElementById("totalCount").textContent = total;

  document.getElementById("learnedCount").textContent = learned;

  document.getElementById("weakCount").textContent = weak;

  document.getElementById("progressText").textContent =
    `${percent}%`;

  // CSSのwidthを変更して進捗バーを伸ばす。
  document.getElementById("progressFill").style.width =
    `${percent}%`;
}

// ========================================
// ⑬ 検索・分野・復習モード変更時の処理
// ========================================
/**
 * 【目的】
 * 検索条件が変わったときに
 * 最初の問題から表示し直す。
 */
function refreshCards() {

  // 表示位置を最初に戻す。
  index = 0;

  // 問題の表面に戻す。
  flipped = false;

  // 表示対象のカードを再取得
  updateSelectedCards();

  // 画面を更新
  showCard();
}

// ========================================
// ⑭ ボタンのクリックイベントを登録
// ========================================
// addEventListener：
// 指定した操作が行われたときに処理を実行する。
//
// "click"：クリックやタップで実行する。

// カード本体を押したとき
flashcard.addEventListener("click", flipCard);

// 答えを見るボタン
flipBtn.addEventListener("click", flipCard);

// 次へボタン
nextBtn.addEventListener("click", nextCard);

// 前へボタン
prevBtn.addEventListener("click", prevCard);

// 苦手ボタン
// () => はアロー関数という書き方。
// クリックされたときにmarkCardを呼び出す。
weakBtn.addEventListener("click", () => {
  markCard("苦手");
});

// 覚えたボタン
learnedBtn.addEventListener("click", () => {
  markCard("覚えた");
});

// ========================================
// ⑮ 検索条件の変更イベント
// ========================================

// 分野を変更したとき
categorySelect.addEventListener("change", refreshCards);

// 検索文字を入力したとき
searchInput.addEventListener("input", refreshCards);

// 苦手復習モードを切り替えたとき
reviewCheckbox.addEventListener("change", refreshCards);

// ========================================
// ⑯ キーボード操作
// ========================================
// 目的：パソコンで効率よく学習できるようにする。
//
// →キー：次のカード
// ←キー：前のカード
// Space ：問題と答えを切り替える

document.addEventListener("keydown", event => {

  // 現在操作しているHTML要素の種類を取得
  const tag = document.activeElement?.tagName;

  // 入力欄やボタンを操作している場合は、
  // ショートカット処理を実行しない。
  if (
    tag === "INPUT" ||
    tag === "SELECT" ||
    tag === "BUTTON"
  ) {
    return;
  }

  // 右矢印キー
  if (event.key === "ArrowRight") {
    nextCard();
  }

  // 左矢印キー
  if (event.key === "ArrowLeft") {
    prevCard();
  }

  // スペースキー
  if (event.code === "Space") {

    // スペースキーによる画面スクロールを防止
    event.preventDefault();

    flipCard();
  }
});

// ========================================
// ⑰ アプリ起動時の初期処理
// ========================================
// 【処理順序】
//
// ① 分野の選択肢を作成
// ② 表示するカードを取得
// ③ ダッシュボードを表示
// ④ 最初のカードを表示
//
// この順番で実行することで、
// 起動直後から問題と進捗を表示できる。

setupCategories();
updateSelectedCards();
updateDashboard();
showCard();
