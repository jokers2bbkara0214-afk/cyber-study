# CYBER STUDY 4.0 Windows インストール版の作り方

このZIPは **インストーラーそのものではなく、Electronアプリのソース一式** です。

## Windows 11 での作成手順

1. このZIPを右クリックして「すべて展開」する。
2. [Node.js LTS](https://nodejs.org/) をインストールする（既に導入済みなら不要）。
3. 展開したフォルダでエクスプローラーのアドレス欄に `powershell` と入力し Enter。
4. 次を実行する。

```powershell
npm install
npm run start
```

5. アプリが開き、71講の目次や演習が動くか確認する。
6. 問題なければ PowerShell で次を実行する。

```powershell
npm run dist:win
```

7. `dist` フォルダ内に `CYBER-STUDY-4.0-Setup-4.0.0.exe` が生成される。

## 注意事項

- npm install時にElectron等をダウンロードするため、インターネット接続が必要。
- 署名なしの自作アプリなので、Windows SmartScreenが警告する場合がある。配布前にはコード署名を推奨。
- ブラウザ版とElectron版ではlocalStorageの保存領域が異なる。**移行前にブラウザ版でバックアップJSONを保存**し、アプリ版で復元すること。
- 元の教材の一部はCDNや外部リンクを利用する可能性があるため、オフライン完全対応は未検証。
- インストーラー生成、Windows 11での起動、71講の実操作、全6機能の回帰テストは未実施。
- この版はユーザー指定の **ALL71-INTEGRATED** がベース。後続の進捗統合版やCBT試作版は含めない。
