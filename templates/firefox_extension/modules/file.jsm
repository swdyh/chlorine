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
