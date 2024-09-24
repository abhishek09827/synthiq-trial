import clerk from "../config/clerkClient.js";
import { supabase } from "../config/supabaseClient.js";
const AuthMiddleware = {
    // Middleware to verify Clerk token
async verifyClerkToken(req, res, next) {
    const { token, id } = req.body;
  
    try {
      const clerkUserId = await clerk.verifyToken(token);
      req.clerkUserId = id;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  },
  // Middleware to handle role-based access control
authorizeRoles(...allowedRoles) {
    return async (req, res, next) => {
      const { clerkUser } = req;
      const email = clerkUser.emailAddresses[0].emailAddress;
  
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single();
  
      if (error || !user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
  
      next();
    };
  }
}

export default AuthMiddleware;