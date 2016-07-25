import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';
import Scroll from '../src/scripts/index';

class ScrollSimple extends Component {
  render() {
    let contents = [];
    for (let i = 0; i < 100; i++) {
      contents.push(<p key={i}>这里放置真实显示的DOM内容 {i}</p>);
    }
    return (
      <Scroll>
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
  <ScrollSimple />, document.getElementById('layout')
);
