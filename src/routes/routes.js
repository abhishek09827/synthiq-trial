/**
 * This file defines the routes for call analytics.
 * Each route is handled by the respective controller.
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
import BillingController from '../controllers/billingController.js';
import upload from '../middlewares/multerMiddleware.js';
const router = Router();

/**
 * @route GET /poll
 * @description Fetch and update call data.
 * @access Public
 */
router.post('/poll', AuthMiddleware.verifyClerkToken, CallController.fetchAndUpdateCalls);

/**
 * @route GET /analytics
 * @description Retrieve call analytics data.
 * @access Public
 */
router.post('/analytics',AuthMiddleware.verifyClerkToken, CallController.getAnalytics);

/**
 * @route GET /call-logs
 * @description Fetch call logs with filtering and sorting options.
 * @access Public
 */
router.post('/call-logs',AuthMiddleware.verifyClerkToken, CallController.getCallLogs);

/**
 * @route GET /call-logs/export/csv
 * @description Export call logs to a CSV file.
 * @access Public
 */
router.post('/call-logs/export/csv',AuthMiddleware.verifyClerkToken, CallController.exportCallLogsCSV);

/**
 * @route GET /call-logs/export/excel
 * @description Export call logs to an Excel file.
 * @access Public
 */
router.post('/call-logs/export/excel',AuthMiddleware.verifyClerkToken,  CallController.exportCallLogsExcel);

/**
 * @route POST /login
 * @description Login user.
 * @access Protected
 */
router.post('/login', 
    AuthMiddleware.verifyClerkToken, 
    AuthController.clerkLogin
);

/**
 * @route GET /admin
 * @description Fetch all users - Admin Only.
 * @access Protected
 */
router.post('/super-admin', 
    AuthMiddleware.verifyClerkToken, 
    AuthMiddleware.checkRole('Super Admin'), 
    UserController.getUsers
);
/**
 * @route POST /agency
 * @description Create a new agency.
 * @access Protected
 */
router.post('/super-admin/create-agency', 
    AuthMiddleware.verifyClerkToken, 
    AuthMiddleware.checkRole('Super Admin'), 
    UserController.createAgency
);


/**
 * @route PUT /admin/:id/role
 * @description Update user role - Admin Only.
 * @access Protected
 */
router.put('/super-admin/role', 
    AuthMiddleware.verifyClerkToken, 
    AuthMiddleware.checkRole('Super Admin'), 
    UserController.updateUserRoleAndPermissions
);

/**
 * @route DELETE /admin/:id
 * @description Delete user - Admin Only.
 * @access Protected
 */
router.delete('/super-admin/:id', 
    AuthMiddleware.verifyClerkToken, 
    AuthMiddleware.checkRole('Super Admin'), 
    UserController.deleteUser
);

router.post('/super-admin/add-user', 
    AuthMiddleware.verifyClerkToken, 
    AuthMiddleware.checkRole('Super Admin'), 
    UserController.addUser
);

/**
 * @route POST /alert
 * @description Send an alert notification email.
 * @access Public
 */
router.post('/alert', EmailController.sendAlertNotification);

/**
 * @route POST /report
 * @description Send a trial report email.
 * @access Public
 */
router.post('/report', EmailController.sendReportNotification);

/**
 * @route POST /monitor
 * @description Monitor user usage and budget.
 * @access Public
 */
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

router.put('/branding/:user_id', upload.fields([{ name: 'logo' }, { name: 'favicon' }]), UserController.updateBranding);
router.get('/branding/:user_id', UserController.getBranding);

// Create a Stripe customer
router.post('/create-customer', BillingController.createCustomer);

// Only Admins can access this route
router.get('/admin-data', AuthMiddleware.verifyClerkToken, AuthMiddleware.checkRole('Admin'), (req, res) => {
  res.send('This is admin data');
});

// Both Admins and Agency Owners can access this route
router.get('/agency-data', AuthMiddleware.verifyClerkToken, AuthMiddleware.checkMultipleRoles(['Admin', 'Agency Owner']), (req, res) => {
  res.send('This is agency data');
});

// Users, Admins, and Agency Owners can access this route
router.get('/user-data', AuthMiddleware.verifyClerkToken, AuthMiddleware.checkMultipleRoles(['User', 'Admin', 'Agency Owner']), (req, res) => {
  res.send('This is user data');
});

// Only Super Admins can update permissions
router.put('/update-permissions', AuthMiddleware.verifyClerkToken, UserController.updateUserRoleAndPermissions);

// Only admins with permission can manage billing
router.get('/billing', AuthMiddleware.verifyClerkToken, AuthMiddleware.checkPermission('manageBilling'), (req, res) => {
  res.send('Billing management');
});

// View analytics
router.get('/analytics', AuthMiddleware.verifyClerkToken, AuthMiddleware.checkPermission('viewAnalytics'), (req, res) => {
  res.send('Viewing analytics');
});
// Add user to agency (Agency Owner only)
router.post('/add-user-to-agency', AuthMiddleware.verifyClerkToken, AuthMiddleware.checkRole('Agency Owner'), UserController.addUserToAgency);
router.put('/update-billing-features', AuthMiddleware.verifyClerkToken, UserController.updateBillingFeatures);



export default router;