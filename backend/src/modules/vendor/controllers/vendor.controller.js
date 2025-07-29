const {
    registerVendor,
    editVendor,
    deleteVendor,
    getVendorByPhone,
    getVendorsByStatus,
    setVendorStatus,
    getAllVendors,
    getVendorProfile,
    getVendorStatusCounts,
    getVendorAndProductsByPhone,
    updateVendorProfile
  } = require('../services/vendor.services');
  const { uploadToCloudinary } = require('../../../config/cloudinary/services/cloudinary.service');
  
  const registerVendorController = async (req, res) => {
    try {
      const { name, email, password, phone_number, gender, shop_name, shop_location, owner_name } = req.body;
      // Validate required fields
      if (!name || !email || !password || !phone_number || !shop_name || !shop_location || !owner_name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      // Upload images to Cloudinary
      const passportPhoto = req.files?.passport_photo?.[0];
      const licensePhoto = req.files?.license_photo?.[0];
      const shopFrontPhoto = req.files?.shop_front_photo?.[0];
      const logoPhoto = req.files?.logo?.[0];
      let passportPhotoUrl = '', licensePhotoUrl = '', shopFrontPhotoUrl = '', logoUrl = '';
      if (passportPhoto) passportPhotoUrl = (await uploadToCloudinary(passportPhoto.path, 'vendor_passports')).url;
      if (licensePhoto) licensePhotoUrl = (await uploadToCloudinary(licensePhoto.path, 'vendor_licenses')).url;
      if (shopFrontPhoto) shopFrontPhotoUrl = (await uploadToCloudinary(shopFrontPhoto.path, 'vendor_shops')).url;
      if (logoPhoto) logoUrl = (await uploadToCloudinary(logoPhoto.path, 'vendor_logos')).url;
      if (!logoUrl) {
        return res.status(400).json({ error: 'Logo is required' });
      }
      // Call service to create user and vendor info
      const userData = { name, email, password, phone_number, gender, vendor_status: 'pending' };
      const infoData = {
        shop_name, shop_location, owner_name,
        passport_photo: passportPhotoUrl,
        license_photo: licensePhotoUrl,
        shop_front_photo: shopFrontPhotoUrl,
        logo: logoUrl,
        phone_number // for VendorInfo
      };
      const result = await registerVendor(userData, infoData);
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

  const updateVendorProfileController = async (req, res) => {
    try {
      const vendorId = req.user.id;
      const { shop_name, shop_location, owner_name, phone_number } = req.body;

      // Validate required fields
      if (!shop_name || !shop_location || !owner_name || !phone_number) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updateData = {
        shop_name,
        shop_location,
        owner_name,
        phone_number,
      };

      const shopFrontPhotoFile = req.files?.shop_front_photo?.[0] || null;
      const logoFile = req.files?.logo?.[0] || null;

      // Pass the image and logo files to the service for Cloudinary upload
      const result = await updateVendorProfile(vendorId, updateData, shopFrontPhotoFile, logoFile);
      
      res.status(200).json({ 
        message: 'Vendor profile updated successfully', 
        vendor_info: result.vendor_info 
      });
    } catch (err) {
      console.error('Error updating vendor profile:', err);
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

  const getVendorWithProductsByPhoneController = async (req, res) => {
    try {
      const { phone_number } = req.params;
  
      const result = await getVendorAndProductsByPhone(phone_number);
  
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getVendorWithProductsByPhone:', error);
  
      const status = error.message === 'User not found' || error.message === 'Vendor info not found' ? 404 : 500;
      res.status(status).json({ message: error.message });
    }
  };

  
  
  module.exports = {
    registerVendorController,
    editVendorController,
    updateVendorProfileController,
    deleteVendorController,
    getVendorByPhoneController,
    getPendingVendorsController,
    getActiveVendorsController,
    getDeactivatedVendorsController,
    setVendorStatusController,
    getAllVendorsController,
    getAllVendorStatusCountsController,
    getVendorProfileController,
    getVendorWithProductsByPhoneController,
  };
  