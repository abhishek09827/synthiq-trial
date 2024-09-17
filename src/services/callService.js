import  supabase  from '../config/supabaseClient.js';
// Service to upsert multiple calls
export async function upsertCalls(calls) {
    for (const call of calls) {
      await upsertCall(call);
    }
  }
  
  // Service to upsert a single call
export async function upsertCall(call) {
    const { id, assistantId, type, startedAt, endedAt, transcript, recordingUrl, summary, orgId, cost, status, endedReason, updatedAt } = call;
  
    try {
      // Check if call exists in the database
      const { data: existingCall, error } = await supabase
        .from('calls')
        .select('id, updated_at')
        .eq('id', id)
        .single();
  
      if (existingCall) {
        // Update only if the updatedAt is newer
        if (new Date(existingCall.updated_at) < new Date(updatedAt)) {
          await supabase
            .from('calls')
            .update({
              assistant_id: assistantId,
              type,
              started_at: startedAt,
              ended_at: endedAt,
              transcript,
              recording_url: recordingUrl,
              summary,
              org_id: orgId,
              cost,
              status,
              ended_reason: endedReason,
              updated_at: updatedAt
            })
            .eq('id', id);
        }
      } else {
        // Insert new call if not exists
        await supabase
          .from('calls')
          .insert({
            id,
            assistant_id: assistantId,
            type,
            started_at: startedAt,
            ended_at: endedAt,
            transcript,
            recording_url: recordingUrl,
            summary,
            org_id: orgId,
            cost,
            status,
            ended_reason: endedReason,
            created_at: new Date(),
            updated_at: updatedAt
          });
      }
    } catch (error) {
      console.error('Error upserting call:', error);
    }
  }

export async function calculateTotalMinutes() {
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
  };
  
  // Calculate Total Call Cost
  export async function calculateCallCost() {
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
  };
  
  // Calculate Average Call Duration
  export async function calculateAverageCallDuration() {
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
  };