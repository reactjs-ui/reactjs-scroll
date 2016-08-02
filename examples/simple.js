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
