import request from 'supertest';
import app from '../index';

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('service', 'MindConnect Backend');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return API status', async () => {
    const response = await request(app)
      .get('/api/v1/status')
      .expect(200);

    expect(response.body).toHaveProperty('message', 'MindConnect API v1 is running');
    expect(response.body).toHaveProperty('timestamp');
  });
});