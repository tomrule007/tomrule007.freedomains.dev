import React from 'react';
// Action creator's

const setGiven = () => ({ type: 'SET_GIVEN' });
const resetGiven = () => ({ type: 'RESET_GIVEN' });
const updateStarCount = (index) => ({
  type: 'UPDATE_STAR_COUNT',
  payload: { index },
});

// Reducer

const starsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_GIVEN':
      return {
        ...state,
        given: true,
        text: `You have given ${state.lastHover} Stars!`,
      };
      break;

    case 'RESET_GIVEN':
      return { ...state, given: false };
      break;

    case 'UPDATE_STAR_COUNT':
      return state.given
        ? state
        : {
            ...state,
            stars: state.stars.map((_, i) => i <= action.payload.index),
            lastHover: action.payload.index + 1,
            text: `You are giving ${action.payload.index + 1} Stars!`,
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

const Stars = ({ count = 5 }) => {
  React.useEffect(() => {
    document.title = 'Star';
  });
  const [state, dispatch] = React.useReducer(starsReducer, {
    given: false,
    lastHover: 1,
    text: `You are giving 1 Stars!`,
    stars: [true, false, false, false, false],
  });

  return (
    <React.Fragment>
      <div
        className="stars"
        onMouseEnter={() => dispatch(resetGiven())}
        onClick={() => dispatch(setGiven())}
      >
        {state.stars.map((lit, i) => (
          <Star
            lit={lit}
            key={i}
            onMouseEnter={() => dispatch(updateStarCount(i))}
          />
        ))}
      </div>
      <div className="starsText">{state.text}</div>
    </React.Fragment>
  );
};

export default Stars;
