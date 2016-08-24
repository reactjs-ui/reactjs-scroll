# reactjs-scroll

This is a react component for scroll.

## Install

```
npm install reactjs-scroll --save
```

## Example

```
npm install
gulp example
```

http://localhost:9090


## Online Example

http://reactjs-ui.github.io/reactjs-scroll/

## Build Example
第一次需要先执行前两步操作，再执行第三步。以后修改例子后，只需要执行第三步即可

* 创建 gh-pages 分支，**在执行 git subtree add 命令之前，需确保 gh-pages 分支下至少存在一个文件**
```
git branch gh-pages
git checkout gh-pages
rm -rf *     //隐藏文件需要单独删除，结合命令 ls -a
git add -A
git commit -m "clear gh-page"
git push --set-upstream origin gh-pages
vim README.md
//输入一些内容
git add README.md
git commit -m "README.md"
git push
git checkout master
```

* 把分支 gh-pages 添加到本地 subtree 中，执行该命令前，请确保 examples-dist 文件夹不存在

```
git subtree add --prefix=examples-dist origin gh-pages --squash
```
  
* 生成在线 examples
```
gulp example:build
git add -A examples-dist
git commit -m "Update online examples"
git subtree push --prefix=examples-dist origin gh-pages --squash
git push
```

## Usage

```javascript
import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';
import Scroll from '../src/scripts/index';

class ScrollSimple extends Component {
  render() {
    let contents = [];
    for (let i = 0; i < 100; i++) {
      contents.push(<p key={i}>这里放置真实显示的DOM内容 {i}</p>);
    }
    const props = {
      scrollBar: true,
      maxAmplitude: 50,
      debounceTime: 30,
      throttleTime: 100,
      deceleration: 0.001
    };

    return (
      <Scroll {...props}>
        <div>
          {contents.map((item) => {
            return item;
          })}
        </div>
      </Scroll>
    );
  }
}

render(
  <ScrollSimple/>, document.getElementById('layout')
);

```

## Options

| 选项        | 类型   |  功能  |
| --------   | ----- | ---- |
| children | PropTypes.node| 待渲染的内容|
| scrollBar | PropTypes.bool| 是否显示滚动条|
| maxAmplitude | PropTypes.number| 设置上下滑动最大弹性振幅度，单位为像素，默认为 80 像素|
| debounceTime | PropTypes.number| 设置防抖时间|
| throttleTime | PropTypes.number| 设置滑动条移动频率，值越大，移动的越缓慢|
| deceleration | PropTypes.number| 设置弹性滑动持续时间，即滑动停止时，弹性持续的时间，值越大，持续时间越短|
| scrollSpeed   | PropTypes.number | 设置滚动加速度，值越大，滚动越快 |
| thresholdOffset | PropTypes.number | 设置上下移动临界值，移动超过该值，则向上或向下滑动 |
| durationSpeed | PropTypes.number | 滑动持续时间系数，系数越大，持续的时间短 |
| easing  | PropTypes.string | 设置加速方式，默认为匀速，详情查看 https://github.com/component/ease |

## Build

```
gulp build
```

## More React Component

* [reactjs-pull-refresh](https://www.npmjs.com/package/reactjs-pull-refresh) 

## Issue

https://github.com/reactjs-ui/reactjs-scroll/issues

## Version

Please view [here](./VERSION.md)
