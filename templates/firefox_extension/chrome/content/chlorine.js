(function() {
    // var appID, appDirName
    // *INJECT_CHLORINE*
    var chromeURL = 'chrome://' + appDirName + '/'
    var moduleURL = 'resource://' + appDirName  + '-modules/'

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

    var isGreasemonkeyCompatible = true
    if (isGreasemonkeyCompatible) {
        ChlorineExt.GM_xmlhttpRequest = function(opt) {
            ChlorineExt.HTTP.request(opt['url'], opt['onload'], opt)
        }
        var pref = new ChlorineExt.Pref(appID)
        ChlorineExt.GM_getValue = function(key) {
            return pref.get(key)
        }
        ChlorineExt.GM_setValue = function(key, val) {
            pref.set(key, val)
            return val
        }
        ChlorineExt.GM_log = ChlorineExt.Console.log
        ChlorineExt.GM_registerMenuCommand = function() {}
        ChlorineExt.GM_addStyle = function() {}
        ChlorineExt.GM_getResourceURL = function() {}
        ChlorineExt.console = ChlorineExt.Console
    }

    var manifest = ChlorineExt.JSON.parse(Greasemonkey.getContents(chromeURL + 'content/manifest.json'))

    var appcontent = window.document.getElementById("appcontent")
    var contentLoad = function(e) {
        var unsafeWin = e.target.defaultView
        if (unsafeWin.wrappedJSObject) {
            unsafeWin = unsafeWin.wrappedJSObject
        }
        var unsafeLoc = new XPCNativeWrapper(unsafeWin, "location").location
        var href = new XPCNativeWrapper(unsafeLoc, "href").href

        if (Greasemonkey.GM_isGreasemonkeyable(href)) {
            manifest['content_scripts'].filter(function(i) {
                return !!i['js']
            }).forEach(function(i) {
                i['js'].forEach(function(j) {
                    var script_url = chromeURL + 'content/' + j
                    var source = Greasemonkey.getContents(script_url)
                    var script = Greasemonkey.Script.parse(source, script_url)
                    // FIXME to matches
                    if (script.matchesURL(href)) {
                        injectScript(source, href, unsafeWin, ChlorineExt)
                    }
                })
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
