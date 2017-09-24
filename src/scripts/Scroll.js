/**
 *  * 参考
 * https://github.com/chemzqm/iscroll
 */
import Tween from 'component-tween';
import raf from 'component-raf';
import throttle from 'throttleit';
import debounce from 'debounce';
import wheel from 'mouse-wheel-event';
import {getStyles} from 'perfect-dom/lib/style';
import ScrollBar from './ScrollBar';

// 函数
const {max, min} = Math;

const now = Date.now ||
  function () {
    return (new Date()).getTime();
  };

// 计算回弹速度效果
function outBack(n) {
  const s = 1.20158;
  return --n * n * ((s + 1) * n + s) + 1;
}

/**
 * 初始化 Scroll 设置宽度和选项
 * options.scrollBar 设为 true 则显示scrollBar
 * @param {Object} options
 */
class Scroll {
  //默认属性
  static defaultOptions = {
    scrollBar: true,
    barClassName: '', // bar Class
    maxAmplitude: 80, // 设置上下滑动最大弹性振幅度，单位为像素，默认为 80 像素
    debounceTime: 50, // 防抖时间
    throttleTime: 100, // 滑动条移动频率，值越大，移动的越缓慢
    deceleration: 0.001, // 设置弹性滑动持续时间，即滑动停止时，弹性持续的时间
    thresholdOffset: 2, // 设置上下移动临界值，移动超过该值，则向上或向下滑动
    scrollSpeed: 4, // 设置滚动加速度，值越大，滚动越快
    durationSpeed: 3, // 滑动持续时间系数，系数越大，持续的时间短，
    easing: 'linear', // 设置加速方式，默认为匀速，详情查看 https://github.com/component/ease
    disableBounceTop: false, // 是否禁用顶部弹跳，当页面到达最上面时，触发 touch 事件阻止向下滑动
    disableBounceBottom: false, // 是否禁用底部弹跳，当页面到达最下面时，触发 touch 事件阻止向上滑动
  };

  constructor(options) {
    let _options = {...options};
    Object.keys(_options).forEach((item) => {
      if (_options[item] === undefined) {
        delete _options[item];
      }
    });

    _options = {...Scroll.defaultOptions, ..._options};
    this.options = _options;

    // 初始化y 坐标
    this.y = 0;
    this.maxAmplitude = _options.maxAmplitude;
    const {wrapper} = _options;
    const [scroller] = wrapper.children;
    // 包裹区域元素
    this.wrapper = wrapper;
    // 内层元素
    this.scroller = scroller;
    this.scrollerMargin = parseInt(getStyles(this.scroller, 'marginBottom'), 10)
      + parseInt(getStyles(this.scroller, 'marginTop'), 10);

    this.handleEvent = this.handleEvent.bind(this);
    this._initEvent();

    this.refresh(true);

    if (options.scrollBar !== false) {
      this.scrollBar = new ScrollBar(wrapper, options.barClassName);
    }
    this.onScrollEnd = debounce(this.onScrollEnd, _options.debounceTime);
    this.transformScrollBar = throttle(this.transformScrollBar, _options.throttleTime);
  }

  // 事件句柄
  handleEvent(e) {
    /*eslint-disable indent*/
    switch (e.type) {
      case 'touchstart':
        this.ontouchstart(e);
        break;
      case 'touchmove':
        this.ontouchmove(e);
        break;
      case 'touchcancel':
      case 'touchend':
      case 'touchleave':
        this.ontouchend(e);
        break;
      default:
        break;
    }
  }

  /**
   * 删除所有监听，当页面卸载时
   */
  unmount() {
    this._initEvent(true);
    if (this.scrollBar) {
      this.scrollBar.unmount();
    }
    this._wheelUnbind();
  }

  /**
   * 初始化或卸载事件
   * @param detach 设为 true 表示卸载
   */
  _initEvent(detach) {
    const action = detach ? 'removeEventListener' : 'addEventListener';

    this.wrapper[action]('touchstart', this.handleEvent);
    this.wrapper[action]('touchmove', this.handleEvent);
    this.wrapper[action]('touchleave', this.handleEvent, true);
    this.wrapper[action]('touchend', this.handleEvent, true);
    this.wrapper[action]('touchcancel', this.handleEvent, true);

    //添加鼠标滚动事件，在pc 端也可以操作
    this._wheelUnbind = wheel(this.wrapper, this.onwheel.bind(this), true);
  }

