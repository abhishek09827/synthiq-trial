// src/routes/__tests__/callRoutes.integration.test.js
import request from 'supertest';
import express from 'express';
import callRoutes from '../callRoutes.js';

const app = express();
app.use(express.json());
app.use('/api', callRoutes);

describe('Call Routes Integration Tests', () => {
  test('GET /api/analytics should return analytics data', async () => {
    const response = await request(app).get('/api/analytics');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      totalMinutes: expect.any(String),
      totalCallCost: expect.any(String),
      averageCallDuration: expect.any(String),
      getCallVolumeTrends: expect.any(Object),
      getCallOutcomes: expect.any(Object),
      getPeakHour: expect.any(String)
    }));
  });

  test('GET /api/call-logs should return call logs', async () => {
    const response = await request(app).get('/api/call-logs');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('callLogs');
    expect(Array.isArray(response.body.callLogs)).toBe(true);
  });
  test('GET /api/nonexistent should return 404 for non-existent route', async () => {
    const response = await request(app).get('/api/nonexistent');
    expect(response.statusCode).toBe(404);
  });
// Additional integration tests
});
