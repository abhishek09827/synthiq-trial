/**
 * CallController handles HTTP request/response logic
 * for call-related operations.
 * 
 * @module controllers/callController
 */

import CallModel  from '../models/callModel.js';

const CallController = {

  /**
   * Fetch all call records and return them in the response.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} Sends a JSON response with call data.
   */
  async getAllCalls(req, res, next) {
    try {
      const data = await CallModel.getAllCalls();
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetch a specific call record by ID and return it in the response.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} Sends a JSON response with the call data.
   */
  async getCallById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await CallModel.getCallById(id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new call record and return the created data.
   * 
   * @param {Object} req - Express request object containing call data.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} Sends a JSON response with the newly created call record.
   */
  async createCall(req, res, next) {
    try {
      const callData = req.body;
      
      const data = await CallModel.createCall(callData);
      res.status(201).json({"Success" : "Call Added Successfully !"});
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update an existing call record by ID and return the updated data.
   * 
   * @param {Object} req - Express request object containing updated data.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} Sends a JSON response with the updated call record.
   */
  async updateCall(req, res, next) {
    try {
      const { id } = req.params;
      const callData = req.body;
      const data = await CallModel.updateCall(id, callData);
      res.status(201).json({"Success" : "Call Updated Successfully !"});
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a specific call record by ID and return a success message.
   * 
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} Sends a JSON response with the success message.
   */
  async deleteCall(req, res, next) {
    try {
      const { id } = req.params;
      await CallModel.deleteCall(id);
      res.json({ message: 'Call data deleted successfully.' });
    } catch (error) {
      next(error);
    }
  },
};

export default CallController;
