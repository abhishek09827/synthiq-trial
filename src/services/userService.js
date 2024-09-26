import { supabase } from '../config/supabaseClient.js';
const UserService = {

    async getUserByEmail(email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
  
      if (error) {
        throw new Error(error.message);
      }
  
      return data;
    },
  };
  
  export default UserService;