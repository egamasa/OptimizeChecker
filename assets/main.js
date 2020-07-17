/**
 * [OptimizeChecker]{@link https://github.com/egamasa/OptimizeChecker}
 *
 * @version 0.0.1
 * @author egamasa
 * @copyright (c) 2020 egamasa
 * @license MIT
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

const protocol = location.protocol;

const jsonUrl = '//optimize.orangeliner.net/src/fileinfo.json';

const imgList = {
  small: '//optimize.orangeliner.net/src/img_small.jpg',
  middle: '//optimize.orangeliner.net/src/img_middle.jpg',
  large: '//optimize.orangeliner.net/src/img_large.jpg'
};

const protocolList = {
  'http:': 'HTTP',
  'https:': 'HTTPS'
};

// DOM
const errMsg = document.getElementById('errMsg');
const loadIcon = document.getElementById('loadIcon');
const sbjImgArea = document.getElementById('sbjImgArea');
const sbjImg = document.getElementById('sbjImg');
const resultValue = document.getElementById('resultValue');
const resultMsg = document.getElementById('resultMsg');
const resultFalse = document.getElementById('result-false');
const resultTrue = document.getElementById('result-true');

let json;
let values = {};
let optimized = false;

const xhr = new XMLHttpRequest();


window.onload = function () {
  if (protocolList[protocol]) {
    // HTTP<=>HTTPS 切替ボタン
    document.getElementById(`mode${protocolList[protocol]}`).style.display = 'block';
  }
}

/**
 * チェック用画像 取得完了
 */
xhr.onload = function () {
  const imgAb = xhr.response;
  if (imgAb) {
    const imgUnit = new Uint8Array(imgAb);

    // ファイルサイズ
    const imgSize = imgUnit.length;

    // ハッシュ値
    let shaObj = new sha256.create();
    shaObj.update(imgUnit);
    const imgHash = shaObj.hex();

    // 圧縮率
    const compLevel = (imgSize / values['orgSize']) * 100;

    // 最適化あり・なし判定
    // ファイルサイズ or ハッシュ値の不一致
    if (! (imgSize === values['orgSize'] || imgHash === values['orgHash'])) {
      optimized = true;
    }

    values['orgSize'] = `${values['orgSize'].toLocaleString()} byte`;
    values['imgSize'] = `${imgSize.toLocaleString()} byte`;
    values['imgHash'] = imgHash;
    values['compLevel'] = `${compLevel.toFixed(2)} %`;
    values['optimized'] = optimized;

    // Base64エンコードして画像表示
    let imgBin = '';
    for (let i = 0, len = imgUnit.byteLength; i < len; i++) {
      imgBin += String.fromCharCode(imgUnit[i]);
    }
    sbjImg.src = "data:image/jpeg;base64," + window.btoa(imgBin);

    showResult(values);
  }
}

/**
 * チェック実行
 * （テスト実行 ボタン押下）
 */
async function check() {
  hideResult();
  optimized = false;
  values = {};
  let now = new Date();

  // 選択ファイルサイズ取得
  const dataSize = document.getElementById('dataSize').value;
  if (! imgList[dataSize]) {
    showError('不正なパラメータ');
    return;
  }

  // 比較データ取得
  let jsonResponse = await fetch(protocol + jsonUrl);
  if (jsonResponse.ok) {
    json = await jsonResponse.json();
  } else {
    showError('比較データ読込みエラー');
    return;
  }
  values['orgSize'] = json[dataSize].size;
  values['orgHash'] = json[dataSize].sha256;

  // チェック用画像取得
  const imgUrl = protocol + imgList[dataSize] + '?' + now.getTime();
  xhr.open('GET', imgUrl, true);
  xhr.onreadystatechange = function () {
    if(xhr.readyState === XMLHttpRequest.DONE) {
      let status = xhr.status;
      if (status === 0 || (status >= 200 && status < 400)) {
      } else {
        showError('画像データ読込みエラー');
      }
    }
  };
  xhr.responseType = "arraybuffer";
  xhr.setRequestHeader('Pragma', 'no-cache');
  xhr.setRequestHeader('Cache-Control', 'no-cache');
  xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
  xhr.send();
}

/**
 * 結果表示
 * @param values ファイルサイズ・ハッシュ値・最適化有無・圧縮率
 */
function showResult(values) {
  for (let key in values) {
    switch (key) {
      case 'optimized':
        document.getElementById(`result-${values[key].toString()}`).style.display = 'block';
        resultMsg.style.display = 'block';
        continue;
    }
    document.getElementById(key).innerHTML = values[key];
  }
  domDisplay({
    'none': [loadIcon],
    'block': [sbjImgArea, resultValue, resultMsg]
  })
}

/**
 * 結果非表示
 * （2回目以降チェック開始時）
 */
function hideResult() {
  domDisplay({
    'none': [errMsg, sbjImgArea, resultValue, resultMsg, resultFalse, resultTrue],
    'block': [loadIcon]
  })
}

/**
 * エラー表示
 * @param text エラーメッセージ
 */
function showError(text) {
  errMsg.innerHTML = text;
  domDisplay({
    'none': [loadIcon, sbjImgArea, resultValue, resultMsg, resultFalse, resultTrue],
    'block': [errMsg]
  })
}

/**
 * DOM 表示<=>非表示 切替
 * @param hash .style.display<=>DOM 対応
 */
function domDisplay(hash) {
  for (let mode in hash) {
    for (let i = 0, len = hash[mode].length; i < len; i++) {
      hash[mode][i].style.display = mode;
    }
  }
}
