/**!
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
    children: PropTypes.node
  };

  static defaultProps = {};

  componentDidMount() {
    //初始化 Scroll 实例
    const {wrapper} = this.refs;
    this.scroll = new Scroll({
      wrapper
    });
  }

  componentWillUnmount() {
    this.scroll.destroy(true);
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
