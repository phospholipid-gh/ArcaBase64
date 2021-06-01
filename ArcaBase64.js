// ==UserScript==
// @name         Arca base64 autodecoder
// @version      1.0
// @author       인지질이중층
// @match        https://arca.live/b/*/*
// @run-at       document-end
// ==/UserScript==

const reghttp = /(aHR0cDovL|aHR0cHM6Ly)(\w|=)*(?=[^=\w])/g;
var hindex = 0;

function createLink(index, url) {
    return '<a href="' + url + '" target="_blank">' + index.toString() + '번째 링크 (base64에서 변환됨)</a>'
}

function replaceCode(match) {
    try {
        var converted = atob(match);
        hindex++;
        return createLink(hindex, converted);
    } catch(e) {
        console.log(e);
        console.log('base64 변환 실패:' + match);
    }
    return match + 'base64 변환 실패.';
}

(function() {
    'use strict';

    var article = document.getElementsByClassName("article-content")[0];
    var comments = document.getElementsByClassName("article-comment")[0];

    article.innerHTML = article.innerHTML.replaceAll(reghttp, replaceCode);
    comments.innerHTML = comments.innerHTML.replaceAll(reghttp, replaceCode);
})();
