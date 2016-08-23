import React, {Component, PropTypes} from 'react';
import {render} from 'react-dom';

class BrowserSimple extends Component {
  render() {
    let contents = [];
    for (let i = 0; i < 2000; i++) {
      contents.push(<p key={i}>这里放置真实显示的DOM内容 {i}</p>);
    }

    return (
        <div>
          {contents.map((item) => {
            return item;
          })}
        </div>
    );
  }
}

render(
  <BrowserSimple/>, document.getElementById('layout')
);
