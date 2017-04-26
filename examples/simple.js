import React, {Component} from 'react';
import {render} from 'react-dom';
import Scroll from '../src/scripts/index';

class ScrollSimple extends Component {
  render() {
    const contents = [];
    for (let i = 0; i < 2000; i++) {
      contents.push(<p key={i}>这里放置真实显示的DOM内容 {i}</p>);
    }
    const props = {
      scrollBar: true,
      maxAmplitude: 80,
      debounceTime: 30,
      throttleTime: 100,
      deceleration: 0.001,
      scrollSpeed: 10,
      durationSpeed: 3
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
