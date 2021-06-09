const { pathname } = window.location;
ReactDOM.render(
  pathname === '/js6/p3/star' ? (
    <Stars />
  ) : pathname === '/js6/p3/kanban' ? (
    <Kanban />
  ) : (
    <p> Unknown route! Try '/js6/p3/star' or '/js6/p3/kanban' </p>
  ),
  document.getElementById('root')
);
