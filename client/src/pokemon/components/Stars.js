import React from 'react';

// Action creator's
const setGiven = () => ({ type: 'SET_GIVEN' });
const resetGiven = () => ({ type: 'RESET_GIVEN' });
const updateLastHover = (index) => ({
  type: 'UPDATE_LAST_HOVER',
  payload: { index },
});

// Reducer

const starsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_GIVEN':
      return {
        ...state,
        stars: state.lastHover,
        given: true,
      };
      break;

    case 'RESET_GIVEN':
      return { ...state, given: false };
      break;

    case 'UPDATE_LAST_HOVER':
      return {
        ...state,
        lastHover: action.payload.index + 1,
      };
      break;

    default:
      throw new Error();
      break;
  }
};

const Star = ({ lit, onMouseEnter }) => (
  <i className={`${lit ? 'fas' : 'far'} fa-star`} onMouseEnter={onMouseEnter} />
);

const Stars = ({ onSetGiven, count = 5, initialGiven }) => {
  const [state, dispatch] = React.useReducer(starsReducer, {
    given: !!initialGiven,
    lastHover: 0,
    stars: initialGiven || 0,
  });

  return (
    <React.Fragment>
      <div
        className="stars"
        onMouseEnter={() => dispatch(resetGiven())}
        onClick={() => {
          dispatch(setGiven());
          onSetGiven(Number(state.lastHover));
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          <Star
            lit={i < (state.given ? state.stars : state.lastHover)}
            key={i}
            onMouseEnter={() => dispatch(updateLastHover(i))}
          />
        ))}
      </div>
      <div className="starsText">
        {`You are ${
          state.given ? `given ${state.stars}` : `giving ${state.lastHover}`
        } Stars!`}
      </div>
    </React.Fragment>
  );
};

export default Stars;
