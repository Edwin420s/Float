const request = require('supertest');
const app = require('../../src/app');

describe('Auth Endpoints', () => {
  it('should authenticate wallet', async () => {
    const res = await request(app)
      .post('/api/auth/wallet')
      .send({ walletAddress: '0x123', companyName: 'Test Co' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});