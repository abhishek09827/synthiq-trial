import request from 'supertest';
import app from '../../../app.js'; // Assuming Express app is exported from this file
import AuthMiddleware from '../../middlewares/authMiddlewares.js';
import CallService from '../../services/callService.js';
import UserService from '../../services/userService.js';

// Mock the Auth Middleware and Services
jest.mock('../../middlewares/authMiddlewares.js');
jest.mock('../../services/callService.js');
jest.mock('../../services/userService.js');

describe('Call Routes Integration Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  describe('GET /poll', () => {
    it('should return 403 if no valid token is provided', async () => {
      AuthMiddleware.verifyClerkToken.mockImplementation((req, res, next) => {
        res.status(403).json({ error: 'Unauthorized' });
      });

      const res = await request(app).get('/poll');
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });

    it('should fetch and update calls with valid token', async () => {
      AuthMiddleware.verifyClerkToken.mockImplementation((req, res, next) => next());
      CallService.fetchAndUpdateCalls.mockResolvedValueOnce();

      const res = await request(app)
        .get('/poll')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Calls fetched and updated successfully.' });
    });
  });

  describe('GET /analytics', () => {
    it('should return analytics data for valid token', async () => {
      AuthMiddleware.verifyClerkToken.mockImplementation((req, res, next) => next());
      CallService.getAnalytics.mockResolvedValueOnce({
        totalMinutes: 100,
        totalCallCost: 10,
        averageCallDuration: 60,
      });

      const res = await request(app)
        .get('/analytics')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        totalMinutes: 100,
        totalCallCost: 10,
        averageCallDuration: 60,
      });
    });
  });

  describe('GET /call-logs', () => {
    it('should return call logs with valid token', async () => {
      AuthMiddleware.verifyClerkToken.mockImplementation((req, res, next) => next());
      CallService.fetchCallLogs.mockResolvedValueOnce([{ id: 1, type: 'inbound', status: 'completed' }]);

      const res = await request(app)
        .get('/call-logs')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ callLogs: [{ id: 1, type: 'inbound', status: 'completed' }] });
    });
  });

  describe('GET /call-logs/export/csv', () => {
    it('should export call logs to CSV', async () => {
      AuthMiddleware.verifyClerkToken.mockImplementation((req, res, next) => next());
      CallService.fetchCallLogs.mockResolvedValueOnce([{ id: 1, type: 'inbound', status: 'completed' }]);
      CallService.exportToCSV.mockReturnValueOnce('id,type,status\n1,inbound,completed');

      const res = await request(app)
        .get('/call-logs/export/csv')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toEqual('id,type,status\n1,inbound,completed');
    });
  });

  describe('POST /login', () => {
    it('should return 403 for invalid token', async () => {
      AuthMiddleware.verifyClerkToken.mockImplementation((req, res, next) => {
        res.status(403).json({ error: 'Unauthorized' });
      });

      const res = await request(app).post('/login');
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });

    it('should login successfully with valid token', async () => {
      AuthMiddleware.verifyClerkToken.mockImplementation((req, res, next) => next());
      UserService.login.mockResolvedValueOnce({ userId: 1, role: 'User' });

      const res = await request(app)
        .post('/login')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ userId: 1, role: 'User' });
    });
  });

  describe('GET /super-admin', () => {
    it('should return 403 for unauthorized access to admin route', async () => {
      AuthMiddleware.verifyClerkToken.mockImplementation((req, res, next) => {
        res.status(403).json({ error: 'Unauthorized' });
      });

      const res = await request(app).get('/super-admin');
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });

    it('should allow access for Super Admin with valid token', async () => {
      AuthMiddleware.verifyClerkToken.mockImplementation((req, res, next) => next());
      AuthMiddleware.checkRole.mockImplementation((role) => (req, res, next) => {
        if (role === 'Super Admin') next();
        else res.status(403).json({ error: 'Forbidden' });
      });
      UserService.getUsers.mockResolvedValueOnce([{ id: 1, email: 'admin@example.com' }]);

      const res = await request(app)
        .get('/super-admin')
        .set('Authorization', 'Bearer super-admin-token');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ id: 1, email: 'admin@example.com' }]);
    });
  });

  describe('POST /alert', () => {
    it('should send an alert notification email', async () => {
      AuthMiddleware.verifyClerkToken.mockImplementation((req, res, next) => next());
      const res = await request(app)
        .post('/alert')
        .send({ email: 'user@example.com', message: 'Test alert' })
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Alert notification sent successfully.' });
    });
  });
});
