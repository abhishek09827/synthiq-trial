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
import CallService from '../services/callService.js';
import UserService from '../services/userService.js';

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

// Send trial report
router.post('/report', EmailController.sendReportNotification);

router.post('/monitor', async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
  
      const user = await UserService.getUserByEmail(email);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
    await CallService.monitorUsage(user);
    await CallService.monitorBudget(user);
  
      res.status(200).json({ 
        message: 'Monitoring completed successfully'
      });
    } catch (error) {
      console.error('Error in monitoring:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
export default router;