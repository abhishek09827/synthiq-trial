import  {supabase}  from '../config/supabaseClient.js';
import { triggerNotification } from './notificationService.js';
// Define usage thresholds
const USAGE_THRESHOLDS = {
  HIGH: process.env.USAGE_THRESHOLD_HIGH,
  CRITICAL:process.env.USAGE_THRESHOLD_CRITICAL,
}
const CallService = {
  // Service to upsert multiple calls
async upsertCalls(calls) {
      await supabase
        .from('calls')
        .insert(calls);
},

async maxUpdatedAt() {
    
    // Fetch the maximum updated_at timestamp from the existing calls
    const { data: maxUpdatedAtData, error: maxUpdatedAtError } = await supabase
      .from('calls')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (maxUpdatedAtError) {
      console.error('Error fetching max updated_at:', maxUpdatedAtError);
      return;
    }
    return maxUpdatedAtData[0].created_at;
},

async getAllCalls() {
  const { data, error } = await supabase.from('calls').select('*');
  if (error) throw error;
  return data;
},

async calculateTotalMinutes() {
    const { data, error } = await supabase
      .from('calls') 
      .select('started_at, ended_at');

    if (error) {
      throw new Error('Error fetching call data for total minutes');
    }

    let totalMinutes = 0;

    data.forEach(call => {
      const startTime = new Date(call.started_at);
      const endTime = new Date(call.ended_at);
      const duration = (endTime - startTime) / 1000 / 60; // Convert milliseconds to minutes
      totalMinutes += duration;
    });

    return totalMinutes.toFixed(2);
  },

  // Calculate Total Call Cost
async calculateCallCost() {
    const { data, error } = await supabase
      .from('calls')
      .select('cost');

    if (error) {
      throw new Error('Error fetching call data for call cost');
    }

    let totalCost = 0;

    data.forEach(call => {
      totalCost += call.cost;
    });

    return totalCost.toFixed(2);
},

  // Calculate Average Call Duration
async calculateAverageCallDuration() {
  const { data, error } = await supabase
    .from('calls')
    .select('started_at, ended_at');

  if (error) {
    throw new Error('Error fetching call data for average call duration');
  }

  let totalDuration = 0;

  data.forEach(call => {
    const startTime = new Date(call.started_at);
    const endTime = new Date(call.ended_at);
    const duration = (endTime - startTime) / 1000 / 60; // Convert milliseconds to minutes
    totalDuration += duration;
  });

  const averageDuration = totalDuration / data.length;
  return averageDuration.toFixed(2);
},

// Calculate Call Volume Trends (Group by Date)
async calculateCallVolumeTrends (calls) {
  const trends = {};
  calls.forEach((call) => {
    const date = new Date(call.created_at).toISOString().split('T')[0];
    if (!trends[date]) {
      trends[date] = 0;
    }
    trends[date]++;
  });
  return trends;
},

// Peak Hour Analysis
async calculatePeakHourAnalysis (calls) {
  const hourCounts = {};
  calls.forEach((call) => {
    const hour = new Date(call.started_at).getUTCHours();
    if (!hourCounts[hour]) {
      hourCounts[hour] = 0;
    }
    hourCounts[hour]++;
  });

  const peakHour = Object.keys(hourCounts).reduce((a, b) =>
    hourCounts[a] > hourCounts[b] ? a : b
  );
  return peakHour;
},

// Call Outcome Statistics
async calculateCallOutcomeStatistics (calls) {
  const outcomes = {};
  calls.forEach((call) => {
    const reason = call.ended_reason;
    if (!outcomes[reason]) {
      outcomes[reason] = 0;
    }
    outcomes[reason]++;
  });
  return outcomes;
},

// Fetch call logs with filtering and sorting
async fetchCallLogs(filters){
  const { startDate, endDate, type, status, sortBy, sortOrder } = filters;

  let query = supabase
    .from('calls')
    .select('*');

  // Apply date range filter
  if (startDate && endDate) {
    query = query.gte('created_at', startDate).lte('ended_at', endDate);
  }

  // Apply type filter
  if (type) {
    query = query.eq('type', type);
  }

  // Apply status filter
  if (status) {
    query = query.eq('status', status);
  }

  // Apply sorting
  if (sortBy) {
    const order = sortOrder === 'desc' ? 'desc' : 'asc'; // Default to ascending order
    query = query.order(sortBy, { ascending: order === 'asc' });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error('Error fetching call logs');
  }

  return data;
},


// Monitor usage and trigger notifications
async monitorUsage(user) {
  const { usage, limit, email } = user;
  console.log(usage, limit, email);
  const usageRatio = usage / limit;

  if (usageRatio >= USAGE_THRESHOLDS.CRITICAL) {
    await triggerNotification(email, 'CRITICAL_USAGE', { usage, limit });
  } if (usageRatio >= USAGE_THRESHOLDS.HIGH) {
    await triggerNotification(email, 'HIGH_USAGE', { usage, limit });
  }
},

// Monitor budget and trigger notifications
async monitorBudget(user) {
  const { spent, budget, email } = user;
  const budgetRatio = spent / budget;

  if (budgetRatio >= USAGE_THRESHOLDS.CRITICAL) {
    await triggerNotification(email, 'CRITICAL_BUDGET', { spent, budget });
  } else if (budgetRatio >= USAGE_THRESHOLDS.HIGH) {
    await triggerNotification(email, 'HIGH_BUDGET', { spent, budget });
  }
}

};
export default CallService;

