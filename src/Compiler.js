/**
 * compile.js
 *
 * 编译模块
 *
 * Created by xiepan on 2017/1/9 上午10:12.
 */
import Parsers from "./Parser";

function Compiler(options, vm) {
    console.log('正在创建[指令解析器 Compiler]...')
    console.log('数据参数对象:', options, 'Binding 实例', vm)

    var el = options.el
    var computed = options.computed;
    this.$el = isElementNode(el) ? el : document.querySelector(el)
    this.$data = options.data
    this.$vm = vm


    // 计算属性
    if (computed) {
        var keys = Object.keys(computed)

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            console.log('[Compiler] computed 计算属性', key)
            if (!(typeof computed[key] === 'function')) {
                console.error('[Binding error] computed property [' + key + '] must be a function!')
                return
            }
            Object.defineProperty(this.$data, key, {
                get: computed[key]
            })


        }
    }

    this.mount()
}

Compiler.prototype = {
    mount: function () {
        var fragment = node2Fragment(this.$el)
        this.compile(fragment)
        this.$el.appendChild(fragment)
    },

    compile: function (el) {
        console.log('[Compiler.prototype] 开始解析(compile)', el)
        // Node.childNodes 返回包含指定节点的子节点的集合
        // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/childNodes
        // ParentNode.children 是一个只读属性，返回一个包含当前元素的子元素的集合
        // https://developer.mozilla.org/zh-CN/docs/Web/API/ParentNode/children
        var childNodes = el.childNodes,
            _this = this
        Array.prototype.slice.call(childNodes).forEach(function (node) {
            var text = node.textContent
            var mustacheRe = /\{\{(.*)\}\}/

            // 元素
            if (isElementNode(node)) {
                _this.parse(node)
                // 文本
            } else if (isTextNode(node) && mustacheRe.test(text)) {
                _this.parseText(node, RegExp.$1.trim())
            }
            // 子节点
            if (node.childNodes && node.childNodes.length > 0) {
                _this.compile(node)
            }
        })
    },
    /**
     * 解析元素节点
     *
     * @param node
     */
    parse: function (node) {
        console.log('[Compiler.prototype] 解析元素节点(parse)')
        var nodeAttrs = node.attributes,
            _this = this

        // 处理指令
        Array.prototype.slice.call(nodeAttrs).forEach(function (attr) {
            var attrName = attr.name
            if (isDirective(attrName)) {
                // 指令值
                var expression = attr.value
                // 指令类型
                var directive = attrName.substring(2);
                console.log('[Compiler.prototype] parse()', 'exp:', expression, '; directive:', directive)
                // 是事件指令
                if (isEventDirective(directive)) {
                    Parsers.eventHandler(node, _this.$vm, expression, directive)
                } else {
                    // 其他指令
                    if (Parsers[directive]) {
                        Parsers[directive](node, _this.$vm, expression)
                    } else {
                        console.error('[Binding error] v-' + directive + ' is not supported')
                    }
                }
            }
        })
    },
    parseText: function (node, exp) {
        console.log('[Compiler.prototype] 解析文本节点(parseText)')
        Parsers.text(node, this.$vm, exp)
    }
}


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
    var fragment = document.createDocumentFragment()
    var child
    while (child = el.firstChild) {
        fragment.appendChild(child)
    }
    return fragment
}

/**
 * 是否是指令
 *
 * @param attrName
 * @returns {boolean}
 */
function isDirective(attrName) {
    return attrName.indexOf('v-') === 0
}
/**
 * 是否是事件指令
 *
 * @param attrName
 * @returns {boolean}
 */
function isEventDirective(attrName) {
    return attrName.indexOf('on') === 0
}
/**
 * 是否是元素节点
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
 *
 * @param node
 * @returns {boolean}
 */
function isElementNode(node) {
    return node && node.nodeType === 1
}
/**
 * 是否是文本节点
 *
 * @param node
 * @returns {boolean}
 */
function isTextNode(node) {
    return node && node.nodeType === 3
}

export default function createCompiler(options, vm) {
    new Compiler(options, vm)
}
