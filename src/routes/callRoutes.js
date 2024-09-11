/**
 * This file defines the routes for call analytics.
 * Each route is handled by the CallController.
 * 
 * @module routes/callRoutes
 */

import { Router } from 'express';
import  CallController  from '../controllers/callController.js';

const router = Router();

/**
 * Route to get all call records.
 * @route GET /api/calls
 */
router.get('/calls', CallController.getAllCalls);

/**
 * Route to get a specific call by ID.
 * @route GET /api/calls/:id
 * @param {number} id - Call ID
 */
router.get('/calls/:id', CallController.getCallById);

/**
 * Route to create a new call record.
 * @route POST /api/calls
 */
router.post('/calls', CallController.createCall);

/**
 * Route to update an existing call record.
 * @route PUT /api/calls/:id
 * @param {number} id - Call ID
 */
router.put('/calls/:id', CallController.updateCall);

/**
 * Route to delete a specific call record by ID.
 * @route DELETE /api/calls/:id
 * @param {number} id - Call ID
 */
router.delete('/calls/:id', CallController.deleteCall);

export default router;
