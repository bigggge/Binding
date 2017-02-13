/**
 * Watcher.js (subscriber)
 *
 * 数据订阅模块（订阅者）
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

// 每个子属性的watcher在添加到子属性的dep的同时，也会添加到父属性的dep
// 监听子属性的同时监听父属性的变更，这样，父属性改变时，子属性的watcher也能收到通知进行update
// 这一步是在 _getValue 里面完成，forEach时会从父级开始取值，间接调用了它的getter
// 触发了bindToDepend(), 在整个forEach过程，当前watcher都会加入到每个父级过程属性的dep
// 例如：当前watcher的是'child.child.name', 那么child, child.child, child.child.name这三个属性的dep都会加入当前watcher

Watcher.prototype = {
    bindToDepend: function (dep) {
        console.log('[Watcher.prototype] addDepend')
        // 假如相应属性的dep.id已经在当前 watcher 的depIds里,则不需要将当前watcher添加到该属性的dep里，
        // 除非是新属性，如this.msg2 = {c: "c"}
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addWatcher(this)
            this.depIds[dep.id] = dep
        }
        console.log('[Watcher.prototype] addDepend', this)
    },
    // 每次调用 update()的时候会触发相应属性的 getter, getter 里面会触发 bindToDepend
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