  /**
   * 重新计算高度
   * @param noScroll 如果还没有滚动时，直接返回，即初始化的时候
   */
  refresh(noScroll) {
    const sh = this.viewHeight = this.wrapper.getBoundingClientRect().height;
    const ch = this.height = this.scroller.getBoundingClientRect().height + this.scrollerMargin;
    //计算最小高度
    this.minY = min(0, sh - ch);
    if (noScroll === true) {
      return;
    }
    //滑到最下面
    if (this.y < this.minY) {
      this.scrollTo(this.minY, 300);
      // 滑到最上面
    } else if (this.y > 0) {
      this.scrollTo(0, 300);
    }
  }

  /**
   * touchstart 事件句柄
   *
   * @param  {Event}  e
   */
  ontouchstart(e) {
    this.speed = null;
    this.down = null;
    if (this.tween) {
      this.tween.stop();
    }
    this.refresh(true);
    let start = this.y;
    if (e.target === this.wrapper) {
      start = min(start, 0);
      start = max(start, this.minY);
      // 定位到开始位置
      if (start !== this.y) {
        return this.scrollTo(start, 200);
      }
      return;
    }

    const touch = this.getTouch(e);
    const sx = touch.clientX;
    const sy = touch.clientY;
    const at = now();
    const {thresholdOffset} = this.options;

    this.onstart = function (x, y) {
      // 判断是否超过移动临界值
      if (Math.abs(sy - y) <= thresholdOffset) {
        return;
      }
      //更新完重置为 null
      this.onstart = null;
      const dx = Math.abs(x - sx);
      const dy = Math.abs(y - sy);
      // 左右移动时，或略
      if (dx > dy) {
        return;
      }
      this.clientY = touch.clientY;
      this.dy = 0;
      this.ts = now();
      this.down = {
        x: sx,
        y: sy,
        start,
        at
      };
      if (this.scrollBar) {
        this.resizeScrollBar();
      }
      return true;
    };
  }

  /**
   * touchmove 事件句柄
   *
   * @param  {Event}  e
   */
  ontouchmove(e) {
    e.preventDefault();

    if (!this.down && !this.onstart) {
      return;
    }
    const touch = this.getTouch(e);
    const x = touch.clientX;
    const y = touch.clientY;
    if (this.onstart) {
      const started = this.onstart(x, y);
      if (started !== true) {
        return;
      }
    }
    const {down} = this;
    const dy = y - down.y;

    // 当页面到达最上面时，禁止滑动
    if (this.options.disableBounceTop && this.y >= 0 && dy > 0) {
      return;
    }

    // 当页面到达最下面时，禁止滑动
    if (this.options.disableBounceBottom && this.y <= (this.viewHeight - this.height) && dy < 0) {
      return;
    }

    this.dy = dy;

    // 计算速度，按每 100 milisecond
    this.calcuteSpeed(touch.clientY, down.at);
    const {start} = this.down;
    let dest = start + dy;
    dest = min(dest, this.maxAmplitude);
    dest = max(dest, this.minY - this.maxAmplitude);
    this.translate(dest);
  }

  /**
   * touchend 事件句柄
   *
   * @param  {Event}  e
   */
  ontouchend(e) {
    if (!this.down) return;
    const {at} = this.down;
    this.down = null;
    const touch = this.getTouch(e);
    this.calcuteSpeed(touch.clientY, at);
    const m = this.momentum();
    this.scrollTo(m.dest, m.duration, m.ease);
  }

