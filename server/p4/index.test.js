const http = require('http');
const app = require('../app');
const fetch = require('node-fetch');
const { startServer, stopServer } = require('../utilities');
const fs = require('fs').promises;

const { FILE_DIR, FILE_TIMEOUT } = require('./index');

describe('js5/p4', () => {
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

  describe('GET /api/files/:fileName?', () => {
    beforeAll(() => {
      jest.spyOn(fs, 'readdir');
      jest.spyOn(fs, 'readFile');
    });
    afterEach(() => {
      fs.readdir.mockClear();
      fs.readFile.mockClear();
    });
    it('No filename -> array of file names', async () => {
      const mockFileNames = ['tom', 'so', 'cool'];
      fs.readdir.mockReturnValueOnce(mockFileNames);

      const response = await fetch(`http://localhost:${port}/api/files`);
      const content = await response.json();

      expect(response.status).toBe(200);
      expect(fs.readdir).toHaveBeenCalledWith(FILE_DIR);
      expect(fs.readdir).toHaveBeenCalledTimes(1);
      expect(content).toEqual(mockFileNames);
    });

    it('filename -> file contents', async () => {
      const fileName = 'test2';
      const mockContent = 'wow tom, you are so good';

      fs.readFile.mockReturnValue(mockContent);

      const response = await fetch(
        `http://localhost:${port}/api/files/${fileName}`
      );
      const { content } = await response.json();

      expect(response.status).toBe(200);
      expect(fs.readFile).toHaveBeenCalledWith(FILE_DIR + fileName);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(content).toEqual(mockContent);
    });
  });

  describe('POST /api/files', () => {
    const post = (data) =>
      fetch(`http://localhost:${port}/api/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

    beforeEach(() => {
      jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
      jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);
      jest.useFakeTimers();
    });
    afterEach(() => {
      fs.unlink.mockClear();
      fs.writeFile.mockClear();
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('no name -> respond with error msg', async () => {
      const response = await post({ name: '', content: 'tom' });
      const { error } = await response.json();
      expect(response.status).toBe(400);
      expect(error.length).toBeGreaterThan(0);
    });

    it('{name,content} -> save file, content and return status 201', async () => {
      const data = { name: 'tom', content: 'the great one' };
      const response = await post(data);

      expect(fs.writeFile).toHaveBeenCalledWith(
        FILE_DIR + data.name,
        data.content
      );

      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(201);
    });

    it('should delete saved files after FILE_TIMEOUT (ms)', async () => {
      const data = { name: 'myTimeIsShort', content: 'reallyShort' };
      await post(data);

      jest.runAllTimers();

      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        FILE_TIMEOUT
      );
      expect(fs.unlink).toHaveBeenCalledWith(FILE_DIR + data.name);
    });
  });
});
