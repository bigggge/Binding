(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _Compiler = require("./Compiler");

var _Compiler2 = _interopRequireDefault(_Compiler);

var _Observer = require("./Observer");

var _Observer2 = _interopRequireDefault(_Observer);

var _Watcher = require("./Watcher");

var _Watcher2 = _interopRequireDefault(_Watcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.Binding = Binding;

/**
 * 构造函数入口
 *
 * @param options [数据参数对象]
 * @constructor
 */
/**
 * Bind.js
 *
 * Created by xiepan on 2017/1/9 上午11:50.
 */
function Binding(options) {
    console.log('Binding 正在启动...');
    console.log('数据参数对象:', options);
    this.$options = options;
    this.$data = options.data;

    var el = document.querySelector(this.$options.el);

    if (!el) {
        console.error('[Binding warn] ' + this.$options.el + ' is not exist');
        return;
    }

    // 初始化
    this._init(el);
    // 创建数据监听器(观察者)
    (0, _Observer2.default)(this.$data);
    // 创建编译模块
    (0, _Compiler2.default)(options, this);
}

var proto = Binding.prototype;

proto._init = function (el) {
    var _this = this;

    this.$options.el = el;

    Object.keys(_this.$data).forEach(function (key) {
        _this._proxy(key);
    });
};
proto.$watch = function (key, cb) {
    new _Watcher2.default(this, key, cb);
};

// 代理 this.$data.msg => this.msg
proto._proxy = function (key) {
    console.log('[Binding.prototype] proxy');
    var _this = this;
    Object.defineProperty(_this, key, {
        configurable: false,
        enumerable: true,
        get: function get() {
            return _this.$data[key];
        },
        set: function set(newVal) {
            _this.$data[key] = newVal;
        }
    });
};

},{"./Compiler":2,"./Observer":4,"./Watcher":7}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = createCompiler;

var _Parser = require('./Parser');

var _Parser2 = _interopRequireDefault(_Parser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Compiler(options, vm) {
    console.log('正在创建[指令解析器]...');
    console.log('数据参数对象:', options, 'Binding 实例', vm);

    var el = options.el;
    this.$el = isElementNode(el) ? el : document.querySelector(el);
    this.$data = options.$data;
    this.$vm = vm;
    this.mount();
} /**
   * compile.js
   *
   * 编译模块
   *
   * Created by xiepan on 2017/1/9 上午10:12.
   */


Compiler.prototype = {
    mount: function mount() {
        var fragment = node2Fragment(this.$el);
        this.compile(fragment);
        this.$el.appendChild(fragment);
    },

    compile: function compile(el) {
        console.log('[Compiler.prototype] 开始解析(compile)', el);
        // Node.childNodes 返回包含指定节点的子节点的集合
        // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/childNodes
        // ParentNode.children 是一个只读属性，返回一个包含当前元素的子元素的集合
        // https://developer.mozilla.org/zh-CN/docs/Web/API/ParentNode/children
        var childNodes = el.childNodes,
            _this = this;
        Array.prototype.slice.call(childNodes).forEach(function (node) {
            var text = node.textContent;
            var mustacheRe = /\{\{(.*)\}\}/;

            // 元素
            if (isElementNode(node)) {
                _this.parse(node);
                // 文本
            } else if (isTextNode(node) && mustacheRe.test(text)) {
                _this.parseText(node, RegExp.$1);
            }
            // 子节点
            if (node.childNodes && node.childNodes.length > 0) {
                _this.compile(node);
            }
        });
    },
    /**
     * 解析元素节点
     *
     * @param node
     */
    parse: function parse(node) {
        console.log('[Compiler.prototype] 解析元素节点(parse)');
        var nodeAttrs = node.attributes,
            _this = this;

        // 处理指令
        Array.prototype.slice.call(nodeAttrs).forEach(function (attr) {
            var attrName = attr.name;
            if (isDirective(attrName)) {
                // 指令值
                var expression = attr.value;
                // 指令类型
                var directive = attrName.substring(2);
                // 是事件指令
                if (isEventDirective(directive)) {
                    _Parser2.default._eventHandler(node, _this.$vm, expression, directive);
                } else {
                    // 其他指令
                    if (_Parser2.default[directive]) {
                        _Parser2.default[directive](node, _this.$vm, expression);
                    } else {
                        console.error('[Binding error] v-' + directive + ' is not supported');
                    }
                }
            }
        });
    },
    parseText: function parseText(node, exp) {
        console.log('[Compiler.prototype] 解析元素节点(parseText)');
        _Parser2.default.text(node, this.$vm, exp);
    }
};

/**
 * element 的子节点转换成文档片段
 *
 * DocumentFragments 是一些DOM节点。它们不是DOM树的一部分。
 * 在DOM树中，文档片段会被替换为它所有的子元素。
 * 因为文档片段存在与内存中，并不在DOM树中，
 * 所以将子元素插入到文档片段时不会引起页面回流(reflow)(对元素位置和几何上的计算)，可以优化性能。
 *
 * @param el
 * @returns {DocumentFragment}
 */
function node2Fragment(el) {
    var fragment = document.createDocumentFragment();
    var child;
    while (child = el.firstChild) {
        fragment.appendChild(child);
    }
    return fragment;
}

/**
 * 是否是指令
 *
 * @param attrName
 * @returns {boolean}
 */
function isDirective(attrName) {
    return attrName.indexOf('v-') === 0;
}
/**
 * 是否是事件指令
 *
 * @param attrName
 * @returns {boolean}
 */
function isEventDirective(attrName) {
    return attrName.indexOf('on') === 0;
}
/**
 * 是否是元素节点
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
 *
 * @param node
 * @returns {boolean}
 */
function isElementNode(node) {
    return node && node.nodeType === 1;
}
/**
 * 是否是文本节点
 *
 * @param node
 * @returns {boolean}
 */
function isTextNode(node) {
    return node && node.nodeType === 3;
}

function createCompiler(options, vm) {
    new Compiler(options, vm);
}

},{"./Parser":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Depend;
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

function Depend(key) {
    console.log('正在创建[依赖收集器]...', 'key', key);
    this.id = id++;
    // 订阅者数组
    this.watchers = [];
    // 当前订阅者
    this.watcher = null;
    this.key = key;
}

Depend.prototype = {
    /**
     * 添加订阅者
     *
     * @param watcher
     */
    addWatcher: function addWatcher(watcher) {
        console.log('[Depend.prototype] addWatcher');
        this.watchers.push(watcher);
    },
    addDepend: function addDepend() {
        console.log('[Depend.prototype] depend');
        this.watcher.addDepend(this);
    },
    /**
     * 通知 Watcher 并触发回调函数
     */
    notify: function notify() {
        console.log('[Depend.prototype] notify');
        console.log('watchers', this.watchers);
        this.watchers.forEach(function (watcher) {
            watcher.update();
        });
    }
};

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                               * observer.js
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * 数据监听模块(观察者)
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * Created by xiepan on 2017/1/6 下午4:04.
                                                                                                                                                                                                                                                                               */


exports.default = createObserver;

var _Depend = require('./Depend');

var _Depend2 = _interopRequireDefault(_Depend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 创建数据监听器
 *
 * @param value
 * @returns {Observer}
 */
function createObserver(data) {
    if (data) {
        return new Observer(data);
    }
}

function Observer(data) {
    // 监听对象的变化
    if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
        console.log('正在创建[事件监听器]...');
        console.log('被监听数据：', data);
        this.observeObj(data);
    }
}

Observer.prototype = {
    /**
     * 监听对象的变化
     *
     * @param data
     */
    observeObj: function observeObj(data) {
        console.log('[Observer.prototype] observeObj');
        var _this = this;
        // 取出data中的所有属性
        Object.keys(data).forEach(function (key) {
            _this.observe(data, key, data[key]);
        });
    },
    /**
     * 检测对象的变化 & 依赖收集
     *
     * @param data
     * @param key
     * @param val
     */
    observe: function observe(data, key, val) {
        var dep = new _Depend2.default(key);
        // 嵌套对象
        var childObj = createObserver(val);
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function get() {
                console.log('[Observer.prototype] defineProperty:Depend.watcher', _Depend2.default.watcher);
                if (_Depend2.default.watcher) {
                    dep.addDepend();
                }
                return val;
            },
            set: function set(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                childObj = createObserver(newVal);
                // 通知所有订阅者
                dep.notify();
            }
        });
    }
};

},{"./Depend":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Updater = require("./Updater");

var _Updater2 = _interopRequireDefault(_Updater);

var _Watcher = require("./Watcher");

var _Watcher2 = _interopRequireDefault(_Watcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Parser.js
 *
 * 指令解析模块(v-text,v-html,v-model,v-class,v-on)
 *
 * Created by xiepan on 2017/1/10 下午1:25.
 */
var Parsers = {
    text: function text(node, vm, exp) {
        // console.log('[Compiler DirectiveParsers] text')
        this._bind(node, vm, exp, 'text');
    },
    html: function html(node, vm, exp) {
        // console.log('[Compiler DirectiveParsers] html')
        this._bind(node, vm, exp, 'html');
    },
    model: function model(node, vm, exp) {
        // console.log('[Compiler DirectiveParsers] model')
        this._bind(node, vm, exp, 'model');

        var _this = this,
            val = this._getValue(vm, exp);
        node.addEventListener('input', function (e) {
            var newVal = e.target.value;
            if (val === newVal) {
                return;
            }
            _this._setValue(vm, exp, newVal);
            val = newVal;
        });
    },
    class: function _class(node, vm, exp) {
        this._bind(node, vm, exp, 'class');
    },
    /**
     * 调用 Updater 视图刷新模块并为其创建数据订阅模块
     * @param node
     * @param vm
     * @param exp
     * @param dir
     * @private
     */
    _bind: function _bind(node, vm, exp, dir) {
        // 数据更新函数
        var updaterFn = _Updater2.default[dir];

        if (updaterFn) {
            //{node,value}
            // 初始化视图
            updaterFn(node, this._getValue(vm, exp));
            // 创建数据订阅器订阅数据变化，更新视图
            new _Watcher2.default(vm, exp, function (val, oldVal) {
                updaterFn(node, val, oldVal);
            });
        }
    },
    /**
     * 事件处理
     *
     * @param node 节点
     * @param vm Binding实例
     * @param exp 方法名
     * @param dir 指令名称(如：on:click)
     */
    _eventHandler: function _eventHandler(node, vm, exp, dir) {
        console.log('[Compiler DirectiveParsers] eventHandler');
        // 事件类型，如 click 事件
        var eventType = dir.split(':')[1];
        // 绑定的方法
        var fn = vm.$options.methods && vm.$options.methods[exp];

        // 添加事件监听器
        if (eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        } else {
            if (!eventType) {
                console.error('[Binding error] eventType after : is not defined');
            } else {
                console.error('[Binding error] event\'s function or function name is not defined');
            }
        }
    },
    _getValue: function _getValue(vm, exp) {
        // console.log('[Compiler DirectiveParsers] _getVMVal')
        var val = vm.$data;
        exp = exp.split('.');
        exp.forEach(function (k) {
            val = val[k];
        });
        return val;
    },

    _setValue: function _setValue(vm, exp, value) {
        // console.log('[Compiler DirectiveParsers] _setVMVal')
        var val = vm.$data;
        exp = exp.split('.');
        exp.forEach(function (k, i) {
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        });
    }
};

exports.default = Parsers;

},{"./Updater":6,"./Watcher":7}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Updater.js
 *
 * 视图刷新模块
 *
 * Created by xiepan on 2017/1/9 下午4:59.
 */

var Updater = {
    text: function text(node, value) {
        console.log('[Updater] v-text', value);
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    html: function html(node, value) {
        console.log('[Updater] v-html', node, value);
        node.innerHTML = typeof value == 'undefined' ? '' : value;
    },
    class: function _class(node, value, oldValue) {
        console.log('[Updater] v-class', node, oldValue, '->', value);
        var className = node.className;
        className = className.replace(oldValue, '').replace(/\s$/, '');

        var space = className && String(value) ? ' ' : '';
        node.className = className + space + value;
    },
    model: function model(node, value) {
        console.log('[Updater] v-model', node, value);
        node.value = typeof value == 'undefined' ? '' : value;
    }
};

exports.default = Updater;

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Watcher;

var _Depend = require('./Depend');

var _Depend2 = _interopRequireDefault(_Depend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Watcher(vm, exp, callback) {
    console.log('正在创建[数据订阅器]...', 'vm:', vm, ' expression:', exp, ' callback:', callback);

    this.vm = vm;
    // 数据更新回调函数
    this.callback = callback;
    // 表达式
    this.expression = exp;
    // 依赖 id
    this.depIds = {};
    this.value = this._getValue();
} /**
   * Watcher.js (subscriber)
   *
   * 数据订阅模块（订阅者）
   *
   * Created by xiepan on 2017/1/9 下午1:39.
   */


Watcher.prototype = {
    update: function update() {
        console.log('[Watcher.prototype] update');
        var value = this._getValue();
        var oldValue = this.value;
        if (value !== oldValue) {
            console.log('[Watcher.prototype] value:', oldValue, '->', value);
            this.value = value;
            this.callback.call(this.vm, value, oldValue);
        }
    },
    addDepend: function addDepend(dep) {
        console.log('[Watcher.prototype] addDepend');
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addWatcher(this);
            this.depIds[dep.id] = dep;
        }
    },
    _beforeGet: function _beforeGet() {
        _Depend2.default.watcher = this;
        console.log('[Watcher.prototype] _beforeGet watcher', this);
    },
    _getValue: function _getValue() {
        this._beforeGet();
        var exp = this.expression.split('.');
        var val = this.vm.$data;
        exp.forEach(function (k) {
            val = val[k];
        });
        this._afterGet();
        return val;
    },
    _afterGet: function _afterGet() {
        _Depend2.default.watcher = null;
    }

};

},{"./Depend":3}]},{},[1])

//# sourceMappingURL=build.js.map
