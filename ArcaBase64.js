// ==UserScript==
// @name         Arca base64 autodecoder
// @version      1.0
// @author       인지질이중층
// @match        https://arca.live/b/*/*
// @run-at       document-end
// ==/UserScript==

const regArr = [
    /(aHR0cDovL|aHR0cHM6Ly)(\w|=)*(?=[^=\w])/g,
    /(YUhSMGNEb3ZM|YUhSMGNITTZMe)(\w|=)*(?=[^=\w])/g,
    /(WVVoU01HTkViM1pN|WVVoU01HTklUVFpNZ)(\w|=)*(?=[^=\w])/g,
]
const regInvalid = /[^A-Za-z0-9+\/=]/;

var hindex = 0;
var lastSelected = document;
var lastSelectedTime = Date.now();

function createLink(index, url, depth) {
    return '<a href="' + url
           + '" target="_blank">' + index.toString()
           + '번째 링크 (base64 깊이: ' + depth.toString()
           + ')</a>'
}

function replacerGen(numIter) {
    return function(match) {
        try {
            var converted = atob(match);
            for(var i=0; i<numIter; i++) {
                converted = atob(converted);
            }
            hindex++;
            return createLink(hindex, converted, numIter+1);
        } catch(e) {
            console.log(e);
            console.log('base64 변환 실패:' + match);
        }
        return match + 'base64 변환 실패.';
    }
}

function selClicked(event) {
    var sel = document.getSelection().toString();
    if (!sel.match(regInvalid)
        && sel.length >= 10
        && lastSelectedTime + 100 < Date.now()) {
        try {
            var converted = atob(sel);
        } catch (e) {
            return;
        } finally {
            this.innerHTML = this.innerHTML.replace(sel, converted);
            this.removeEventListener('click', selClicked);
        }
    }
}

(function() {
    'use strict';

    var article = document.getElementsByClassName("article-content")[0];
    var comments = document.getElementsByClassName("list-area")[0];

    for(var i=0; i<3; i++) {
        article.innerHTML = article.innerHTML.replaceAll(regArr[i], replacerGen(i));
        comments.innerHTML = comments.innerHTML.replaceAll(regArr[i], replacerGen(i));
    }

    document.addEventListener('selectionchange', function() {
        var sel = document.getSelection().anchorNode;
        if(sel) {
            sel = sel.parentElement;
            if(sel != lastSelected) {
                lastSelected.removeEventListener('click', selClicked);
                sel.addEventListener('click', selClicked);
                lastSelected = sel;
                lastSelectedTime = Date.now();
            }
        }
    })
})();
