const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type User {
    name: String
    image: String
    lessons: [Lesson]
  }

  type Lesson @cacheControl(maxAge: 3600) {
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
    user: User
  }

  type Mutation {
    login(pokemon: String!): User
    enroll(title: String!): User
    unenroll(title: String!): User
  }
`;

const resolvers = {
  Query: {
    lessons: (_, __, { dataSources }) => {
      console.log('FETCHING THE LESSONS');
      return dataSources.lessonsAPI.getLessons();
    },
    search: async (_, { str }, { dataSources }) => {
      const allBasicPokemon = await dataSources.pokemonAPI.getAllBasicPokemon();
      return allBasicPokemon.filter((pokemon) => pokemon.name.includes(str));
    },
    getPokemon: (_, { str }, { dataSources }) =>
      dataSources.pokemonAPI.getPokemon(str),
    user: (_, __, { req }) => req.session.user,
  },
  Mutation: {
    login: async (_, { pokemon }, { req, dataSources }) => {
      const nameAndImage = await dataSources.pokemonAPI.getPokemon(pokemon);
      req.session.user = { ...nameAndImage, lessons: [] };
      return req.session.user;
    },
    enroll: async (_, { title }, { req, dataSources }) => {
      // helper
      const hasTitle = (lesson) => lesson.title === title;

      // Early exit checks
      const user = req.session.user;
      if (!user) return null;

      const validTitle = (await dataSources.lessonsAPI.getLessons()).some(
        hasTitle
      );
      if (!validTitle) return user;

      const alreadyEnrolled = user.lessons.some(hasTitle);
      if (alreadyEnrolled) return user;

      // Mutate user lessons
      user.lessons.push({ title });

      return user;
    },
    unenroll: async (_, { title }, { req, dataSources }) => {
      // helper
      const hasTitle = (lesson) => lesson.title === title;

      // Early exit checks
      const user = req.session.user;
      if (!user) return null;

      const titleIndex = user.lessons.findIndex(hasTitle);
      if (titleIndex < 0) return user;

      // Mutate user lessons
      user.lessons.splice(titleIndex, 1);

      return user;
    },
  },
};

module.exports = { typeDefs, resolvers };
