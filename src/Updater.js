/**
 * Updater.js
 *
 * 视图刷新模块
 *
 * Created by xiepan on 2017/1/9 下午4:59.
 */

var Updater = {
    text: function (node, value) {
        console.log('[Updater] v-text', value)
        node.textContent = value || ''
    },
    html: function (node, value) {
        console.log('[Updater] v-html', value)
        node.innerHTML = value || ''
    },
    class: function (node, value, oldValue) {
        console.log('[Updater] v-class', oldValue, '->', value)
        var className = node.className
        className = className.replace(oldValue, '').replace(/\s$/, '')

        var space = className && String(value) ? ' ' : ''
        node.className = className + space + value
    },
    model: function (node, value) {
        console.log('[Updater] v-model', value)
        node.value = value || ''
    }
}

export default Updater
