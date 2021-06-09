// utility functions

const remove = (index, array) =>
  array.slice(0, Number(index)).concat(array.slice(Number(index) + 1));

// MODEL
const storageKey = 'kanbanState';

const columnsInfo = [
  { title: 'To-Do', titleColor: '#35235d', id: 0 },
  { title: 'Doing', titleColor: '#cb2402', id: 1 },
  { title: 'Done', titleColor: '#4c49a2', id: 2 },
  { title: 'Approved', titleColor: '#a31a48', id: 3 },
];

const storedState = JSON.parse(localStorage.getItem(storageKey) || 'null');

const initialState = storedState
  ? storedState
  : Object.fromEntries(columnsInfo.map(({ id }) => [id, []]));

// Action Creators
const moveTodo = ({ fromColumn, toColumn, todoIndex }) => ({
  type: 'MOVE_TODO',
  payload: { fromColumn, toColumn, todoIndex },
});
const deleteTodo = ({ columnIndex, todoIndex }) => ({
  type: 'DELETE_TODO',
  payload: { columnIndex, todoIndex },
});
const createTodo = ({ columnIndex, text }) => ({
  type: 'CREATE_TODO',
  payload: { columnIndex, text },
});

// Action Handlers
const handleMove = (state, { fromColumn, toColumn, todoIndex }) => {
  if (
    //exit on unknown direction or invalid move
    toColumn === undefined ||
    toColumn < 0 ||
    toColumn > Object.keys(state).length - 1
  )
    return state;

  let nextState = { ...state };
  nextState[fromColumn] = remove(todoIndex, state[fromColumn]);

  const todoText = state[fromColumn][todoIndex];
  nextState[toColumn] = [...state[toColumn], todoText];

  return nextState;
};

const handleCreate = (state, { columnIndex, text }) => ({
  ...state,
  [columnIndex]: [...state[columnIndex], text],
});

const handleDelete = (state, { todoIndex, columnIndex }) => {
  const nextState = { ...state };
  nextState[columnIndex] = remove(todoIndex, state[columnIndex]);

  return nextState;
};

// Root Reducer
const kanbanReducer = (state, action) => {
  switch (action.type) {
    case 'MOVE_TODO':
      return handleMove(state, action.payload);
      break;
    case 'CREATE_TODO':
      return handleCreate(state, action.payload);
      break;
    case 'DELETE_TODO':
      return handleDelete(state, action.payload);
      break;
    default:
      throw new Error(`Unknown action: ${action.type}`);
      break;
  }
};

// React Components
const TodoItem = ({ columnIndex, text, todoIndex }) => {
  const dispatch = React.useContext(DispatchContext);
  return (
    <div className="task-container">
      <div
        className="button-left"
        title="Move task to the left"
        onClick={() =>
          dispatch(
            moveTodo({
              fromColumn: columnIndex,
              toColumn: columnIndex - 1,
              todoIndex,
            })
          )
        }
      >
        &lt;
      </div>
      <div
        className="task-text"
        title="Delete"
        onClick={() => {
          if (confirm(`Are you sure you want to remove ${text}?`))
            dispatch(deleteTodo({ columnIndex, todoIndex }));
        }}
      >
        {text}
      </div>
      <div
        className="button-right"
        title="Move task to the right"
        onClick={() =>
          dispatch(
            moveTodo({
              fromColumn: columnIndex,
              toColumn: columnIndex + 1,
              todoIndex,
            })
          )
        }
      >
        &gt;
      </div>
    </div>
  );
};

const Columns = ({ title, titleColor, id }) => {
  const taskInput = React.useRef(null);

  const dispatch = React.useContext(DispatchContext);
  const state = React.useContext(StateContext);
  return (
    <article className="board-column">
      <header className="column-title" style={{ backgroundColor: titleColor }}>
        {title}
      </header>
      <div>
        {state[id].map((text, i) => (
          <TodoItem text={text} columnIndex={id} todoIndex={i} key={i} />
        ))}
      </div>
      <form className="task-form-container">
        <textarea className="textarea" ref={taskInput}></textarea>
        <button
          type="button"
          onClick={() => {
            const text = taskInput.current.value;
            if (text) dispatch(createTodo({ columnIndex: id, text }));

            taskInput.current.value = '';
            taskInput.current.focus();
          }}
        >
          Submit
        </button>
      </form>
    </article>
  );
};

const DispatchContext = React.createContext();
const StateContext = React.createContext();

const Kanban = () => {
  React.useEffect(() => {
    document.title = 'Kanban';
  });

  const [state, dispatch] = React.useReducer(kanbanReducer, initialState);

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  return (
    <div className="board">
      <DispatchContext.Provider value={dispatch}>
        <StateContext.Provider value={state}>
          {columnsInfo.map((columnInfo, i) => (
            <Columns {...columnInfo} key={i} dispatch={dispatch} />
          ))}
        </StateContext.Provider>
      </DispatchContext.Provider>
    </div>
  );
};
