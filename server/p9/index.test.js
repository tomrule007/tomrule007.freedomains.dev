const app = require('../app');
const request = require('supertest');
const fs = require('fs');
const { MOCK_USER } = require('./index');

describe('js5/p9]', () => {
  describe('POST /p9/api/user', () => {
    it('send a username and receive a an auth cookie', async () => {
      const response = await request(app)
        .post('/p9/api/user')
        .send({ username: 'TomIsCool' })
        .expect(201)
        .expect('set-cookie', /loginCookie=/);
    });
  });
  describe('GET /p9/api/user', () => {
    it('Sending an auth cookie returns userName', async () => {
      const { id, username } = MOCK_USER;
      await request(app)
        .get('/p9/api/user')
        .set('Cookie', [`loginCookie=${id};`])
        .expect(200)
        .expect('Content-Type', /json/)
        .expect({ username });
    });
  });
});
