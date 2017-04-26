import React from 'react';
import {render} from 'react-dom';
import './sass/example.scss';

const Index = () => {
  return (
    <div className="example">
      <h3>React Scroll 例子</h3>
      <ol className="example-list">
        <li>
          <a href="./simple.html" target="_blank">基本用法</a>
        </li>
        <li>
          <a href="./browser.html" target="_blank">浏览器本身滚动效果</a>
        </li>
      </ol>
    </div>
  );
};

render(<Index/>, document.getElementById('layout'));
