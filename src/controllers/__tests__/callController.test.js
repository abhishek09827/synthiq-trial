import CallController from '../../controllers/callController.js';
import CallService from '../../services/callService.js';
import ExportUtils from '../../utils/exportUtils.js';
import axios from 'axios';

jest.mock('../../services/callService.js');
jest.mock('../../utils/exportUtils.js');
jest.mock('axios');

// Helper functions to mock request and response objects
const mockRequest = (data = {}) => ({
  auth: { id: data.userId || 'testUserId' },
  query: data.query || {},
  body: data.body || {},
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);
  res.attachment = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('CallController', () => {
  
  // Test for fetchAndUpdateCalls
  describe('fetchAndUpdateCalls', () => {
    it('should fetch and update calls successfully', async () => {
      const req = mockRequest();
      const res = mockResponse();

      axios.get.mockResolvedValue({ data: [{ created_at: '2023-01-01T00:00:00Z' }] });
      CallService.maxUpdatedAt.mockResolvedValue('2022-12-31T23:59:59Z');
      CallService.upsertCalls.mockResolvedValue(true);

      await CallController.fetchAndUpdateCalls(req, res);

      expect(axios.get).toHaveBeenCalledWith('https://api.vapi.ai/call', {
        headers: { Authorization: `Bearer undefined` }
      });
      expect(CallService.upsertCalls).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Calls fetched and updated successfully.' });
    });

    it('should return 400 if user ID is not provided', async () => {
      const req = mockRequest({ userId: null });
      const res = mockResponse();

      await CallController.fetchAndUpdateCalls(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User ID is required' });
    });
  });

  // Test for getAnalytics
  describe('getAnalytics', () => {
    it('should return call analytics', async () => {
      const req = mockRequest();
      const res = mockResponse();

      CallService.getAllCalls.mockResolvedValue([{ duration: 60 }]);
      CallService.calculateTotalMinutes.mockResolvedValue(100);
      CallService.calculateCallCost.mockResolvedValue(50);
      CallService.calculateAverageCallDuration.mockResolvedValue(10);
      CallService.calculateCallVolumeTrends.mockResolvedValue({});
      CallService.calculateCallOutcomeStatistics.mockResolvedValue({});
      CallService.calculatePeakHourAnalysis.mockResolvedValue({});

      await CallController.getAnalytics(req, res);

      expect(CallService.getAllCalls).toHaveBeenCalledWith('testUserId');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        totalMinutes: 100,
        totalCallCost: 50,
        averageCallDuration: 10,
        getCallVolumeTrends: {},
        getCallOutcomes: {},
        getPeakHour: {}
      });
    });

    it('should return 400 if user ID is not provided', async () => {
      const req = mockRequest({ userId: null });
      const res = mockResponse();

      await CallController.getAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User ID is required' });
    });
  });

  // Test for getCallLogs
  describe('getCallLogs', () => {
    it('should fetch call logs with filters', async () => {
      const req = mockRequest({
        query: { startDate: '2023-01-01', endDate: '2023-02-01' }
      });
      const res = mockResponse();

      CallService.fetchCallLogs.mockResolvedValue([{ id: 1, duration: 60 }]);

      await CallController.getCallLogs(req, res);

      expect(CallService.fetchCallLogs).toHaveBeenCalledWith({
        startDate: '2023-01-01',
        endDate: '2023-02-01',
        type: undefined,
        status: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ callLogs: [{ id: 1, duration: 60 }] });
    });
  });

  // Test for exportCallLogsCSV
  describe('exportCallLogsCSV', () => {
    it('should export call logs as CSV', async () => {
      const req = mockRequest({
        query: { startDate: '2023-01-01', endDate: '2023-02-01' }
      });
      const res = mockResponse();

      CallService.fetchCallLogs.mockResolvedValue([{ id: 1, duration: 60 }]);
      ExportUtils.exportToCSV.mockReturnValue('id,duration\n1,60');

      await CallController.exportCallLogsCSV(req, res);

      expect(CallService.fetchCallLogs).toHaveBeenCalled();
      expect(ExportUtils.exportToCSV).toHaveBeenCalledWith([{ id: 1, duration: 60 }]);
      expect(res.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.attachment).toHaveBeenCalledWith('call_logs.csv');
      expect(res.send).toHaveBeenCalledWith('id,duration\n1,60');
    });
  });

  // Test for exportCallLogsExcel
  describe('exportCallLogsExcel', () => {
    it('should export call logs as Excel', async () => {
      const req = mockRequest({
        query: { startDate: '2023-01-01', endDate: '2023-02-01' }
      });
      const res = mockResponse();

      CallService.fetchCallLogs.mockResolvedValue([{ id: 1, duration: 60 }]);
      ExportUtils.exportToExcel.mockResolvedValue(Buffer.from('excel-data'));

      await CallController.exportCallLogsExcel(req, res);

      expect(CallService.fetchCallLogs).toHaveBeenCalled();
      expect(ExportUtils.exportToExcel).toHaveBeenCalledWith([{ id: 1, duration: 60 }]);
      expect(res.header).toHaveBeenCalledWith('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(res.attachment).toHaveBeenCalledWith('call_logs.xlsx');
      expect(res.send).toHaveBeenCalledWith(Buffer.from('excel-data'));
    });
  });
});
