/**
 * observer.js
 *
 * 数据监听模块(观察者)
 *
 * Created by xiepan on 2017/1/6 下午4:04.
 */
import Depend from "./Depend";

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

function Observer(data) {
    // 监听对象的变化
    if (typeof data === 'object') {
        console.log('正在创建[数据监听器]...')
        console.log('被监听数据：', data)
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
        // 取出data中的所有属性
        Object.keys(data).forEach(function (key) {
            _this.observe(data, key, data[key])
        })
    },
    /**
     * 检测对象的变化 & 依赖收集
     *
     * @param data
     * @param key
     * @param val
     */
    observe: function (data, key, val) {
        var dep = new Depend(key)
        // 嵌套对象
        var childObj = createObserver(val)
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                // 如果当前有 Watcher 就将该 Watcher 添加到dep上
                if (Depend.watcher) {
                    Depend.watcher.bindToDepend(dep)
                }
                return val
            },
            set: function (newVal) {
                if (newVal === val) {
                    return
                }
                val = newVal
                // 新的值是 object 则进行监听
                childObj = createObserver(newVal)
                // 通知所有订阅者
                dep.notify()
            }
        })
    }
}

