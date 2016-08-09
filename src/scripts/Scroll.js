import Tween from 'component-tween'
import raf from 'component-raf'
import throttle from 'throttleit'
import debounce from 'debounce'
import assign from 'lodash/assign';
import wheel from 'mouse-wheel-event'
import {getStyles} from 'perfect-dom/lib/style';
import ScrollBar from './ScrollBar'

// 函数
const max = Math.max;
const min = Math.min;
const now = Date.now ||
  function () {
    return (new Date()).getTime()
  };

/**
 * Init Scroll with el and optional options
 * options.scrollBar show scrollBar if is true
 *
 * @param {Object} options
 */
class Scroll {
  //默认属性
  static defaultOptions = {
    scrollBar: true,
    maxAmplitude: 80, //设置上下滑动最大弹性振幅度，单位为像素，默认为 80 像素
    debounceTime: 30, //防抖时间
    throttleTime: 100, //滑动条移动频率，值越大，移动的越缓慢
    deceleration: 0.001, //设置弹性滑动持续时间，即滑动停止时，弹性持续的时间
    thresholdOffset: 2, //设置上下移动临界值，移动超过该值，则向上或向下滑动
    scrollSpeed: 6, // 设置滚动加速度，值越大，滚动越快
    durationSpeed: 3, //滑动持续时间系数，系数越大，持续的时间短，
    easing: 'linear' //设置加速方式，默认为匀速，详情查看 https://github.com/component/ease
  };

  constructor(options) {
    let _options = assign(options);
    Object.keys(_options).forEach((item) => {
      if (_options[item] === undefined) {
        delete _options[item];
      }
    });

    _options = assign({}, Scroll.defaultOptions, _options);
    this.options = _options;

    // 初始化y 坐标
    this.y = 0;
    this.maxAmplitude = _options.maxAmplitude;
    const wrapper = _options.wrapper;
    const scroller = wrapper.children[0];
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
      this.scrollBar = new ScrollBar(wrapper, options.barClass);
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
   * Unbind all event listeners, and remove scrollBar if necessary
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
   * Recalculate the height
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
    if (this.y < this.minY) {
      this.scrollTo(this.minY, 300)
    } else if (this.y > 0) {
      this.scrollTo(0, 300)
    }
  }

  /**
   * touchstart event handler
   *
   * @param  {Event}  e
   */
  ontouchstart(e) {
    this.speed = null;
    if (this.tween) {
      this.tween.stop();
    }
    this.refresh(true);
    let start = this.y;
    if (e.target === this.wrapper) {
      start = min(start, 0);
      start = max(start, this.minY);
      // fix the invalid start position
      if (start !== this.y) {
        return this.scrollTo(start, 200)
      }
      return
    }

    const touch = this.getTouch(e);
    const sx = touch.clientX;
    const sy = touch.clientY;
    const at = now();
    const thresholdOffset = this.options.thresholdOffset;

    this.onstart = function (x, y) {
      // no moved up and down, so don't know
      if (Math.abs(sy - y) <= thresholdOffset) {
        return;
      }
      //更新完重置为 null
      this.onstart = null;
      const dx = Math.abs(x - sx)
      const dy = Math.abs(y - sy)
      // move left and right
      if (dx > dy) return
      this.clientY = touch.clientY
      this.dy = 0
      this.ts = now()
      this.down = {
        x: sx,
        y: sy,
        start,
        at
      }
      if (this.scrollBar) {
        this.resizeScrollBar()
      }
      return true
    }
  }

  /**
   * touchmove event handler
   *
   * @param  {Event}  e
   */
  ontouchmove(e) {
    e.preventDefault()
    if (!this.down && !this.onstart) {
      return
    }
    const touch = this.getTouch(e)
    const x = touch.clientX
    const y = touch.clientY
    if (this.onstart) {
      const started = this.onstart(x, y)
      if (started !== true) {
        return
      }
    }
    const down = this.down
    const dy = this.dy = y - down.y

    //calculate speed every 100 milisecond
    this.calcuteSpeed(touch.clientY, down.at)
    const start = this.down.start
    let dest = start + dy
    dest = min(dest, this.maxAmplitude)
    dest = max(dest, this.minY - this.maxAmplitude)
    this.translate(dest)
  }

  /**
   * Calcute speed by clientY
   *
   * @param {Number} y
   */
  calcuteSpeed(y, start) {
    const ts = now()
    const dt = ts - this.ts
    if (ts - start < 100) {
      this.distance = y - this.clientY
      this.speed = Math.abs(this.distance / dt)
    } else if (dt > 100) {
      this.distance = y - this.clientY
      this.speed = Math.abs(this.distance / dt)
      this.ts = ts
      this.clientY = y
    }
  }

