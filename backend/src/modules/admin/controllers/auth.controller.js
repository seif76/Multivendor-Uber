const { loginAdminService, getAdminProfileService, updateAdminProfileService } = require('../services/auth.service');

const loginAdminController = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await loginAdminService(username, password);
    res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
};

const getAdminProfileController = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const profile = await getAdminProfileService(adminId);
    res.status(200).json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

const updateAdminProfileController = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const updateData = req.body;
    const updatedProfile = await updateAdminProfileService(adminId, updateData);
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const logoutAdminController = async (req, res) => {
  try {
    // Just return success - frontend will handle token removal
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
};

module.exports = {
  loginAdminController,
  getAdminProfileController,
  updateAdminProfileController,
  logoutAdminController
}; 