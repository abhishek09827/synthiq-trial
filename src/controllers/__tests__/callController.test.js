// src/controllers/__tests__/callController.test.js
import CallController from '../callController.js';
import { jest } from '@jest/globals';

describe('CallController', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should return analytics data', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await CallController.getAnalytics(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      totalMinutes: expect.any(String),
      totalCallCost: expect.any(String),
      averageCallDuration: expect.any(String),
      getCallVolumeTrends: expect.any(Object),
      getCallOutcomes: expect.any(Object),
      getPeakHour: expect.any(String)
    }));
  });

  test('should handle error when fetching analytics data', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(CallController, 'getAnalytics').mockImplementationOnce(() => {
      res.status(500).json({"error":'Error calculating analytics'});
    });

    await CallController.getAnalytics(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error calculating analytics' });
  });

  test('should fetch and update calls successfully', async () => {
    jest.setTimeout(10000);
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await CallController.fetchAndUpdateCalls(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Calls fetched and updated successfully.' });
  });

  test('should handle error when fetching and updating calls', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(CallController, 'fetchAndUpdateCalls').mockImplementationOnce(() => {
      res.status(500).json({"error":'Error fetching and updating calls'});
    });

    await CallController.fetchAndUpdateCalls(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching and updating calls' });
  });

  test('should return call logs', async () => {
    const req = { query: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await CallController.getCallLogs(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should handle error when fetching call logs', async () => {
    const req = { query: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(CallController, 'getCallLogs').mockImplementationOnce(() => {
        res.status(500).json({"error":'Error fetching call logs'});
    });

    await CallController.getCallLogs(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching call logs' });
  });
});
