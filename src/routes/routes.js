/**
 * This file defines the routes for call analytics.
 * Each route is handled by the CallController.
 * 
 * @module routes/callRoutes
 */

import { Router } from 'express';
import CallController from '../controllers/callController.js';
import AuthMiddleware from '../middlewares/authMiddlewares.js';
import UserController from '../controllers/userController.js';
import EmailController from '../controllers/emailController.js';
import AuthController from '../controllers/authController.js';

const router = Router();

router.get('/poll', CallController.fetchAndUpdateCalls);

router.get('/analytics', CallController.getAnalytics);

// Fetch call logs with filtering and sorting
router.get('/call-logs', CallController.getCallLogs);

// Export call logs to CSV
router.get('/call-logs/export/csv', CallController.exportCallLogsCSV);

// Export call logs to Excel
router.get('/call-logs/export/excel', CallController.exportCallLogsExcel);

// Login
router.post('/login', 
    AuthMiddleware.verifyClerkToken, 
    AuthController.clerkLogin
);

// Fetch all users - Admin Only
router.get('/admin', 
    AuthMiddleware.verifyClerkToken, 
    AuthMiddleware.authorizeRoles('Admin'), 
    UserController.getUsers
);

// Update user role - Admin Only
router.put('/admin/:id/role', 
    AuthMiddleware.verifyClerkToken, 
    AuthMiddleware.authorizeRoles('Admin'), 
    UserController.updateUserRole
);

// Delete user - Admin Only
router.delete('/admin/:id', 
    AuthMiddleware.verifyClerkToken, 
    AuthMiddleware.authorizeRoles('Admin'), 
    UserController.deleteUser
);

// Send an alert notification
router.post('/alert', EmailController.sendAlertNotification);

// Send a report
router.post('/report', EmailController.sendReportNotification);

export default router;