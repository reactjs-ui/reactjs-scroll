# React Scroll 更新日志

## version 0.6.3  (2017-9-24)

* 增加了属性 disableBounceTop 是否禁用顶部弹跳，当页面到达最上面时，触发 touch 事件阻止向下滑动
* 增加了属性 disableBounceBottom 是否禁用底部弹跳，当页面到达最下面时，触发 touch 事件阻止向上滑动
* 增加了属性 className 自定义样式
* 增加了属性 barClassName 自定义 bar 样式
* 优化了计算回弹速度效果
* 完善了注释
* 优化了不能滑到最底部的问题
* 当内容小于滚动区域，并且禁止上下弹跳时，不显示滚动条

## version 0.6.0  (2017-9-22)

* scss 文件需要单独引用 import 'reactjs-scroll/sass/scroll.scss';
* 优化了编译，用 babel 编译成 commonjs 和 es 格式
* 调整了 npm 发布配置，只发布必需的文件
* 去掉了 assign 依赖

## version 0.5.1  (2017-9-20)

* 升级更新 node 依赖包
* 升级到 webpack 3 后修改打包配置
* 修复 bug #2

## version 0.5.0  (2017-4-26)

* 升级更新 node 依赖包
* 升级到 webpack 2 后修改打包配置
* 升级 eslint 检测代码后，修改部分代码检测规则
* 升级 react 15.5.4 后单独引入 prop-types 

## version 0.4.1  (2016-8-23)

* 设置滚动条最小高度值
* 与 [reactjs-pull-refresh](https://www.npmjs.com/package/reactjs-pull-refresh) 版本保持一致

## version 0.2.0  开启 React Scroll 之旅(2016-8-9)

* 设置可调整滑动速度参数

## version 0.1.0  开启 React Scroll 之旅(2016-7-22)

* React Scroll 0.1.0 发布
* 实现基本功能
* 给出本地和线上实例
* 书写相关文档和用法


