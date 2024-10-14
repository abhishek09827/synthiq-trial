/**
 * CallController handles HTTP request/response logic
 * for call-related operations.
 * 
 * @module controllers/callController
 */

import CallService from '../services/callService.js';
import axios from 'axios';
import { supabase } from '../config/supabaseClient.js';
import ExportUtils from '../utils/exportUtils.js';
const CallController = {

// Polling function to fetch calls and update in Supabase
async fetchAndUpdateCalls(req, res) {
  try {
    // Fetch calls from external API
    const userId = req.auth.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data: user, error: userError } = await supabase.from('users').select('bearer_token').eq('id', userId).single();
    if (userError) {
      return res.status(500).json({ error: 'Error fetching user token', details: userError.message });
    }
    if (!user || !user.bearer_token) {
      return res.status(403).json({ error: 'Unauthorized: No token found for user' });
    }
    const response = await axios.get('https://api.vapi.ai/call', {
      headers: {
        Authorization: `Bearer ${user.bearer_token}`
      },
    });
    const calls = response.data;
    let maxUpdatedAt = await CallService.maxUpdatedAt(req.auth.id);
    let filteredCalls;
    console.log(maxUpdatedAt);

    if (maxUpdatedAt && !isNaN(Date.parse(maxUpdatedAt))) {
      // Compare the first call's endedAt with maxUpdatedAt
      const firstCallEndedAt = new Date(calls[0].endedAt);
      const maxUpdatedAtDate = new Date(maxUpdatedAt);
      if (firstCallEndedAt > maxUpdatedAtDate) {
        filteredCalls = calls.filter(call => call.endedAt > maxUpdatedAt).map(call => ({
          id: call.id,
          phonenumberid: call.phoneNumberId,
          type: call.type,
          startedat: call.startedAt,
          endedat: call.endedAt,
          transcript: call.transcript,
          recordingurl: call.recordingUrl,
          summary: call.summary,
          createdat: call.createdAt,
          updatedat: call.updatedAt,
          cost: call.cost,
          endedreason: call.endedReason,
          user_id: userId,
          costbreakdown: call.costBreakdown,
          costs: call.costs,
          assistantid: call.assistantId
        }));
      } else {
        // If maxUpdatedAt is after the first call's endedAt, do not upsert
        return res.status(200).json({ message: 'No new calls to update.' });
      }
    } else {
      filteredCalls = calls.map(call => ({
        id: call.id,
        phonenumberid: call.phoneNumberId,
        type: call.type,
        startedat: call.startedAt,
        endedat: call.endedAt,
        transcript: call.transcript,
        recordingurl: call.recordingUrl,
        summary: call.summary,
        createdat: call.createdAt,
        updatedat: call.updatedAt,
        cost: call.cost,
        endedreason: call.endedReason,
        user_id: userId,
        costbreakdown: call.costBreakdown,
        costs: call.costs,
        assistantid: call.assistantId
      }));
    }
    // Pass calls to service for Supabase upsert operation
    await CallService.upsertCalls(filteredCalls);

    res.status(200).json({ message: 'Calls fetched and updated successfully.' });
  } catch (error) {
    console.error('Error fetching and updating calls:', error);
    if (error.response && error.response.data) {
      return res.status(500).json({ error: 'Error fetching and updating calls', details: error.response.data.message });
    } else {
      return res.status(500).json({ error: 'Error fetching and updating calls', details: error.message });
    }
  }
},

//  Calculate analytics for calls
async getAnalytics (req, res){
  try {
    const userId = req.auth.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const calls = await CallService.getAllCalls(userId);
    // Calculate Total Minutes, Call Cost, and Average Call Duration
    const totalMinutes = await CallService.calculateTotalMinutes(calls);
    const totalCallCost = await CallService.calculateCallCost(calls);
    const averageCallDuration = await CallService.calculateAverageCallDuration(calls);
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
    res.status(500).json({ error: error.message });
  }
},

// Fetch call logs with filtering and sorting
async getCallLogs(req, res) {
  try {
    const { startDate, endDate, type, sortBy, sortOrder, endedreason } = req.query;

    // Fetch filtered and sorted call logs
    const callLogs = await CallService.fetchCallLogs(req.auth.id,{
      startDate,
      endDate,
      type,
      sortBy,
      sortOrder,
      endedreason
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
    const { startDate, endDate, type, endedreason } = req.query;
    const userId = req.auth.id;

    // Fetch filtered call logs
    const callLogs = await CallService.fetchCallLogs(userId, {
      startDate,
      endDate,
      type,
      endedreason
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
    const userId = req.auth.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { startDate, endDate, type, endedreason } = req.query;

    // Fetch filtered call logs
    const callLogs = await CallService.fetchCallLogs(userId, {
      startDate,
      endDate,
      type,
      endedreason
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
