/**
 * CallController handles HTTP request/response logic
 * for call-related operations.
 * 
 * @module controllers/callController
 */

import CallService from '../services/callService.js';
import axios from 'axios';
import ExportUtils from '../utils/exportUtils.js';
const CallController = {

// Polling function to fetch calls and update in Supabase
async fetchAndUpdateCalls(req, res) {
  try {
    // Fetch calls from external API
    let maxUpdatedAt = await CallService.maxUpdatedAt();
    // Ensure maxUpdatedAt is a valid date string
    if (isNaN(Date.parse(maxUpdatedAt))) {
      maxUpdatedAt = new Date(0).toISOString(); // Default to epoch if invalid
    }
    
    const response = await axios.get('https://api.vapi.ai/call', {
      headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`
      },
    });
    const calls = response.data;
    const filteredCalls = calls.filter(call => call.created_at > maxUpdatedAt);
    // Pass calls to service for Supabase upsert operation
    await CallService.upsertCalls(filteredCalls);

    res.status(200).json({ message: 'Calls fetched and updated successfully.' });
  } catch (error) {
    console.error('Error fetching and updating calls:', error);
    res.status(500).json({ error: 'Error fetching and updating calls' });
  }
},

//  Calculate analytics for calls
async getAnalytics (req, res){
  try {
    const calls = await CallService.getAllCalls();
    // Calculate Total Minutes, Call Cost, and Average Call Duration
    const totalMinutes = await CallService.calculateTotalMinutes();
    const totalCallCost = await CallService.calculateCallCost();
    const averageCallDuration = await CallService.calculateAverageCallDuration();
    const getCallVolumeTrends  = await CallService.calculateCallVolumeTrends(calls);
    const getCallOutcomes  = await CallService.calculateCallOutcomeStatistics(calls);
    const getPeakHour = await CallService.calculatePeakHourAnalysis(calls);

    // Return all the analytics in one response
    res.status(200).json({
      totalMinutes,
      totalCallCost,
      averageCallDuration,
      getCallVolumeTrends,
      getCallOutcomes,
      getPeakHour
    });
  } catch (error) {
    console.error('Error calculating analytics:', error);
    res.status(500).json({ error: 'Error calculating analytics' });
  }
},

// Fetch call logs with filtering and sorting
async getCallLogs(req, res) {
  try {
    const { startDate, endDate, type, status, sortBy, sortOrder } = req.query;

    // Fetch filtered and sorted call logs
    const callLogs = await CallService.fetchCallLogs({
      startDate,
      endDate,
      type,
      status,
      sortBy,
      sortOrder
    });

    res.status(200).json({ callLogs });
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Error fetching call logs' });
  }
},

// Export call logs to CSV
async exportCallLogsCSV (req, res){
  try {
    const { startDate, endDate, type, status } = req.query;

    // Fetch filtered call logs
    const callLogs = await CallService.fetchCallLogs({
      startDate,
      endDate,
      type,
      status
    });

    // Export to CSV
    const csv = ExportUtils.exportToCSV(callLogs);
    
    // Set response headers for CSV download
    res.header('Content-Type', 'text/csv');
    res.attachment('call_logs.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting call logs to CSV:', error);
    res.status(500).json({ error: 'Error exporting call logs to CSV' });
  }
},

// Export call logs to Excel
async exportCallLogsExcel(req, res) {
  try {
    const { startDate, endDate, type, status } = req.query;

    // Fetch filtered call logs
    const callLogs = await CallService.fetchCallLogs({
      startDate,
      endDate,
      type,
      status
    });

    // Export to Excel
    const buffer = await ExportUtils.exportToExcel(callLogs);
    
    // Set response headers for Excel download
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('call_logs.xlsx');
    return res.send(buffer);
  } catch (error) {
    console.error('Error exporting call logs to Excel:', error);
    res.status(500).json({ error: 'Error exporting call logs to Excel' });
  }
},

};

export default CallController;
