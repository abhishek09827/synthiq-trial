/**
 * CallModel handles all database operations for the 'call_data' table.
 * It interacts with Supabase to perform CRUD operations on call data.
 * 
 * @module models/callModel
 */

import supabase  from '../config/supabaseClient.js';

const CallModel = {

  /**
   * Fetch all call data from the database.
   * 
   * @returns {Promise<Array>} An array of all call records.
   * @throws {Error} If an error occurs while fetching data.
   */
  async getAllCalls() {
    const { data, error } = await supabase.from('call_data').select('*');
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Fetch a single call record by ID.
   * 
   * @param {number} id - The ID of the call to retrieve.
   * @returns {Promise<Object>} The call record.
   * @throws {Error} If an error occurs or no record is found.
   */
  async getCallById(id) {
    const { data, error } = await supabase.from('call_data')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Insert a new call record into the database.
   * 
   * @param {Object} callData - The call data to insert.
   * @returns {Promise<Object>} The newly created call record.
   * @throws {Error} If an error occurs during insertion.
   */
  async createCall(callData) {
    const { data, error } = await supabase.from('call_data')
      .insert([callData]);
      console.log(callData);
      
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Update an existing call record by ID.
   * 
   * @param {number} id - The ID of the call to update.
   * @param {Object} callData - The updated call data.
   * @returns {Promise<Object>} The updated call record.
   * @throws {Error} If an error occurs during the update.
   */
  async updateCall(id, callData) {
    const { data, error } = await supabase.from('call_data')
      .update(callData)
      .eq('id', id);
    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Delete a call record by ID.
   * 
   * @param {number} id - The ID of the call to delete.
   * @returns {Promise<Object>} The response from the delete operation.
   * @throws {Error} If an error occurs during the deletion.
   */
  async deleteCall(id) {
    const { data, error } = await supabase.from('call_data')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
    return data;
  },
};

export default CallModel;
