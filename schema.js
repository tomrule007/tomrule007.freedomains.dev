const { gql } = require('apollo-server-express');
const fetch = require('node-fetch');

const typeDefs = gql`
  type User {
    name: String!
    image: String!
    lessons: [Lesson!]!
    ratings: [Rating!]!
  }

  type Rating {
    title: String!
    rating: Int!
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
    lessons: [Lesson!]!
    search(str: String!): [BasicPokemon!]!
    getPokemon(str: String!): Pokemon
    user: User
  }

  type Mutation {
    login(pokemon: String!): User
    enroll(title: String!): User
    unenroll(title: String!): User
    rateLesson(title: String!, rating: Int!): User
  }
`;

const lessonRatingsByUser = {};

const resolvers = {
  Query: {
    lessons: (_, __, { dataSources }) => dataSources.lessonsAPI.getLessons(),
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
      if (!nameAndImage) throw new Error(`Failed to get pokemon: ${pokemon}`);
      req.session.user = {
        ...nameAndImage,
        lessons: [],
        ratings: lessonRatingsByUser[nameAndImage.name] || [],
      };
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
    rateLesson: async (_, { title, rating }, { req, dataSources }) => {
      // helper
      const hasTitle = (lesson) => lesson.title === title;

      // Early exit checks
      const user = req.session.user;
      if (!user) throw new Error('No user is logged in');

      if (rating < 1 || rating > 5)
        throw new Error(
          `Invalid Rating: ${rating}, must be number between 1 and 5`
        );

      const validTitle = (await dataSources.lessonsAPI.getLessons()).some(
        hasTitle
      );
      if (!validTitle)
        throw new Error(`Invalid title: ${title}, must be a valid lesson`);

      // Update or Add rating
      const ratingIndex = user.ratings.findIndex(hasTitle);
      if (ratingIndex > -1) {
        user.ratings[ratingIndex].rating = rating;
      } else user.ratings.push({ title, rating });

      // persist ratings by pokemon in memory
      lessonRatingsByUser[user.name] = user.ratings;

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
