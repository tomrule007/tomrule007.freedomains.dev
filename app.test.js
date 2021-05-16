var http = require('http');
const { app } = require('./app');
const fetch = require('node-fetch');
const { startServer, stopServer } = require('./utilities');

describe('js5/p2', () => {
  let server;
  let port;

  beforeAll(async (done) => {
    try {
      [server, port] = await startServer(app);
    } catch (error) {
      console.error('Server Starting Error', error);
    }

    done();
  });

  afterAll(() => stopServer(server, port));

  it('server starts', () => {
    expect(server instanceof http.Server).toBe(true);
  });
  it('port is set', () => {
    expect(typeof port).toBe('number');
  });
  describe('GET /commands', () => {
    let response;
    beforeAll(async () =>
      fetch(`http://localhost:${port}/commands`).then((res) => {
        response = res;
      })
    );
    it('respond with status 200', () => {
      expect(response.status).toBe(200);
    });
    it("responses with content-type  'text/html; charset=utf-8'", () => {
      expect(response.headers.get('content-type')).toBe(
        'text/html; charset=utf-8'
      );
    });
  });
  describe('POST /commands', () => {
    let response;
    beforeAll(async () =>
      fetch(`http://localhost:${port}/commands`).then((res) => {
        response = res;
      })
    );
    afterAll(() => {
      response = null;
    });
    it('respond with status 200', () => {
      expect(response.status).toBe(200);
    });
    it("responses with content-type  'text/html; charset=utf-8'", () => {
      expect(response.headers.get('content-type')).toBe(
        'text/html; charset=utf-8'
      );
    });
  });
});
