/**
 * ScrollBar 类
 *
 * @param {Element} scrollPanel
 * @contructor
 */
class ScrollBar {
  constructor(scrollPanel, className) {
    const scrollBar = document.createElement('div');
    scrollBar.className = className || 'rc-scrollbar';
    scrollPanel.appendChild(scrollBar);
    this.scrollPanel = scrollPanel;
    this.scrollBar = scrollBar;
  }

  /**
   * 重新计算 scrollBar 大小
   * @param {Number} height
   */
  resize(height) {
    const {style} = this.scrollBar;
    //滚动条最小高度为 20
    if (height < 20) {
      height = 20;
    }
    style.height = `${height}px`;
    style.backgroundColor = 'rgba(0,0,0,0.4)';
  }

  /**
   * 隐藏 scrollBar
   */
  hide() {
    this.scrollBar.style.backgroundColor = 'transparent';
  }

  /**
   * 移动 scrollBar
   * @param {Number} y
   */
  translateY(y) {
    const {style} = this.scrollBar;
    style.webkitTransform = `translate3d(0, ${y}px, 0)`;
    style.transform = `translate3d(0, ${y}px, 0)`;
  }

  unmount() {
    this.scrollPanel.removeChild(this.scrollBar);
  }
}

export default ScrollBar;
