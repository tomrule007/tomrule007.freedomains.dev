const request = require('supertest');
const app = require('../app');
const fs = require('fs').promises;
describe('js5/p7', () => {
  let jobId;
  const agent = request.agent(app);
  it('POST /p7/files (with file) returns 202 w/ jobId', async () => {
    const response = await agent
      .post('/p7/files')
      .attach('userFiles', './public/p7/test1.png')
      .expect('Content-Type', /json/)
      .expect(202);
    expect(response.body).toEqual(expect.any(String));
    jobId = response.body;
  });

  // TODO: Figure out how to best test long running processes
  // response comes back before Tesseract has a chance to run
  xit('GET /p7/api/job/:jobid returns 200 w/ job progress', async () => {
    expect(jobId).toEqual(expect.any(String));
    await new Promise((r) => setTimeout(r, 2000));
    const response = await agent
      .get(`/p7/api/job/${jobId}`)
      .expect('Content-Type', /json/)
      .expect(200);

    const goodResponse = expect.objectContaining({
      status: expect.any(String),
      progress: expect.any(Number),
    });

    expect(response.body).toEqual(goodResponse);
  });
});
