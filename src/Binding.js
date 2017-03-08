/**
 * Bind.js
 *
 * Created by xiepan on 2017/1/9 上午11:50.
 */
import createCompiler from "./Compiler";
import createObserver from "./Observer";
import Watcher from "./Watcher";

window.Binding = Binding

/**
 * 构造函数入口
 *
 * @param options [数据参数对象]
 * @constructor
 */
function Binding(options) {
    console.log('Binding 正在启动...')
    console.log('数据参数对象:', options)
    this.$options = options
    this.$data = options.data

    var el = document.querySelector(this.$options.el)

    if (!el) {
        console.error('[Binding warn] ' + this.$options.el + ' is not exist')
        return
    }

    // 初始化
    this._init(el)
    // 创建数据监听器(观察者)
    createObserver(this.$data)
    // 创建编译模块
    createCompiler(options, this)
}

var proto = Binding.prototype

proto._init = function (el) {
    var _this = this

    this.$options.el = el

    Object.keys(_this.$data).forEach(function (key) {
        _this._proxy(key)
    })
}

// 代理 this.$data.msg => this.msg
proto._proxy = function (key) {
    console.log('[Binding.prototype] proxy')
    var _this = this
    Object.defineProperty(_this, key,
        {
            configurable: false,
            enumerable: true,
            get: function () {
                return _this.$data[key]
            },
            set: function (newVal) {
                _this.$data[key] = newVal
            }
        }
    )
}
