/**
 * ScrollBar contructor
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
   * Show the scrollBar and resize it
   *
   * @param {Number} height
   */
  resize(height) {
    const style = this.scrollBar.style;
    style.height = `${height}px`
    style.backgroundColor = 'rgba(0,0,0,0.4)'
  }

  /**
   * Hide this scrollBar
   */
  hide() {
    this.scrollBar.style.backgroundColor = 'transparent'
  }

  /**
   * Move scrollBar by translateY
   * @param {Number} y
   */
  translateY(y) {
    const style = this.scrollBar.style;
    style.webkitTransform = `translate3d(0, ${y}px, 0)`;
    style.transform = `translate3d(0, ${y}px, 0)`;
  }

  unmount() {
    this.scrollPanel.removeChild(this.scrollBar);
  }
}

export default ScrollBar;
