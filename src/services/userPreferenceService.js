import { supabase } from '../config/supabaseClient.js';

export const shouldNotify = async (email, event) => {
  const { data, error } = await supabase
    .from('users')
    .select('user_preferences')
    .eq('email', email)
    .single();


  if (error) {
    console.error('Error fetching user preferences:', error);
    return false;
  }
  console.log(data?.user_preferences?.HIGH_USAGE);
  return data?.user_preferences?.[event] || false;
};