  /**
   * Event handler for touchend
   *
   * @param  {Event}  e
   */
  ontouchend(e) {
    if (!this.down) return
    const at = this.down.at
    this.down = null
    const touch = this.getTouch(e)
    this.calcuteSpeed(touch.clientY, at)
    const m = this.momentum()
    this.scrollTo(m.dest, m.duration, m.ease)
  }

  onwheel(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return
    }
    if (this.scrollBar) {
      this.resizeScrollBar()
    }
    let y = this.y - dy
    if (y > 0) y = 0
    if (y < this.minY) y = this.minY
    if (y === this.y) {
      return
    }
    this.scrollTo(y, 20, 'linear')
  }

  /**
   * Calculate the animate props for moveon
   *
   * @return {Object}
   */
  momentum() {
    const deceleration = this.options.deceleration;
    let speed = this.speed
    speed = min(speed, 2)
    const scrollSpeed = this.options.scrollSpeed;
    const durationSpeed = this.options.durationSpeed;
    const y = this.y
    const rate = (scrollSpeed - Math.PI) / 2
    let destination = y + rate * (speed * speed) / (2 * deceleration) * (this.distance < 0 ? -1 : 1)
    let duration = speed / deceleration / durationSpeed
    let ease
    const minY = this.minY
    if (y > 0 || y < minY) {
      duration = 500
      ease = 'out-circ'
      destination = y > 0 ? 0 : minY
    } else if (destination > 0) {
      destination = 0
      ease = 'out-back'
    } else if (destination < minY) {
      destination = minY
      ease = 'out-back'
    }
    return {
      dest: destination,
      duration,
      ease
    }
  }

  /**
   * Scroll to potions y with optional duration and ease function
   *
   * @param {Number} y
   * @param {Number} duration
   * @param {String} easing
   */
  scrollTo(y, duration, easing) {
    if (this.tween) this.tween.stop()
    const transition = (duration > 0 && y !== this.y)
    if (!transition) {
      this.direction = 0
      this.translate(y)
      return this.onScrollEnd()
    }

    this.direction = y > this.y ? -1 : 1

    easing = easing || this.options.easing;
    const tween = this.tween = Tween({
      y: this.y
    })
      .ease(easing)
      .to({
        y
      })
      .duration(duration)

    tween.update(o => {
      this.translate(o.y)
    });

    let animate = function () {
      raf(animate)
      tween.update()
    }

    const promise = new Promise(resolve => {
      tween.on('end', () => {
        resolve()
        this.animating = false
        animate = () => {
        }
        if (!tween.stopped) { // no emit scrollend if tween stopped
          this.onScrollEnd()
        }
      })
    })

    animate()
    this.animating = true
    return promise
  }

  /**
   * Gets the appropriate "touch" object for the `e` event. The event may be from
   * a "mouse", "touch", or "Pointer" event, so the normalization happens here.
   *
   */

  getTouch(e) {
    let touch = e
    if (e.changedTouches && e.changedTouches.length > 0) {
      touch = e.changedTouches[0]
    }
    return touch
  }

  /**
   * Translate to `x`.
   *
   */

  translate(y) {
    const style = this.scroller.style
    if (isNaN(y)) return
    y = Math.floor(y)
    //reach the end
    if (this.y !== y) {
      this.y = y
      if (this.scrollBar) {
        this.transformScrollBar()
      }
    }
    style.webkitTransform = `translate3d(0, ${y}px, 0)`;
    style.transform = `translate3d(0, ${y}px, 0)`;
  }


  /**
   * show the scrollBar and size it
   */
  resizeScrollBar() {
    const vh = this.viewHeight
    const h = vh * vh / this.height
    this.scrollBar.resize(h)
  }

  /**
   * Hide scrollBar
   */
  hideScrollBar() {
    if (this.scrollBar) {
      this.scrollBar.hide()
    }
  }

  /**
   * Scrollend
   *
   */
  onScrollEnd() {
    if (this.animating) return
    this.hideScrollBar()
    const y = this.y
  }

  /**
   * Transform scrollBar
   */
  transformScrollBar() {
    const vh = this.viewHeight
    const h = this.height
    const y = Math.round(-(vh - vh * vh / h) * this.y / (h - vh))
    this.scrollBar.translateY(y)
  }

  /**
   *
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


export default Scroll
