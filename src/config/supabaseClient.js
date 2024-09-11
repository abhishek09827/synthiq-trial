/**
 * Supabase client configuration for connecting to the database.
 * 
 * @module config/supabaseClient
 */

import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

/**
 * Create and export the Supabase client instance.
 * 
 * @constant
 * @type {Object}
 */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default supabase;
