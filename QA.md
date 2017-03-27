### Binding 有哪些模块？

- 一个 Observer 对对象的的变化进行监测，发生变化时可以触发通知回调；
- 一个 Compiler 对元素的每个节点进行指令的扫描和提取；
- 一个 Parser 去解析元素上的指令，把指令的意图通过 Updater 更新到 DOM 上；
- 一个 Watcher 实现一个Watcher，作为连接Observer和Compiler的桥梁，收到每个属性变动的通知，执行指令绑定的视图更新回调函数；
- 一个 Depend 每个数据拥有一个 Depend 依赖收集器，用于维护订阅者数组，数据变动通知所有 Watcher；

### Binging 启动后做了什么？

1. **Observer** Observer 对所有预声明的 $data 进行了 Object.defineProperty 数据劫持
2. **Observer** Object.defineProperty 前，也会为 $data 的**每个数据**(包括嵌套对象)创建 Depend,为之后的添加和通知 watchers 数组做准备
3. **Compiler** Compiler 开始解析节点（双重遍历，外层遍历DOM节点，内层遍历DOM节点属性），并为不同指令分配不同Parser
4. **Parser** Parser 根据指令类型调用不同 Updater，(用于初始化视图，getValue 操作而触发了 getter 但 watcher 不存在所以没有作用)
5. **Parser** 初始化视图之后，会为这个**DOM 节点的属性**创建 watcher，并将对应的 Updater 视图更新函数放置在 callback 函数中
6. **Watcher** watcher 初始化时调用 getValue 为 Depend.watcher 赋值，并第二次触发了 getter 
7. **Observer** getter 会将当前 watcher 添加到 Depend 的 watchers 数组上

### 在 input 控件更新数据后发生了什么？

1. *(Compiler 判断出指令类型v-model)* 
2. *(Compiler 调用了 Parser 中的 model 方法,监听了 input 事件,input 事件对 $data 中 key 为 exp 的数据赋值)*
3. 所以赋值操作触发了 set 方法, 并 notify 了所有 watcher, 循环 watchers 数组,每个 watcher 都进行 update
4. *(update 时 Depend 的 watcher 属性也被赋值为当前 watcher)*
5. *(watcher 的 update 方法会循环 exp 并触发 Object.defineProperty 的 get)*
6. *(除非添加了新属性，才会将当前 watcher 添加到 Depend 的 watchers 数组上)*
7. update 方法调用(call)了传入的 callback 时，Updater 视图更新函数得以执行，视图得到更新