import React, { useEffect, useState } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';

import HighlightText from '../components/HighlightText';

const LOGIN = gql`
  mutation Login($name: String!) {
    login(pokemon: $name) {
      name
    }
  }
`;

const SEARCH_POKEMON = gql`
  query Search($filterText: String!) {
    search(str: $filterText) {
      name
    }
  }
`;

const GET_POKEMON = gql`
  query GetPokemon($name: String!) {
    getPokemon(str: $name) {
      name
      image
    }
  }
`;

export default function PokemonLoginPage({ loginCallback }) {
  const [login, { data }] = useMutation(LOGIN, {
    onCompleted: loginCallback,
  });
  const [search, { data: pokemon }] = useLazyQuery(SEARCH_POKEMON);
  const [getPokemon, { data: selectedPokemon }] = useLazyQuery(GET_POKEMON);
  const [filterText, setFilterText] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const firstMount = React.useRef(true);
  const queuedSearch = React.useRef(null);

  // Debounced Search
  useEffect(() => {
    // Mimic example functionality not loading full list on first load,
    // but will load full list on empty input after some search value.
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }

    clearInterval(queuedSearch.current);
    queuedSearch.current = setTimeout(() => {
      search({ variables: { filterText } });
    }, 300);
  }, [filterText]);

  // Work around to keep old data while new results are loading
  useEffect(() => {
    if (!pokemon) return;
    setSearchResults(
      pokemon.search.map(({ name }) => ({
        name,
        filterText,
      }))
    );
  }, [pokemon, setSearchResults]);

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
                getPokemon({ variables: { name } });
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
            <h1>{selectedPokemon.getPokemon.name}</h1>
            <img src={selectedPokemon.getPokemon.image} />
            <button
              className="continue"
              onClick={() =>
                login({ variables: { name: selectedPokemon.getPokemon.name } })
              }
            >
              Login
            </button>
          </>
        )}
      </div>
    </>
  );
}
