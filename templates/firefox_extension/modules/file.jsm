var EXPORTED_SYMBOLS = ['File']

var File = {}
File.getExtDir = function(extID) {
    var dir = Components.classes["@mozilla.org/extensions/manager;1"].
        getService(Components.interfaces.nsIExtensionManager).
        getInstallLocation(extID).
        getItemLocation(extID)
    return dir
}
File.entries = function(file) {
    var entries = file.directoryEntries
    var result = []
    while (entries.hasMoreElements()) {
        var entry = entries.getNext()
        entry.QueryInterface(Components.interfaces.nsIFile)
        result.push(entry)
    }
    return result
}
File.read = function(file, opt) {
    var opt = opt || {}
    var charset = opt['charset'] || 'UTF-8'
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
        .getService(Components.interfaces.nsIIOService);
    var scriptableStream = Components
        .classes["@mozilla.org/scriptableinputstream;1"]
        .getService(Components.interfaces.nsIScriptableInputStream);
    var unicodeConverter = Components
        .classes["@mozilla.org/intl/scriptableunicodeconverter"]
        .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    unicodeConverter.charset = charset;

    if (file.match(/^chrome:\/\//)) {
        var channel = ioService.newChannel(file, null, null);
    }
    else {
        var uri = Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService)
            .newFileURI(file);
        var channel = ioService.newChannelFromURI(uri);
    }
    var input = channel.open();
    scriptableStream.init(input);
    var str = scriptableStream.read(input.available());
    scriptableStream.close();
    input.close();
    try {
        return unicodeConverter.ConvertToUnicode(str);
    } catch(e) {
        return str;
    }
}
