var EXPORTED_SYMBOLS = ['JSON']

var nativeJSON = Components.classes["@mozilla.org/dom/json;1"]
                 .createInstance(Components.interfaces.nsIJSON);
var JSON = {}
JSON.parse = function(str) {
    return nativeJSON.decode(str)
}
JSON.stringify = function(obj) {
    return nativeJSON.encode(obj)
}
