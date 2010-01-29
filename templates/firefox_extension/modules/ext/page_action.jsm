var EXPORTED_SYMBOLS = ['PageAction']

function PageAction(window, contentPath) {
    this.window = window
    this.contentPath = contentPath
    this.onLocationChange = function() {}
}
PageAction.prototype.add = function(opt) {
    var window = this.window
    var urlbar = window.document.getElementById('urlbar-icons')
    var img = window.document.createElement('image')
    img.setAttribute('width', opt['width'] || '16')
    img.setAttribute('height', opt['width'] || '16')
    img.setAttribute('src', this.contentPath + opt['img'])
    img.style.display = 'none'
    urlbar.insertBefore(img, urlbar.firstChild)
    if (opt['click']) {
        var f = function(event) {
            if (!event.button) {
                opt['click'](event)
            }
        }
        img.addEventListener('click', f, false)
    }

    if (opt['popup']) {
        var pu = window.document.createElement('popup')
        var context_id =  opt['id'] + '-context'
        pu.setAttribute('id', context_id)
        opt['popup'].forEach(function(i) {
            var mi = window.document.createElement('menuitem')
            mi.setAttribute('label', i['label'])
            mi.addEventListener('command', i['command'], false)
            pu.appendChild(mi)
        })
        urlbar.appendChild(pu)
        img.setAttribute('context', context_id)
    }
    this.img = img
}
PageAction.prototype.updateImg = function(path) {
    if (this.img) {
        this.img.setAttribute('src', this.contentPath + path)
    }
}
PageAction.prototype.hide = function(path) {
    if (this.img) {
        this.img.style.display = 'none'
    }
}
PageAction.prototype.show = function(path) {
    if (this.img) {
        this.img.style.display = 'block'
    }
}
