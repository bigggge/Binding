/**
 * Depend.js
 *
 * 依赖收集模块
 *
 * 每个数据拥有一个 Depend 依赖收集器，
 * 用于维护 watchers (订阅者)数组，数据变动触发 notify 方法，
 * 再调用 watchers 的 update 方法
 *
 * Created by xiepan on 2017/1/9 下午3:52.
 */

var id = 0;

export default function Depend(key) {
    console.log('正在创建[依赖收集器]...', 'key', key)
    this.id = id++
    this.watchers = []
    this.watcher = null
}

Depend.prototype = {
    /**
     * 添加订阅者
     *
     * @param watcher
     */
    addWatcher: function (watcher) {
        console.log('[Observer Depend.prototype] addWatcher')
        this.watchers.push(watcher)
    },
    depend: function () {
        console.log('[Observer Depend.prototype] depend')
        Depend.watcher.addDepend(this)
    },
    notify: function () {
        console.log('[Observer Depend.prototype] notify')
        console.log('watchers', this.watchers)
        this.watchers.forEach(function (watcher) {
            watcher.update()
        })
    }
}