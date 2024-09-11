/**
 * Main entry point for the Express server.
 * Sets up middleware, routes, and error handling.
 * 
 * @module app
 */

import express from 'express';
import callRoutes from './src/routes/callRoutes.js';
import errorHandler  from './src/middlewares/errorhandler.js';

const app = express();

app.use(express.json());

/**
 * Use the call routes.
 */
app.use('/api', callRoutes);

/**
 * Global error handler middleware.
 * 
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
app.use(errorHandler);

export default app;
