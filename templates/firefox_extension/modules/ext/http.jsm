var EXPORTED_SYMBOLS = ['HTTP']
var Application = Components.classes["@mozilla.org/fuel/application;1"].getService(Components.interfaces.fuelIApplication)

function clone(obj) {
    var me = arguments.callee
    if (arguments.length == 1) {
        me.prototype = obj
        return new me()
    }
}

function HTTP() {
}
HTTP.request = function(url, callback, options) {
    var opt = options || {}
    var method = opt['method'] || 'GET'

    var request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance()
    request.QueryInterface(Components.interfaces.nsIDOMEventTarget)
    request.addEventListener("load", function(evt) {
        var r = {
            status: request.status,
            responseText: request.responseText,
            responseHeaders: request.getAllResponseHeaders()
        }
        callback.apply(this, [r])
    }, false)
   // request.addEventListener("error", function(evt) { }, false)
    request.QueryInterface(Components.interfaces.nsIXMLHttpRequest)
    request.open(method, url, true)

    if (opt['overrideMimeType']) {
        request.overrideMimeType(opt['overrideMimeType'])
    }

    request.send(null)
}
HTTP.get = function(url, callback, options) {
    var opt = clone(options)
    opt['method'] = 'GET'
    return HTTP.request(url, callback, opt)
}
/*
HTTP.post = function(url, callback, options) {
    var opt = clone(options)
    opt['method'] = 'POST'
    return HTTP.request(url, callback, opt)
}
*/
HTTP.queryString = function(obj) {
    var r = []
    for (var i in obj) {
        r.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]))
    }
    return r.join('&')
}
