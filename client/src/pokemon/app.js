import './new.min.css';
import './pokemonSearch.css';

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
  useQuery,
} from '@apollo/client';

import PokemonLessonPage from './pages/PokemonLessonPage';
import PokemonLoginPage from './pages/PokemonLoginPage';
import React from 'react';
import ReactDOM from 'react-dom';

// TODO: setup cache id fields
const cacheOptions = {
  typePolicies: {
    User: {
      keyFields: ['name'],
    },
    Lesson: {
      keyFields: ['title'],
    },
  },
};

const client = new ApolloClient({
  uri:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/graphql'
      : 'https://tomrule007.freedomains.dev/graphql',
  cache: new InMemoryCache(cacheOptions),
});

const GET_USER = gql`
  query {
    user {
      name
    }
  }
`;
function Pokemon() {
  const { loading, error, data, refetch } = useQuery(GET_USER);
  console.log({ loading, error, data });

  return (
    <div>
      {data?.user ? (
        <PokemonLessonPage />
      ) : loading ? null : (
        <PokemonLoginPage loginCallback={refetch} />
      )}
    </div>
  );
}

ReactDOM.render(
  <ApolloProvider client={client}>
    <Pokemon />
  </ApolloProvider>,
  document.getElementById('root')
);
