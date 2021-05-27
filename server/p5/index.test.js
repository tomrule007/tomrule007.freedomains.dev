const http = require('http');
const app = require('../app');
//spy on entire module

jest.mock('node-fetch', () => jest.fn(jest.requireActual('node-fetch')));
const fetch = require('node-fetch');
const { startServer, stopServer } = require('../utilities');
const fs = require('fs').promises;

describe('js5/p5', () => {
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

  // END POINT TESTS
  describe('GET /p5/api/session', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('returns status 403 and error message on invalid/missing auth', async () => {
      const response = await fetch(`http://localhost:${port}/p5/api/session`, {
        headers: {
          Authorization: 'Bearer Invalid',
        },
      });
      expect(response.status).toBe(403);
    });

    it('returns user info on valid jwt', async () => {
      const realFetch = jest.requireActual('node-fetch');
      const { Response, Headers } = realFetch;

      const mockUser = { username: 'tomTheGreat' }; // just testing one prop
      const mockJWT = 'fakeFakeFake!';

      const mockResponse = new Response(JSON.stringify(mockUser), {
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });

      fetch.mockImplementationOnce(() => mockResponse);

      // Send real Fetch to server
      const response = await realFetch(
        `http://localhost:${port}/p5/api/session`,
        {
          headers: {
            authorization: `Bearer ${mockJWT}`,
          },
        }
      );

      // Expect server to call 3rd party auth server one time.
      expect(fetch).toHaveBeenCalledWith(
        'https://js5.c0d3.com/auth/api/session',
        {
          headers: { authorization: `Bearer ${mockJWT}` },
        }
      );
      expect(fetch).toHaveBeenCalledTimes(1);

      // Expect fake results to be passed back to real request.
      const body = await response.json();
      expect(body.username).toEqual(mockUser.username);
    });
  });
});
