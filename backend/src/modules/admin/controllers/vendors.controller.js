const { 
  getAllVendors, 
  getVendorStats, 
  updateVendorStatus, 
  deleteVendor,
  getVendorById,
  getPendingVendors,
  updateVendorDetails
} = require('../services/vendors.service');

const getAllVendorsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const vendors = await getAllVendors(page, limit, status);
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVendorStatsController = async (req, res) => {
  try {
    const stats = await getVendorStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVendorStatusController = async (req, res) => {
  try {
    const { phone_number, vendor_status } = req.body;
    
    if (!phone_number || !vendor_status) {
      return res.status(400).json({ error: 'Phone number and status are required' });
    }

    const updatedVendor = await updateVendorStatus(phone_number, vendor_status);
    res.status(200).json({ 
      message: 'Vendor status updated successfully', 
      vendor: updatedVendor 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVendorDetailsController = async (req, res) => {
  try {
    const { phone_number, name, email, gender, vendor_status, shop_name, shop_location, owner_name } = req.body;
    
    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const updatedVendor = await updateVendorDetails(phone_number, {
      name,
      email,
      gender,
      vendor_status,
      shop_name,
      shop_location,
      owner_name
    });
    
    res.status(200).json({ 
      message: 'Vendor details updated successfully', 
      vendor: updatedVendor 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteVendorController = async (req, res) => {
  try {
    const { phone_number } = req.query;
    
    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    await deleteVendor(phone_number);
    res.status(200).json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVendorByIdController = async (req, res) => {
  try {
    const { phone_number } = req.query;
    
    if (!phone_number) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const vendor = await getVendorById(phone_number);
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingVendorsController = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pendingVendors = await getPendingVendors(page, limit);
    res.status(200).json(pendingVendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllVendorsController,
  getVendorStatsController,
  updateVendorStatusController,
  updateVendorDetailsController,
  deleteVendorController,
  getVendorByIdController,
  getPendingVendorsController
}; 