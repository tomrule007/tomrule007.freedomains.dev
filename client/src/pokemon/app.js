import './new.min.css';
import './pokemonSearch.css';

import React, { useEffect, useState } from 'react';

import PokemonLessonPage from './pages/PokemonLessonPage';
import PokemonLoginPage from './pages/PokemonLoginPage';
import ReactDOM from 'react-dom';
import { sendQuery } from './utilities';

const getUser = () =>
  sendQuery(`{
    user {name, image, lessons {title}},
    lessons {title}
  }`);

function Pokemon() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then((result) => {
      if (result?.login?.name) setLoggedIn(true);

      setLoading(false);
    });
  }, [setLoggedIn]);

  const handleLogin = (name) => {
    sendQuery(`mutation {login (pokemon: "${name}") {name}}`).then((result) => {
      if (result?.login?.name) setLoggedIn(true);
    });
  };

  return (
    <div>
      {loggedIn ? (
        <PokemonLessonPage />
      ) : loading ? null : (
        <PokemonLoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

ReactDOM.render(<Pokemon />, document.getElementById('root'));
