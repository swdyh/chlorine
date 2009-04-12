var EXPORTED_SYMBOLS = ['Pref']
var Application = Components.classes["@mozilla.org/fuel/application;1"].getService(Components.interfaces.fuelIApplication)

function Pref(appID) {
    this.prefix = 'extensions.' + appID
}
Pref.prototype.get = function(key) {
    return Application.prefs.getValue(this.prefix + '.' + key, null)
}
Pref.prototype.set = function(key, val) {
    return Application.prefs.setValue(this.prefix + '.' + key, val)
}
