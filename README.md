# 通信の最適化チェッカー

http://optimize.orangeliner.net/

携帯電話事業者において通信速度向上等を目的として行われる画像データの非可逆圧縮処理（通信の最適化）の適用状況をチェックするWebツール

- HTTP通信で適用されるケースが多く、HTTPS通信では適用されない。
- 画像ファイルをホスティングしているサーバ側でgzip等の圧縮処理を行っている場合は、適用されないケースがあると思われる。


## スクリーンショット

### 最適化なしの場合
![最適化なし](https://github.com/egamasa/OptimizeChecker/blob/images/optimize_false.jpg)

### 最適化ありの場合
![最適化あり](https://github.com/egamasa/OptimizeChecker/blob/images/optimize_true.jpg)


## 運用時のディレクトリ構成
- Webサーバ
  - .htaccess
  - index.html
  - /assets
    - main.js
    - sha256.js
  - /src
    - fileinfo.json
    - （チェック用画像ファイル群）

### .htaccess 設定内容
- 画像ファイル送信時、gzip圧縮処理を行わない
