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
// 1. 每次调用update()的时候会触发相应属性的getter
// getter里面会触发dep.depend()，继而触发这里的addDepend

// 2. 假如相应属性的dep.id已经在当前watcher的depIds里，说明不是一个新的属性，仅仅是改变了其值而已
// 则不需要将当前watcher添加到该属性的dep里

// 3. 假如相应属性是新的属性，则将当前watcher添加到新属性的dep里
// 如通过 vm.child = {name: 'a'} 改变了 child.name 的值，child.name 就是个新属性
// 则需要将当前watcher(child.name)加入到新的 child.name 的dep里
// 因为此时 child.name 是个新值，之前的 setter、dep 都已经失效，如果不把 watcher 加入到新的 child.name 的dep中
// 通过 child.name = xxx 赋值的时候，对应的 watcher 就收不到通知，等于失效了

// 4. 每个子属性的watcher在添加到子属性的dep的同时，也会添加到父属性的dep
// 监听子属性的同时监听父属性的变更，这样，父属性改变时，子属性的watcher也能收到通知进行update
// 这一步是在 _getValue 里面完成，forEach时会从父级开始取值，间接调用了它的getter
// 触发了addDepend(), 在整个forEach过程，当前watcher都会加入到每个父级过程属性的dep
// 例如：当前watcher的是'child.child.name', 那么child, child.child, child.child.name这三个属性的dep都会加入当前watcher
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
        console.log('[Watcher.prototype] addDepend', this)
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