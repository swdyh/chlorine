(function() {
    // *INJECT_USC*

    var Utils = {}
    var Greasemonkey = {}
    Components.utils.import(moduleURL + 'file.jsm', Utils)
    Components.utils.import(moduleURL + 'greasemonkey/userscript.jsm', Greasemonkey)
    Components.utils.import(moduleURL + 'greasemonkey/utils.jsm', Greasemonkey)

    var extDir = Utils.File.getExtDir(appID)
    var extModulesDir = extDir.clone()
    extModulesDir.append('modules')
    extModulesDir.append('ext')
    var ChlorineExt = {}
    Utils.File.entries(extModulesDir).forEach(function(i) {
        Components.utils.import(moduleURL + 'ext/' + i.leafName, ChlorineExt)
    })

    var appcontent = window.document.getElementById("appcontent")
    var contentLoad = function(e) {
        var unsafeWin = e.target.defaultView
        if (unsafeWin.wrappedJSObject) {
            unsafeWin = unsafeWin.wrappedJSObject
        }
        var unsafeLoc = new XPCNativeWrapper(unsafeWin, "location").location
        var href = new XPCNativeWrapper(unsafeLoc, "href").href

        if (Greasemonkey.GM_isGreasemonkeyable(href)) {
            userscriptURLs.forEach(function(i) {
                var source = Greasemonkey.getContents(i)
                var script = Greasemonkey.Script.parse(source, i)
                if (script.matchesURL(href)) {
                    injectScript(source, href, unsafeWin, ChlorineExt)
//                    injectScript(source, href, unsafeWin,
//                                 { Chlorine: ChlorineExt })
                }
            })
        }
    }
    var onLoaded = false
    var onLoad = function() {
        if (appcontent && !onLoaded) {
            onLoaded = true
            appcontent.addEventListener("DOMContentLoaded",
                                        contentLoad, false)
        }
    }
    var onUnLoad = function () {
        window.removeEventListener('load', onLoad, false)
        window.removeEventListener('unload', onUnLoad, false)
        if (appcontent) {
            appcontent.removeEventListener("DOMContentLoaded",
                                           contentLoad, false)
        }
    }
    window.addEventListener('load', onLoad, false)
    window.addEventListener('unload', onUnLoad, false)

    function injectScript(script, url, unsafeContentWin, ext) {
        var safeWin = new XPCNativeWrapper(unsafeContentWin)
        var sandbox = new Components.utils.Sandbox(safeWin)
        sandbox.window = safeWin
        sandbox.document = sandbox.window.document
        sandbox.__proto__ = sandbox.window
        // patch missing properties on xpcnw
        sandbox.XPathResult = Components.interfaces.nsIDOMXPathResult

        // unsafeWIndow
        // sandbox.unsafeWindow = unsafeContentWin

        for (var i in ext) {
            sandbox[i] = ext[i]
        }

        try {
            var code = "(function(){" + script + "})()"
            Components.utils.evalInSandbox(code, sandbox)
        }
        catch (e) {
            var e2 = new Error(typeof e == "string" ? e : e.message)
            e2.fileName = script.filename
            e2.lineNumber = 0
            alert(e2)
        }
    }

    function log() {
        Application.console.log(Array.prototype.slice.call(arguments))
    }
})()
