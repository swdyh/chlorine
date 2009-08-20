var EXPORTED_SYMBOLS = ['StatusBar']

function StatusBar(window, contentPath) {
    this.window = window
    this.contentPath = contentPath
}
StatusBar.prototype.add = function(opt) {
    var window = this.window
    var status_bar = window.document.getElementById('status-bar')
    var panel = window.document.createElement('statusbarpanel')
    panel.setAttribute('id', opt['id'])
    var img = window.document.createElement('image')
    img.setAttribute('width', opt['width'] || '16')
    img.setAttribute('height', opt['width'] || '16')
    img.setAttribute('src', this.contentPath + opt['img'])
    panel.appendChild(img)
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
        panel.appendChild(pu)
        panel.setAttribute('context', context_id)
    }
    status_bar.appendChild(panel)
    this.img = img
}
StatusBar.prototype.updateImg = function(path) {
    this.img.setAttribute('src', this.contentPath + path)
}
