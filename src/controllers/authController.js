import clerk from "../config/clerkClient.js";
import { supabase } from '../config/supabaseClient.js';
const AuthController = {
  // User login/registration handler
  async clerkLogin(req, res) {
    const clerkUserId  = req.auth.id;
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const fullName = `${clerkUser.firstName} ${clerkUser.lastName}`;

    // Check if user exists in Supabase
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', clerkUserId)
      .single();

    if (existingUser) {
      // Handle OAuth login logic
      if (!existingUser.publicMetadata?.role) {
        // Assign default role if none exists (e.g., 'User')
        await clerk.users.updateUser(clerkUserId, {
          publicMetadata: { role: 'User' },
        });
      }
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

    // Handle OAuth login logic for new user
    if (!newUser.publicMetadata?.role) {
      // Assign default role if none exists (e.g., 'User')
      await clerk.users.updateUser(clerkUserId, {
        publicMetadata: { role: 'User' },
      });
    }

    res.json({ message: 'User registered and logged in', user: newUser });
  }
};
export default AuthController;