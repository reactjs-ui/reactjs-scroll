/**
 * React Scroll 组件
 * 参考
 * https://github.com/chemzqm/iscroll
 */

import React, {PropTypes, Component} from 'react';
import Scroll from './Scroll';
import '../sass/scroll.scss';

class ReactScroll extends Component {
  //可能需要传入的参数
  static propTypes = {
    children: PropTypes.node, //待渲染的内容
    scrollBar: PropTypes.bool, // 是否显示滚动条
    maxAmplitude: PropTypes.number, // 设置上下滑动最大弹性振幅度，单位为像素，默认为 80 像素
    debounceTime: PropTypes.number, // 设置防抖时间
    throttleTime: PropTypes.number, // 设置滑动条移动频率，值越大，移动的越缓慢
    deceleration: PropTypes.number, // 设置弹性滑动持续时间，即滑动停止时，弹性持续的时间，值越大，持续时间越短
    scrollSpeed: PropTypes.number, // 设置滚动加速度，值越大，滚动越快
    thresholdOffset: PropTypes.number, //设置上下移动临界值，移动超过该值，则向上或向下滑动
    durationSpeed: PropTypes.number, //滑动持续时间系数，系数越大，持续的时间短
    easing: PropTypes.string //设置加速方式，默认为匀速，详情查看 https://github.com/component/ease
  };

  static defaultProps = {};

  componentDidMount() {
    //初始化 Scroll 实例
    const {
      scrollBar, maxAmplitude, debounceTime, throttleTime,
      deceleration, scrollSpeed, thresholdOffset, durationSpeed, easing
    } = this.props;
    const {wrapper} = this.refs;
    this.scroll = new Scroll({
      wrapper,
      scrollBar,
      maxAmplitude,
      debounceTime,
      throttleTime,
      deceleration,
      scrollSpeed,
      thresholdOffset,
      durationSpeed,
      easing
    });
  }

  componentWillUnmount() {
    this.scroll.unmount(true);
  }

  render() {
    const {
      children
    } = this.props;


    return (
      <div className="rc-scroll-wrapper" ref="wrapper">
        <div className="rc-scroll">
          {children}
        </div>
      </div>
    );
  }
}

export default ReactScroll;
