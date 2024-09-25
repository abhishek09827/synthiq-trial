import { supabase } from '../config/supabaseClient.js';

export const shouldNotify = async (email, event) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('notifications')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user preferences:', error);
    return false;
  }

  return data?.notifications?.[event] || false;
};s