/**
 * Main entry point for the Express server.
 * Sets up middleware, routes, and error handling.
 * 
 * @module app
 */

import express from 'express';
import routes from './src/routes/routes.js';
import errorHandler from './src/middlewares/errorhandler.js';
import cors from 'cors';
import schedulePollRoute from './src/middlewares/cronScheduler.js';
import { limiter } from './src/middlewares/rateLimitter.js';
import http from 'http';
import { Server } from 'socket.io';
import { supabase } from './src/config/supabaseClient.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Update this to allow only your frontend's domain in production
    methods: ['GET', 'POST'],
  },
});

// Real-Time Subscription to Call Changes
supabase
  .channel('public:call-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'calls' }, // Listening for all changes (insert, update, delete)
    (payload) => {
      console.log('Real-time change detected:', payload);

      // Emit the change to all connected clients via Socket.IO
      io.emit('call-change', payload);
    }
  )
  .subscribe();

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Clean up on disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(express.json());
app.use(cors({ origin: '*' }));
// app.use(schedulePollRoute);
app.use(limiter);
app.use('/api', routes);
app.use(errorHandler);

export default server;
