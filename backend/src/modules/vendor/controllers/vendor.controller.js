const {
    registerVendor,
    editVendor,
    deleteVendor,
    getVendorByPhone,
    getVendorsByStatus,
    setVendorStatus,
    getAllVendors,
    getVendorProfile,
    getVendorStatusCounts
  } = require('../services/vendor.services');
  
  const registerVendorController = async (req, res) => {
    try {
      const { user, info } = req.body;
      const result = await registerVendor(user, info);
      res.status(201).json({ message: 'Vendor registered successfully', result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const editVendorController = async (req, res) => {
    try {
      const { phone_number, user, info } = req.body;
      const result = await editVendor(phone_number, user, info);
      res.status(200).json({ message: 'Vendor updated successfully', result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const deleteVendorController = async (req, res) => {
    try {
      const { phone_number } = req.query;
      const result = await deleteVendor(phone_number);
      res.status(200).json({ message: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const getVendorByPhoneController = async (req, res) => {
    try {
      const { phone_number } = req.query;
      const result = await getVendorByPhone(phone_number.trim());
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const getPendingVendorsController = async (req, res) => {
    try {
      const vendors = await getVendorsByStatus('pending');
      res.status(200).json(vendors);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const getActiveVendorsController = async (req, res) => {
    try {
      const vendors = await getVendorsByStatus('Active');
      res.status(200).json(vendors);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const getDeactivatedVendorsController = async (req, res) => {
    try {
      const vendors = await getVendorsByStatus('Deactivated');
      res.status(200).json(vendors);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const setVendorStatusController = async (req, res) => {
    try {
      const { phone_number, status } = req.body;
      const updated = await setVendorStatus(phone_number, status);
      res.status(200).json({ message: 'Status updated', user: updated });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const getAllVendorsController = async (req, res) => {
    try {
      const { vendors, total, page, totalPages } = await getAllVendors(req.query);
      res.status(200).json({ vendors, total, currentPage: page, totalPages });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const getAllVendorStatusCountsController = async (req, res) => {
    try {
      const counts = await getVendorStatusCounts();
      res.status(200).json(counts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const getVendorProfileController = async (req, res) => {
    try {
      const vendor = await getVendorProfile(req.user.id);
      res.status(200).json(vendor);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  module.exports = {
    registerVendorController,
    editVendorController,
    deleteVendorController,
    getVendorByPhoneController,
    getPendingVendorsController,
    getActiveVendorsController,
    getDeactivatedVendorsController,
    setVendorStatusController,
    getAllVendorsController,
    getAllVendorStatusCountsController,
    getVendorProfileController,
  };
  