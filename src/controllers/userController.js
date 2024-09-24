import { supabase } from "../config/supabaseClient.js";

const UserController = {
    // Get all users (Admin only)
async getUsers(req, res) {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) return res.status(500).json({ error: 'Error fetching users' });
    res.json(users);
  },
  
  // Update user role (Admin only)
async updateUserRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;
  
    const { data, error } = await supabase.from('users').update({ role }).eq('id', id);
    if (error) return res.status(500).json({ error: 'Error updating user role' });
    res.json({ message: 'Role updated successfully', data });
  },
  
  // Delete user (Admin only)
async deleteUser(req, res) {
    const { id } = req.params;
  
    const { data, error } = await supabase.from('users').delete().eq('id', id);
    if (error) return res.status(500).json({ error: 'Error deleting user' });
    res.json({ message: 'User deleted successfully' });
  }
}
export default UserController;
