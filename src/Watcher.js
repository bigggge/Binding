/**
 * Watcher.js (subscriber)
 *
 * 数据订阅模块
 *
 * Created by xiepan on 2017/1/9 下午1:39.
 */
import Depend from "./Depend";

export default function Watcher(vm, exp, callback) {
    console.log('正在创建[数据订阅器]...', 'vm:', vm, ' expression:', exp, ' callback:', callback)

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
    update: function () {
        console.log('[Watcher.prototype] update')
        var value = this._getValue()
        var oldValue = this.value
        if (value !== oldValue) {
            console.log('[Watcher.prototype] value:', oldValue, '->', value)
            this.value = value
            this.callback.call(this.vm, value, oldValue)
        }
    },
    addDepend: function (dep) {
        console.log('[Watcher.prototype] addDepend')
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addWatcher(this)
            this.depIds[dep.id] = dep
        }
    },
    _beforeGet: function () {
        Depend.watcher = this
        console.log('[Watcher.prototype] _beforeGet watcher', this)
    },
    _getValue: function () {
        this._beforeGet();
        var exp = this.expression.split('.')
        var val = this.vm.$data
        exp.forEach(function (k) {
            val = val[k]
        })
        this._afterGet();
        return val
    },
    _afterGet: function () {
        Depend.watcher = null
    }

}