var EXPORTED_SYMBOLS = ['Notification']

function Notification() {
}
Notification.notify = function(title, text, options) {
    var opt = options || {}
    Components.classes["@mozilla.org/alerts-service;1"].
        getService(Components.interfaces.nsIAlertsService).
        showAlertNotification(opt['imageUrl'], title, text)
}
