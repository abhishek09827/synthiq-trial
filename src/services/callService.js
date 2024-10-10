import  {supabase}  from '../config/supabaseClient.js';
import { triggerNotification } from './notificationService.js';
import { sendSlackNotification } from './slackService.js';

// Define usage thresholds
const USAGE_THRESHOLDS = {
  HIGH: process.env.USAGE_THRESHOLD_HIGH,
  CRITICAL:process.env.USAGE_THRESHOLD_CRITICAL,
}
const CallService = {
  // Service to upsert multiple calls
async upsertCalls(calls) {
      const { data, error } = await supabase
        .from('calls')
        .insert(calls);
      if (error) {
        console.error('Error inserting calls:', error);
        throw new Error('Failed to upsert calls');
      }
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

    // Check if the table is empty
    if (maxUpdatedAtData.length === 0) {
      console.warn('No calls found in the table.');
      return null; // or return a default value if needed
    }

    return maxUpdatedAtData[0].created_at;
},

async getAllCalls(userId) {
  const { data, error } = await supabase.from('calls').select('*').eq('user_id', userId);
  if (error) throw error;
  return data;
},

async calculateTotalMinutes(calls) {

    let totalMinutes = 0;

    calls.forEach(call => {
      const startTime = new Date(call.startedat);
      const endTime = new Date(call.endedat);
      const duration = (endTime - startTime) / 1000 / 60; // Convert milliseconds to minutes
      totalMinutes += duration;
    });

    return totalMinutes.toFixed(2);
  },

  // Calculate Total Call Cost
async calculateCallCost(calls) {

    let totalCost = 0;

    calls.forEach(call => {
      totalCost += call.cost;
    });

    return totalCost.toFixed(2);
},

  // Calculate Average Call Duration
async calculateAverageCallDuration(calls) {
  let totalDuration = 0;

  calls.forEach(call => {
    const startTime = new Date(call.startedat);
    const endTime = new Date(call.endedat);
    const duration = (endTime - startTime) / 1000 / 60; // Convert milliseconds to minutes
    totalDuration += duration;
  });

  const averageDuration = totalDuration / calls.length;
  return averageDuration.toFixed(2);
},

// Calculate Call Volume Trends (Group by Date)
async calculateCallVolumeTrends (calls) {
  const trends = {};
  calls.forEach((call) => {
    const date = new Date(call.createdat).toISOString().split('T')[0];
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
    const hour = new Date(call.startedat).getUTCHours();
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
    const reason = call.endedreason;
    if (!outcomes[reason]) {
      outcomes[reason] = 0;
    }
    outcomes[reason]++;
  });
  return outcomes;
},

// Fetch call logs with filtering and sorting
async fetchCallLogs(userId, filters){
  const { startDate, endDate, type, sortBy, sortOrder, endedreason } = filters || {};

  let query = supabase
    .from('calls')
    .select('*')
    .eq('user_id', userId);

  // Apply date range filter
  if (startDate && endDate) {
    query = query.gte('startedat', startDate).lte('endedat', endDate);
  }

  if (endedreason) {
    query = query.eq('endedreason', endedreason)
  }

  // Apply type filter
  if (type) {
    query = query.eq('type', type);
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
  const { usage, limit, email, alertMethod, slackChannel } = user;
  const usageRatio = usage / limit;

  if (usageRatio >= USAGE_THRESHOLDS.CRITICAL) {
    if (alertMethod === 'mail') {
      await triggerNotification(email, 'CRITICAL_USAGE', { usage, limit });
    } else if (alertMethod === 'slack' && slackChannel) {
      await sendSlackNotification(slackChannel, `Critical Usage Alert: Your usage (${usage}) has almost reached your limit (${limit})!`);
    }
  } else if (usageRatio >= USAGE_THRESHOLDS.HIGH) {
    if (alertMethod === 'mail') {
      await triggerNotification(email, 'HIGH_USAGE', { usage, limit });
    } else if (alertMethod === 'slack' && slackChannel) {
      await sendSlackNotification(slackChannel, `High Usage Alert: Your usage (${usage}) is approaching your limit (${limit}).`);
    }
  }
},

// Monitor budget and trigger notifications
async monitorBudget(user) {
  const { spent, budget, email, alertMethod, slackChannel } = user;
  const budgetRatio = spent / budget;

  if (budgetRatio >= USAGE_THRESHOLDS.CRITICAL) {
    if (alertMethod === 'mail') {
      await triggerNotification(email, 'CRITICAL_BUDGET', { spent, budget });
    } else if (alertMethod === 'slack' && slackChannel) {
      await sendSlackNotification(slackChannel, `Critical Budget Alert: Your spent amount (${spent}) has almost reached your budget (${budget})!`);
    }
  } else if (budgetRatio >= USAGE_THRESHOLDS.HIGH) {
    if (alertMethod === 'mail') {
      await triggerNotification(email, 'HIGH_BUDGET', { spent, budget });
    } else if (alertMethod === 'slack' && slackChannel) {
      await sendSlackNotification(slackChannel, `High Budget Alert: Your spent amount (${spent}) is approaching your budget (${budget}).`);
    }
  }
}

};
export default CallService;
