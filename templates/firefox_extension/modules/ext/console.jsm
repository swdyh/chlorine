var EXPORTED_SYMBOLS = ['Console']
var Application = Components.classes["@mozilla.org/fuel/application;1"].getService(Components.interfaces.fuelIApplication)

function Console() {
}
Console.log = function() {
    Application.console.log(Array.prototype.slice.call(arguments))
}
