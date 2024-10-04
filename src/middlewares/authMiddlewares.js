import clerk from "../config/clerkClient.js";
import { supabase } from "../config/supabaseClient.js";
import { requireAuth } from '@clerk/clerk-sdk-node';

const AuthMiddleware = {
  // Middleware to verify Clerk token
  async verifyClerkToken(req, res, next) {
    const { id } = req.body;
    try {
      const user = await clerk.users.getUser(id);
      req.auth = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  },

  // Middleware to check if a user has a specific role
  checkRole(requiredRole) {
    return async (req, res, next) => {
      try {
        const user = req.auth;
        const userRole = user.publicMetadata.role;

        if (userRole !== requiredRole) {
          return res.status(403).json({ message: 'Access Denied: Insufficient permissions' });
        }
        next();
      } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  },

  // Middleware for multiple roles
  checkMultipleRoles(allowedRoles) {
    return (req, res, next) => {
      const user  = req.auth;
      const userRole = user.publicMetadata.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Access Denied: Insufficient permissions' });
      }

      next();
    };
  },

  // Middleware to check for a required permission
  checkPermission(requiredPermission) {
    return (req, res, next) => {
      const user  = req.auth;
      const userPermissions = user.publicMetadata.permissions || {};

      if (!userPermissions[requiredPermission]) {
        return res.status(403).json({ message: 'Access Denied: Missing required permissions' });
      }

      next();
    };
  },

  // Middleware to check if the user is a Super Admin
  checkSuperAdmin(req, res, next) {
    const { user } = req.auth;
    const userRole = user.publicMetadata.role;

    if (userRole !== 'Super Admin') {
      return res.status(403).json({ message: 'Access Denied: Only Super Admins can access this route' });
    }

    next();
  },

  // Middleware to check agency ownership
  async checkAgencyOwnership(req, res, next) {
    const { userId } = req.params;  // Assume you're trying to access another user by ID

    try {
      // Retrieve the user from Clerk to compare agencyId
      const targetUser = await clerk.users.getUser(userId);
      const targetAgencyId = targetUser.publicMetadata.agencyId;
      const agencyOwnerAgencyId = req.auth.user.publicMetadata.agencyId;

      // Ensure the agency IDs match
      if (targetAgencyId !== agencyOwnerAgencyId) {
        return res.status(403).json({ message: 'Access Denied: You do not have permission to manage this user.' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify agency ownership.' });
    }
  },

  // Middleware to update agency user permissions
  async updateAgencyUserPermissions(req, res, next) {
    const { userId, permissions } = req.body;

    try {
      // Ensure the user making the request is an AgencyOwner
      if (req.auth.user.publicMetadata.role !== 'AgencyOwner') {
        return res.status(403).json({ message: 'Access Denied: Only AgencyOwners can access this route' });
      }

      // Ensure the target user is part of the same agency
      const targetUser = await clerk.users.getUser(userId);
      const agencyOwnerAgencyId = req.auth.user.publicMetadata.agencyId;

      if (targetUser.publicMetadata.agencyId !== agencyOwnerAgencyId) {
        return res.status(403).json({ message: 'Access Denied: You can only manage users in your own agency.' });
      }

      // Update user permissions
      await clerk.users.updateUser(userId, {
        publicMetadata: {
          permissions
        }
      });

      res.status(200).json({ message: 'User permissions updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update permissions' });
    }
  }
};

export default AuthMiddleware;