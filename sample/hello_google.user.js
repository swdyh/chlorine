// ==UserScript==
// @name           hello google
// @namespace      http://relucks.org/
// @description    hello
// @include        http://www.google.tld/*
// ==/UserScript==

(function() {
    // alert('hello')
    Chlorine.Notification.notify('hello', 'hello')
})()
