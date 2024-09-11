/**
 * Main entry point for the Express server.
 * Sets up middleware, routes, and error handling.
 * 
 * @module app
 */

import express, { json } from 'express';

const app = express();

app.use(json());

export default app;
