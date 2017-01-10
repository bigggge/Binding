/**
 * observer.js
 *
 * 数据监听模块
 *
 * Created by xiepan on 2017/1/6 下午4:04.
 */
// var $data = {name: 'ggg'}
// createObserver($data)
// $data.name = '123'
import Depend from "./Depend";

function Observer(data) {
    // 监听对象的变化
    if (typeof data === 'object') {
        console.log('正在创建[事件监听器]...')
        console.log('被监听数据：', data)
        this.$data = data
        this.observeObj(data)
    }
}

Observer.prototype = {
    /**
     * 监听对象的变化
     *
     * @param data
     */
    observeObj: function (data) {
        console.log('[Observer.prototype] observeObj')
        var _this = this
        Object.keys(data).forEach(function (key) {
            _this.defineProperty(_this.$data, key, data[key])
        })
    },
    /**
     * 检测对象的变化 & 依赖收集
     *
     * @param data
     * @param key
     * @param val
     */
    defineProperty: function (data, key, val) {
        var dep = new Depend(key)
        // 嵌套对象
        var childObj = createObserver(val)
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                console.log('[Observer.prototype] defineProperty:Depend.watcher', Depend.watcher)
                if (Depend.watcher) {
                    dep.depend()
                }
                return val
            },
            set: function (newVal) {
                if (newVal === val) {
                    return
                }
                val = newVal
                childObj = createObserver(newVal)
                dep.notify()
            }
        })
    }
}

/**
 * 创建数据监听器
 *
 * @param value
 * @returns {Observer}
 */
export default function createObserver(data) {
    if (data) {
        return new Observer(data)
    }
}
