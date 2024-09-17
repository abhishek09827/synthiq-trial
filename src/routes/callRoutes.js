/**
 * This file defines the routes for call analytics.
 * Each route is handled by the CallController.
 * 
 * @module routes/callRoutes
 */

import { Router } from 'express';
import  CallController  from '../controllers/callController.js';
const router = Router();

router.get('/poll', CallController.fetchAndUpdateCalls);

router.get('/analytics', CallController.getAnalytics);

// Fetch call logs with filtering and sorting
router.get('/call-logs', CallController.getCallLogs);

// Export call logs to CSV
router.get('/call-logs/export/csv', CallController.exportCallLogsCSV);

// Export call logs to Excel
router.get('/call-logs/export/excel', CallController.exportCallLogsExcel);

export default router;
