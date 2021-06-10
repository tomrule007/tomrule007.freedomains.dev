import React, { useEffect, useState } from 'react';

import HighlightText from '../components/HighlightText';
import { sendQuery } from '../utilities';

export default function PokemonLoginPage({ onLogin }) {
  const [filterText, setFilterText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  const firstMount = React.useRef(true);
  const queuedSearch = React.useRef(null);
  useEffect(() => {
    // Mimic example functionality not loading full list on first load,
    // but will load full list on empty input after some search value.
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }

    clearInterval(queuedSearch.current);
    queuedSearch.current = setTimeout(() => {
      sendQuery(`{search(str: "${filterText}") {name}}`).then((data) => {
        const results = data.search || [];
        setSearchResults(
          results.map(({ name }) => ({
            name,
            filterText,
          }))
        );
      });
    }, 300);
  }, [filterText, setSearchResults]);

  const loadSelection = (name) => {
    sendQuery(`{getPokemon(str:"${name}"){name, image}}`).then((result) => {
      setSelectedPokemon({
        name: result.getPokemon.name,
        imageSrc: result.getPokemon.image,
      });
    });
  };

  return (
    <>
      <h1>Pokemon Search</h1>
      <input
        className="searchBox"
        type="text"
        onChange={(event) => setFilterText(event.target.value)}
      />
      <div className="suggestions">
        {!selectedPokemon &&
          searchResults.map(({ name, filterText }, i) => (
            <h3
              key={i}
              onClick={() => {
                loadSelection(name);
              }}
            >
              <HighlightText highlight={filterText} text={name} />
            </h3>
          ))}
      </div>

      <hr />
      <div className="selectedSection">
        {selectedPokemon && (
          <>
            <h1>{selectedPokemon.name}</h1>
            <img src={selectedPokemon.imageSrc} />
            <button
              className="continue"
              onClick={() => onLogin(selectedPokemon.name)}
            >
              Login
            </button>
          </>
        )}
      </div>
    </>
  );
}
