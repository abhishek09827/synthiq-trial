import clerk from "../config/clerkClient.js";
import { supabase } from '../config/supabaseClient.js';
const AuthController = {
// User login/registration handler
async clerkLogin(req, res) {
    const { clerkUserId } = req;
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses[0]?.emailAddress; // Update this line
    const fullName = `${clerkUser.firstName} ${clerkUser.lastName}`; // Update this line
  
    // Check if user exists in Supabase
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', clerkUserId)
      .single();
  
    if (existingUser) {
      return res.json({ message: 'User logged in', user: existingUser });
    }
  
    // If user doesn't exist, create a new one
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        { id: clerkUserId, email, full_name: fullName }
      ])
      .single();
  
    if (insertError) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
  
    res.json({ message: 'User registered and logged in' });
  }
}
export default AuthController;