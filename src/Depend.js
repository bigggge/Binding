/**
 * Depend.js
 *
 * 依赖收集模块, 订阅者管理器
 *
 * 每个数据拥有一个 Depend 依赖收集器，
 * 用于维护 watchers (订阅者)数组，数据变动触发 notify 方法，
 * 再调用 watchers 的 update 方法
 *
 * Created by xiepan on 2017/1/9 下午3:52.
 */

var id = 0;

export default function Depend(key) {
    console.log('正在创建[依赖收集器 Depend]...', 'key', key)
    this.id = id++
    // 订阅者数组
    this.watchers = []
    this.key = key
}

Depend.prototype = {
    /**
     * 添加订阅者
     *
     * @param watcher
     */
    addWatcher: function (watcher) {
        console.log('[Depend.prototype] addWatcher()')
        console.log(this.watchers)
        this.watchers.push(watcher)
    },
    /**
     * 通知所有 Watcher 并触发回调函数
     */
    notify: function () {
        console.log('[Depend.prototype] notify():', 'watchers', this.watchers)
        this.watchers.forEach(function (watcher) {
            watcher.update()
        })
    }
}