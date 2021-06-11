// DIY 1 hour cache for the lessons endpoint
const simpleCache = {
  store: null,
  lastSet: null,
  maxAge: 60 * 60 * 1000, // 1hour in ms
  get: function () {
    return this.lastSet + this.maxAge > Date.now() ? this.store : null;
  },
  set: function (value) {
    this.lastSet = Date.now();
    return (this.store = value);
  },
};

const { RESTDataSource } = require('apollo-datasource-rest');

class LessonsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://www.c0d3.com/api/';
  }

  async getLessons() {
    const cachedResults = simpleCache.get();
    if (cachedResults) return cachedResults;

    try {
      const results = await this.get('lessons');
      const lessons = Array.isArray(results)
        ? results.map(this.lessonReducer)
        : [];

      simpleCache.set(lessons);
      return lessons;
    } catch (error) {
      console.log({ error });
      // TODO: Add real error handler
      return [];
    }
  }
  lessonReducer(lesson) {
    return {
      title: lesson.title,
    };
  }
}

module.exports = { LessonsAPI };
