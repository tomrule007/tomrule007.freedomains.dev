import Kanban from './Kanban';
import React from 'react';
import ReactDOM from 'react-dom';
import Stars from './Stars';

const { pathname } = window.location;
ReactDOM.render(
  pathname === '/react/star' ? (
    <Stars />
  ) : pathname === '/react/kanban' ? (
    <Kanban />
  ) : (
    <p>Unknown route! Try '/react/star' or '/react/kanban'</p>
  ),
  document.getElementById('root')
);