  onwheel(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return;
    }
    if (this.scrollBar) {
      this.resizeScrollBar();
    }
    let y = this.y - dy;
    if (y > 0) y = 0;
    if (y < this.minY) y = this.minY;
    if (y === this.y) {
      return;
    }
    this.scrollTo(y, 20, 'linear');
  }

  /**
   * 计算加速度
   * @param {Number} y
   */
  calcuteSpeed(y, start) {
    const ts = now();
    const dt = ts - this.ts;
    if (ts - start < 100) {
      this.distance = y - this.clientY;
      this.speed = Math.abs(this.distance / dt);
    } else if (dt > 100) {
      this.distance = y - this.clientY;
      this.speed = Math.abs(this.distance / dt);
      this.ts = ts;
      this.clientY = y;
    }
  }

  /**
   * 计算移动的动画效果
   * @return {Object}
   */
  momentum() {
    const {deceleration} = this.options;
    let {speed} = this;
    const {scrollSpeed, durationSpeed} = this.options;
    speed = min(speed, scrollSpeed);
    const {y} = this;
    const rate = (scrollSpeed - Math.PI) / 2;
    let destination = y + (rate * speed * speed) / (2 * deceleration) * (this.distance < 0 ? -1 : 1);
    let duration = speed / deceleration / durationSpeed;
    let ease;
    const {minY} = this;
    if (y > 0 || y < minY) {
      duration = 600;
      ease = 'out-quart';
      destination = y > 0 ? 0 : minY;
    } else if (destination > 0 || destination < minY) {
      ease = outBack;
      destination = destination > 0 ? 0 : minY;
      duration = 2 * Math.abs(destination - y + 40) / speed;
    }

    return {
      dest: destination,
      duration,
      ease
    };
  }

  /**
   * Scroll to potions y with optional duration and ease function
   * 使用动画效果滑动到指定的位置
   * @param {Number} y
   * @param {Number} duration
   * @param {String} easing
   */
  scrollTo(y, duration, easing) {
    if (this.tween) this.tween.stop();
    const transition = (duration > 0 && y !== this.y);
    if (!transition) {
      this.direction = 0;
      this.translate(y);
      return this.onScrollEnd();
    }

    this.direction = y > this.y ? -1 : 1;

    easing = easing || this.options.easing;
    const tween = this.tween = Tween({
      y: this.y
    })
      .ease(easing)
      .to({
        y
      })
      .duration(duration);

    tween.update((o) => {
      this.translate(o.y);
    });

    let animate = function () {
      raf(animate);
      tween.update();
    };

    const promise = new Promise((resolve) => {
      tween.on('end', () => {
        resolve();
        this.animating = false;
        animate = () => {
        };
        if (!tween.stopped) { // no emit scrollend if tween stopped
          this.onScrollEnd();
        }
      });
    });

    animate();
    this.animating = true;
    return promise;
  }

  /**
   * 返回 touch 事件
   */

  getTouch(e) {
    let touch = e;
    if (e.changedTouches && e.changedTouches.length > 0) {
      [touch] = e.changedTouches;
    }
    return touch;
  }

  /**
   * 移动
   */

  translate(y) {
    const {style} = this.scroller;
    if (isNaN(y)) return;
    y = Math.floor(y);
    // reach the end
    if (this.y !== y) {
      this.y = y;
      if (this.scrollBar) {
        this.transformScrollBar();
      }
    }
    style.webkitTransform = `translate3d(0, ${y}px, 0)`;
    style.transform = `translate3d(0, ${y}px, 0)`;
  }


  /**
   * 显示 scrollBar 并重新计算 scrollBar 大小
   */
  resizeScrollBar() {
    const {disableBounceTop, disableBounceBottom} = this.options;
    if (disableBounceTop && disableBounceBottom && this.viewHeight > this.height) {
      return;
    }
    const vh = this.viewHeight;
    const h = vh * vh / this.height;
    this.scrollBar.resize(h);
  }

  /**
   * 隐藏 scrollBar
   */
  hideScrollBar() {
    if (this.scrollBar) {
      this.scrollBar.hide();
    }
  }

  /**
   * 活动结束时触发该事件
   *
   */
  onScrollEnd() {
    if (this.animating) return;
    this.hideScrollBar();
  }

  /**
   * 移动 scrollBar
   */
  transformScrollBar() {
    const vh = this.viewHeight;
    const h = this.height;
    const y = Math.round(-(vh - vh * vh / h) * this.y / (h - vh));
    this.scrollBar.translateY(y);
  }

  /**
   * 返回当前位移值
   * @returns {number|*}
   */
  getScrollTop() {
    return this.y;
  }

  getScrollHeight() {
    return this.height;
  }

  getScrollViewHeight() {
    return this.viewHeight;
  }
}


export default Scroll;
