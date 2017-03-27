/**
 * Watcher.js (subscriber)
 *
 * 数据订阅模块（订阅者）
 *
 * Created by xiepan on 2017/1/9 下午1:39.
 */
import Depend from "./Depend";

export default function Watcher(vm, exp, callback) {
    console.log('正在创建[数据订阅器 Watcher]...', 'vm:', vm, ' expression:', exp)

    this.vm = vm
    // 数据更新回调函数
    this.callback = callback
    // 表达式
    this.expression = exp
    // 依赖 id
    this.depIds = {}
    this.value = this._getValue()
}

Watcher.prototype = {
    attachTo: function (dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addWatcher(this)
            this.depIds[dep.id] = dep
            console.log('[Watcher.prototype] attachTo(): dep.id is not exist so add watcher:', this)
        } else {
            console.log('[Watcher.prototype] attachTo(): dep.id is exist in depIds')
        }
    },
    // 每次调用 update()的时候会触发相应属性的 getter, getter 里面会触发 bindToDepend
    update: function () {
        console.log('[Watcher.prototype] update()')
        var value = this._getValue()
        var oldValue = this.value
        if (value !== oldValue) {
            console.log('[Watcher.prototype] update(): value:', oldValue, '->', value, '; callback will be call')
            this.value = value
            this.callback.call(this.vm, value, oldValue)
        }
    },
    _getValue: function () {

        Depend.watcher = this

        var exp = this.expression.split('.')
        var val = this.vm.$data
        exp.forEach(function (k) {
            val = val[k]
        })

        Depend.watcher = null

        return val
    }
}