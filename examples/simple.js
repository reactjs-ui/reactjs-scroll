import React, {Component} from 'react';
import {render} from 'react-dom';
import Scroll from '../src/scripts/index';
import '../src/sass/scroll.scss';
import './sass/example.scss';

class ScrollSimple extends Component {
  render() {
    const contents = [];
    for (let i = 0; i < 200; i++) {
      contents.push(<p key={i}>这里放置真实显示的DOM内容 {i}</p>);
    }
    const props = {
      scrollBar: true,
      maxAmplitude: 80,
      debounceTime: 30,
      throttleTime: 100,
      deceleration: 0.001,
      scrollSpeed: 10,
      durationSpeed: 3,
      disableBounceTop: false,
      disableBounceBottom: false,
      className: 'example-scroll',
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
