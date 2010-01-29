(function() {
    // var appID, appDirName
    // *INJECT_CHLORINE*
    var chromeURL = 'chrome://' + appDirName + '/'
    var moduleURL = 'resource://' + appDirName  + '-modules/'

    var Utils = {}
    Components.utils.import(moduleURL + 'file.jsm', Utils)
    Components.utils.import(moduleURL + 'url_pattern.jsm', Utils)

    var extDir = Utils.File.getExtDir(appID)
    var extModulesDir = extDir.clone()
    extModulesDir.append('modules')
    extModulesDir.append('ext')
    var ChlorineExt = {}
    Utils.File.entries(extModulesDir).forEach(function(i) {
        Components.utils.import(moduleURL + 'ext/' + i.leafName, ChlorineExt)
    })
    ChlorineExt.chlorine = {}
    ChlorineExt.chlorine.statusBar = new ChlorineExt.StatusBar(window, chromeURL + 'content/')
    ChlorineExt.chlorine.pageAction = new ChlorineExt.PageAction(window, chromeURL + 'content/')

    // https://developer.mozilla.org/En/Code_snippets/Progress_Listeners
    var chlorineUrlBarListener = {
        QueryInterface: function(aIID) {
            if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
                aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
                aIID.equals(Components.interfaces.nsISupports))
            return this
            throw Components.results.NS_NOINTERFACE
        },
        onLocationChange: function(aProgress, aRequest, aURI) {
            ChlorineExt.chlorine.pageAction.onLocationChange()
        }
    }

    ChlorineExt.chlorine.pref = new ChlorineExt.Pref(appID)
    ChlorineExt.chlorine.open = function(path) {
        gBrowser.selectedTab = gBrowser.addTab(chromeURL + 'content/' + path)
    }

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

    var initialized = false
    var manifest = ChlorineExt.JSON.parse(Utils.File.read(chromeURL + 'content/manifest.json'))
    var appcontent = window.document.getElementById("appcontent")
    var contentLoad = function(e) {
        if (!initialized) {
            init()
            initialized = true
        }
        var unsafeWin = e.target.defaultView
        if (unsafeWin.wrappedJSObject) {
            unsafeWin = unsafeWin.wrappedJSObject
        }
        var safeWin = new XPCNativeWrapper(unsafeWin)
        var unsafeLoc = new XPCNativeWrapper(unsafeWin, "location").location
        var href = new XPCNativeWrapper(unsafeLoc, "href").href
        var sandbox = new Components.utils.Sandbox(safeWin)
        sandbox.window = safeWin
        sandbox.document = sandbox.window.document
        sandbox.__proto__ = sandbox.window
        sandbox.XPathResult = Components.interfaces.nsIDOMXPathResult
        for (var i in ChlorineExt) {
            sandbox[i] = ChlorineExt[i]
        }

        if (manifest['content_scripts'] &&
            isGreasemonkeyable(href)) {
            var matches = manifest['content_scripts'].map(function(i) {
                return i['matches']
            })
            var up = new Utils.URLPattern(matches)
            up.matches(href).forEach(function(i) {
                var cs = manifest['content_scripts'][i]
                if (cs['js']) {
                    var js = cs['js'].map(function(j) {
                        var url = chromeURL + 'content/' + j
                        return Utils.File.read(url)
                    })
                    injectScripts(js, href, unsafeWin, sandbox)
                }
                if (cs['css']) {
                    var css = cs['css'].map(function(c) {
                        var url = chromeURL + 'content/' + c
                        return Utils.File.read(url)
                    }).join("\n")
                    injectStyleSheet(css, unsafeWin, sandbox)
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
        gBrowser.addProgressListener(chlorineUrlBarListener,
            Components.interfaces.nsIWebProgress.NOTIFY_LOCATION)
    }
    var onUnLoad = function () {
        window.removeEventListener('load', onLoad, false)
        window.removeEventListener('unload', onUnLoad, false)
        if (appcontent) {
            appcontent.removeEventListener("DOMContentLoaded",
                                           contentLoad, false)
        }
        gBrowser.removeProgressListener(chlorineUrlBarListener)
    }
    window.addEventListener('load', onLoad, false)
    window.addEventListener('unload', onUnLoad, false)

    function init() {
        if (manifest['background_script']) {
            var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                .getService(Components.interfaces.mozIJSSubScriptLoader)
            loader.loadSubScript(chromeURL + 'content/' + manifest['background_script'], ChlorineExt)
        }
    }

    function injectScripts(scripts, url, unsafeContentWin, sandbox) {
        scripts.forEach(function(script) {
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
        })
    }

    function injectStyleSheet(stylesheet, unsafeContentWin, sandbox) {
        var style = sandbox.document.createElement('style')
        var text = sandbox.document.createTextNode(stylesheet)
        var head = sandbox.document.getElementsByTagName('head')[0]
        style.appendChild(text)
        if (head) {
            head.appendChild(style)
        }
    }

    function log() {
        Application.console.log(Array.prototype.slice.call(arguments))
    }

    function isGreasemonkeyable(url) {
        var scheme = Components.classes["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService)
            .extractScheme(url);
        return (scheme == "http" || scheme == "https" || scheme == "file" ||
                scheme == "ftp" || url.match(/^about:cache/)) &&
            !/hiddenWindow\.html$/.test(url);
    }
})()
