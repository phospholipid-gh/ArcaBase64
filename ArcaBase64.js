// ==UserScript==
// @name         Arca base64 autodecoder
// @version      1.3
// @author       인지질이중층
// @match        https://arca.live/b/*/*
// @run-at       document-end
// ==/UserScript==

const regArr = [
    /(aHR0cDovL|aHR0cHM6Ly)(\w|=|\+|\/)*(?=[^\+=\w\/])/g,
    /(YUhSMGNEb3ZM|YUhSMGNITTZMe)(\w|=|\+|\/)*(?=[^\+=\w\/])/g,
    /(WVVoU01HTkViM1pN|WVVoU01HTklUVFpNZ)(\w|=|\+|\/)*(?=[^\+=\w\/])/g,
]
const regInvalid = /[^\w\+\/=]/;

var Base64 = {
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }

        output = Base64._utf8_decode(output);
        return output;
    },
    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = 0;
        var c1 = 0;
        var c2 = 0;
        var c3 = 0;

        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

var hindex = 0;
var lastSelected = document;
var lastSelectedTime = Date.now();

function createLink(index, url, depth) {
    return '<a href="' + url
           + '">' + index.toString()
           + '번째 링크 (base64 깊이: ' + depth.toString()
           + ')</a>'
}

function replacerGen(numIter) {
    return function(match) {
        try {
            var converted = Base64.decode(match);
            for(var i=0; i<numIter; i++) {
                converted = Base64.decode(converted);
            }
            hindex++;
            return createLink(hindex, converted, numIter+1);
        } catch(e) {
            console.log(e);
            console.log('base64 변환 실패:' + match);
        }
        return '[base64 변환 실패:' + match + ']';
    }
}

function selClicked(event) {
    var sel = document.getSelection().toString();
    if (!sel.match(regInvalid)
        && sel.length >= 10
        && lastSelectedTime + 200 < Date.now()) {
        try {
            var converted = Base64.decode(sel);
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
    for(var i=0; i<3; i++) {
        article.innerHTML = article.innerHTML.replaceAll(regArr[i], replacerGen(i));
    }

    var comments = document.getElementsByClassName("list-area");
    if(comments.length != 0) {
        for(var i=0; i<3; i++) {
            comments[0].innerHTML = comments[0].innerHTML.replaceAll(regArr[i], replacerGen(i));
        }
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
