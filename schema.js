const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type Lesson {
    title: String!
  }

  type BasicPokemon {
    name: String!
  }

  type Pokemon {
    name: String!
    image: String!
  }

  type Query {
    lessons: [Lesson]
    search(str: String!): [BasicPokemon]
    getPokemon(str: String!): Pokemon
  }
`;

const resolvers = {
  Query: {
    lessons: () => {
      console.log('FETCHING THE LESSONS');
      return fetch('https://www.c0d3.com/api/lessons').then((r) => r.json());
    },
    search: async (_, { str }, { dataSources }) => {
      const allBasicPokemon = await dataSources.pokemonAPI.getAllBasicPokemon();
      return allBasicPokemon.filter((pokemon) => pokemon.name.includes(str));
    },
    getPokemon: (_, { str }, { dataSources }) =>
      dataSources.pokemonAPI.getPokemon(str),
  },
};

module.exports = { typeDefs, resolvers };
