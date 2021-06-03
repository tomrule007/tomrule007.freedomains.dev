const { RESTDataSource } = require('apollo-datasource-rest');

class PokemonAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://pokeapi.co/api/v2/';
  }

  async getAllBasicPokemon(offset = 0) {
    const limit = 1118; // Trying to get them all in one fetch
    const { results, count } = await this.get(`pokemon`, { limit, offset });
    const basicPokemon = Array.isArray(results)
      ? results.map(({ name }) => ({ name }))
      : [];

    // Got to catch them all!
    return count > limit + offset
      ? basicPokemon.concat(await this.getAllBasicPokemon(offset + limit))
      : basicPokemon;
  }

  getPokemon(name) {
    return this.get(`pokemon/${name}`)
      .then((pokemon) => this.pokemonReducer(pokemon))
      .catch((err) => {
        // Assuming pokemon does not exist
        return null;
      });
  }
  pokemonReducer(pokemon) {
    return {
      name: pokemon.name,
      image: pokemon.sprites.front_default,
    };
  }
}

module.exports = { PokemonAPI };
