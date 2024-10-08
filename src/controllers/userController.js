import { supabase } from "../config/supabaseClient.js";
import clerk from "../config/clerkClient.js";

const UserController = {
    // Get all users (Super Admin only)
    async addUser(req, res) {
        const { email, fullName, role, bearerToken } = req.body;

        try {
            // Ensure the user making the request is a Super Admin or Agency Owner
            if (!['Super Admin', 'AgencyOwner'].includes(req.auth.publicMetadata.role)) {
                return res.status(403).json({ message: 'Access Denied' });
            }

            // Create a new user in Clerk
            const newUser = await clerk.users.createUser({
                emailAddress: [email],
                firstName: fullName.split(' ')[0],
                lastName: fullName.split(' ')[1],
                publicMetadata: { 
                    role, 
                    agencyId: req.auth.publicMetadata.role === 'AgencyOwner' ? req.auth.publicMetadata.agencyId : undefined 
                }
            });

            // Insert the new user into Supabase
            const { data, error } = await supabase
                .from('users')
                .insert([{ 
                    id: newUser.id, 
                    email, 
                    full_name: fullName, 
                    role, 
                    bearer_token: bearerToken, 
                    agency_id: req.auth.publicMetadata.role === 'AgencyOwner' ? req.auth.publicMetadata.agencyId : null 
                }])
                .single();

            if (error) {
                return res.status(500).json({ error: 'Failed to create user in Supabase' });
            }

            res.status(201).json({ message: 'User added successfully', user: data });
        } catch (error) {
            res.status(500).json({ message: 'Failed to add user', error: error.message });
        }
    },
    
    // Create a new agency (Super Admin only)
    async createAgency(req, res) {
        const { agencyName, ownerId } = req.body;

        try {
            // Ensure the user making the request is a Super Admin
            if (req.auth.publicMetadata.role !== 'Super Admin') {
                return res.status(403).json({ message: 'Access Denied' });
            }

            // Fetch the owner user from Supabase
            const { data: owner, error: ownerFetchError } = await supabase
                .from('users')
                .select('*')
                .eq('id', ownerId)
                .single();

            if (ownerFetchError) {
                return res.status(500).json({ error: 'Failed to fetch owner from Supabase' });
            }

            // Create a new agency in Supabase
            const { data: newAgency, error: agencyError } = await supabase
                .from('agencies')
                .insert([{ name: agencyName, owner_id: owner.id, created_at: new Date().toISOString() }])
                .select('id')
                .single();
            if (agencyError) {
              console.log(agencyError.message);
                return res.status(500).json({ error: 'Failed to create agency in Supabase' });
            }
            console.log(newAgency);
            console.log(ownerId);
            // Update the agencyId for the owner in Supabase
            const { data: ownerData, error: ownerUpdateError } = await supabase
                .from('users')
                .update({ agency_id: newAgency.id })
                .eq('id', ownerId)
                .select('*, agencies(id)')
                .single();
                console.log(ownerUpdateError);

            if (ownerUpdateError) {
                return res.status(500).json({ error: 'Failed to update agencyId for the owner in Supabase' });
            }

            // Update the agencyId in Clerk publicMetadata for the owner
            await clerk.users.updateUser(ownerId, {
                publicMetadata: {
                    agencyId: newAgency.id
                }
            });

            res.status(201).json({ message: 'Agency created and owner updated successfully', agency: newAgency, owner: ownerData });
        } catch (error) {
            res.status(500).json({ message: 'Failed to create agency', error: error.message });
        }
    },
    async getUsers(req, res) {
        try {
            const query = supabase.from('users').select('*');
            if (req.auth.publicMetadata.role === 'AgencyOwner') {
                query.eq('agency_id', req.auth.publicMetadata.agencyId);
            }
            const { data: users, error } = await query;
            if (error) {
                return res.status(500).json({ error: 'Error fetching users' });
            }
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    },
    // Update user role and permissions (Super Admin or Agency Owner only)
    async updateUserRoleAndPermissions(req, res) {
      const { userId, newRole, permissions } = req.body;
    
      try {
        // Ensure the user making the request is a Super Admin or Agency Owner
        if (!['Super Admin', 'Agency Owner'].includes(req.auth.publicMetadata.role)) {
          return res.status(403).json({ message: 'Access Denied' });
        }

        // Ensure the target user is part of the same agency if the requester is an Agency Owner
        if (req.auth.publicMetadata.role === 'Agency Owner') {
          const { data: targetUser, error } = await supabase.from('users').select('agency_id').eq('id', userId).single();
          if (error) {
            return res.status(500).json({ error: 'Failed to fetch target user agencyId' });
          }
          if (targetUser.agency_id !== req.auth.publicMetadata.agencyId) {
            return res.status(403).json({ message: 'Access Denied: You can only manage users in your own agency.' });
          }
        }

        // Get the current user data
        const currentUser = await clerk.users.getUser(userId);
        const updatedMetadata = {
          role: newRole || currentUser.publicMetadata.role,
          permissions: permissions || currentUser.publicMetadata.permissions
        };

        // Update user role and permissions in Clerk
        await clerk.users.updateUser(userId, {
          publicMetadata: updatedMetadata,
        });
    
        res.status(200).json({ message: 'User role and permissions updated successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Failed to update user role and permissions' });
      }
    },
    // Add user to agency (Agency Owner only)
    async addUserToAgency(req, res) {
      const { userId, agencyId } = req.body;

      try {
        // Ensure the user making the request is an Agency Owner
        if (req.auth.publicMetadata.role !== 'Agency Owner') {
          return res.status(403).json({ message: 'Access Denied' });
        }

        // Ensure the agencyId matches the requester's agencyId
        if (agencyId !== req.auth.publicMetadata.agencyId) {
          return res.status(403).json({ message: 'Access Denied: You can only add users to your own agency.' });
        }

        // Get the target user to ensure they exist and are not already part of the agency
        const targetUser = await clerk.users.getUser(userId);
        if (targetUser.publicMetadata.agencyId === agencyId) {
          return res.status(400).json({ message: 'User is already part of the agency.' });
        }

        // Update the target user's agencyId in Clerk
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            agencyId: agencyId,
          },
        });

        // Update the target user's agencyId in the users table
        const { data, error } = await supabase.from('users').update({ agency_id: agencyId }).eq('id', userId);
        if (error) return res.status(500).json({ error: 'Failed to update user agencyId' });

        res.status(200).json({ message: 'User added to agency successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Failed to add user to agency' });
      }
    },
    // Delete user (Admin, Super Admin, and Agency Owner only)
    async deleteUser(req, res) {
        const { id } = req.params;
  
        // Ensure the user making the request is an Admin, Super Admin, or Agency Owner
        if (!['Admin', 'Super Admin', 'AgencyOwner'].includes(req.auth.publicMetadata.role)) {
          return res.status(403).json({ message: 'Access Denied' });
        }

        // Ensure the target user is part of the same agency if the requester is an Agency Owner
        if (req.auth.publicMetadata.role === 'AgencyOwner') {
          const targetUser = await clerk.users.getUser(id);
          if (targetUser.publicMetadata.agencyId !== req.auth.publicMetadata.agencyId) {
            return res.status(403).json({ message: 'Access Denied: You can only manage users in your own agency.' });
          }
        }

        const { data, error } = await supabase.from('users').delete().eq('id', id);
        if (error) return res.status(500).json({ error: 'Error deleting user' });
        res.json({ message: 'User deleted successfully' });
    },
    // Update user billing features (Super Admin and Agency Owner only)
    async updateBillingFeatures(req, res) {
      const { userId, start_date, monthly_charge, per_min_charge } = req.body.billingFeatures;

      // Ensure the user making the request is a Super Admin or Agency Owner
      if (!['Super Admin', 'AgencyOwner'].includes(req.auth.publicMetadata.role)) {
        return res.status(403).json({ message: 'Access Denied' });
      }

      // Ensure the target user is part of the same agency if the requester is an Agency Owner
      if (req.auth.publicMetadata.role === 'AgencyOwner') {
        const targetUser = await clerk.users.getUser(userId);
        if (targetUser.publicMetadata.agencyId !== req.auth.publicMetadata.agencyId) {
          return res.status(403).json({ message: 'Access Denied: You can only manage users in your own agency.' });
        }
      }

      const { data, error } = await supabase.from('users').update({ 
        billing_features: {
          start_date: start_date,
          monthly_charge: monthly_charge,
          per_min_charge: per_min_charge
        }
      }).eq('id', userId);
      if (error) return res.status(500).json({ error: 'Error updating billing features' });
      res.json({ message: 'Billing features updated successfully' });
    },
    // Get user details (Admin, Super Admin, and Agency Owner)
    async getUserDetails(req, res) {
      const { id } = req.params;

      // Ensure the target user is part of the same agency if the requester is an Agency Owner
      if (req.auth.publicMetadata.role === 'AgencyOwner') {
        const targetUser = await clerk.users.getUser(id);
        if (targetUser.publicMetadata.agencyId !== req.auth.publicMetadata.agencyId) {
          return res.status(403).json({ message: 'Access Denied: You can only view users in your own agency.' });
        }
      }

      const { data: user, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (error) return res.status(500).json({ error: 'Error fetching user details' });
      res.json(user);
    },

    // Update user profile (User, Admin, Super Admin, and Agency Owner)
    async updateUserProfile(req, res) {
      const { id } = req.params;
      const { name, email } = req.body;

      // Ensure the target user is part of the same agency if the requester is an Agency Owner
      if (req.auth.publicMetadata.role === 'AgencyOwner') {
        const targetUser = await clerk.users.getUser(id);
        if (targetUser.publicMetadata.agencyId !== req.auth.publicMetadata.agencyId) {
          return res.status(403).json({ message: 'Access Denied: You can only manage users in your own agency.' });
        }
      }

      const { data, error } = await supabase.from('users').update({ name, email }).eq('id', id);
      if (error) return res.status(500).json({ error: 'Error updating user profile' });
      res.json({ message: 'User profile updated successfully' });
    },
    async updateBranding(req, res) {
        try {
            const clientId = req.params.user_id;
            const { primaryColor, secondaryColor, fontFamily } = req.body;
        
            // Handle optional file uploads for logo and favicon
            const logoFile = req.files?.logo;
            const faviconFile = req.files?.favicon;
        
            // Upload files if present, otherwise return null
            const [logoUrl, faviconUrl] = await Promise.all([
              logoFile ? uploadFile(logoFile.path, { folder: 'branding/logos' }) : null,
              faviconFile ? uploadFile(faviconFile.path, { folder: 'branding/favicons' }) : null,
            ]);
        
            // Branding data object
            const brandingData = {
              primary_color: primaryColor,
              secondary_color: secondaryColor,
              font_family: fontFamily,
              ...(logoUrl && { logo_url: logoUrl }),         // Only include logo URL if it's uploaded
              ...(faviconUrl && { favicon_url: faviconUrl }), // Only include favicon URL if it's uploaded
            };
        
            // Update the branding data in the database
            const { error } = await supabase
              .from('branding_assets')
              .update(brandingData)
              .eq('user_id', clientId);
        
            if (error) {
              throw error;
            }
        
            // Send success response
            res.status(200).json({ message: 'Branding updated successfully.' });
          } catch (error) {
            console.error('Error updating branding:', error.message);
            res.status(500).json({ message: 'Failed to update branding.', error: error.message });
          }
        
  },
  
    async getBranding(req, res) {
    try {
        const clientId = req.params.user_id;
        const branding = await supabase('branding_assets').where({ user_id: clientId }).first();

        if (!branding) {
            return res.status(404).json({ message: 'Branding not found.' });
        }
    }catch (error) {
    console.error('Error fetching branding:', error);
    res.status(500).json({ message: 'Failed to fetch branding.' });
}}
};
export default UserController;
