/**
 * Parser.js
 *
 * 指令解析模块(v-text,v-html,v-model,v-class,v-on)
 *
 * Created by xiepan on 2017/1/10 下午1:25.
 */
import Updater from "./Updater";
import Watcher from "./Watcher";

var Parsers = {
    text: function (node, vm, exp) {
        this._bind(node, vm, exp, 'text')
    },
    html: function (node, vm, exp) {
        this._bind(node, vm, exp, 'html')
    },
    class: function (node, vm, exp) {
        this._bind(node, vm, exp, 'class')
    },
    model: function (node, vm, exp) {
        this._bind(node, vm, exp, 'model')

        var _this = this,
            val = this._getValue(vm, exp)
        node.addEventListener('input', function (e) {
            var newVal = e.target.value

            if (val === newVal) return

            _this._setValue(vm, exp, newVal)
            val = newVal
        })
    },
    /**
     * 调用 Updater 视图刷新模块并为其创建数据订阅模块
     * @param node
     * @param vm
     * @param exp
     * @param dir
     * @private
     */
    _bind: function (node, vm, exp, dir) {
        console.log('[Parsers] _bind(v-text,v-html,v-class,v-model)')
        // 数据更新函数
        var updaterFn = Updater[dir]

        if (updaterFn) {
            //{node,value}
            // 初始化视图
            updaterFn(node, this._getValue(vm, exp))
            // 创建数据订阅器订阅数据变化，更新视图
            new Watcher(vm, exp, function (val, oldVal) {
                updaterFn(node, val, oldVal)
            })
        }
    }
    ,
    /**
     * 事件处理
     *
     * @param node 节点
     * @param vm Binding实例
     * @param exp 方法名
     * @param dir 指令名称(如：on:click)
     */
    eventHandler: function (node, vm, exp, dir) {
        console.log('[Parsers] eventHandler(v-on:~)')
        // 事件类型，如 click 事件
        var eventType = dir.split(':')[1]
        // 绑定的方法
        var fn = vm.$options.methods && vm.$options.methods[exp]

        // 添加事件监听器
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false)
        } else {
            if (!eventType) {
                console.error('[Binding error] eventType after : is not defined')
            } else {
                console.error('[Binding error] event\'s function or function name is not defined')
            }
        }
    },
    _getValue: function (vm, exp) {
        var val = vm.$data
        exp = exp.split('.')
        exp.forEach(function (key) {
            val = val[key]
        })
        return val
    },
    // 用于监听 input 控件的输入
    _setValue: function (vm, exp, newVal) {
        var val = vm.$data
        exp = exp.split('.')
        //[msg]
        exp.forEach(function (key, index) {
            if (index < exp.length - 1) {
                val = val[key]
            } else {
                val[key] = newVal
            }
        })
    }
}

export default Parsers