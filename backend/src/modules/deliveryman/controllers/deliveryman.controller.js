const {
  registerDeliveryman,
  registerCustomerAsDeliveryman,
  getDeliverymanProfile,
  updateDeliverymanProfile,
  updateDeliverymanVehicle,
  getDeliverymenByStatus,
  setDeliverymanStatus,
  getDeliverymanStatusCounts,
  deleteDeliveryman,
  acceptDeliveryOrder,
  updateDeliveryStatus,
} = require('../services/deliveryman.services');
const { uploadToCloudinary } = require('../../../config/cloudinary/services/cloudinary.service');

// Register new deliveryman
const registerDeliverymanController = async (req, res) => {
  try {
    console.log(JSON.stringify(req.body));
    const { name, email, password, phone_number, gender , vehicleData } = req.body;
    
    // Parse vehicle data from FormData
    
    console.log(JSON.stringify(vehicleData));
    
    // Validate required fields
    if (!name || !email || !password || !phone_number || !vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.license_plate || !vehicleData.vehicle_type || !vehicleData.color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log("registering deliveryman");
    
    // Upload images to Cloudinary
    const profilePhoto = req.files?.profile_photo?.[0];
    const driverLicensePhoto = req.files?.driver_license_photo?.[0];
    const nationalIdPhoto = req.files?.national_id_photo?.[0];
    
    let profilePhotoUrl = '', driverLicensePhotoUrl = '', nationalIdPhotoUrl = '';
    
    if (profilePhoto) profilePhotoUrl = (await uploadToCloudinary(profilePhoto.path, 'deliveryman_profiles')).url;
    if (driverLicensePhoto) driverLicensePhotoUrl = (await uploadToCloudinary(driverLicensePhoto.path, 'deliveryman_licenses')).url;
    if (nationalIdPhoto) nationalIdPhotoUrl = (await uploadToCloudinary(nationalIdPhoto.path, 'deliveryman_ids')).url;

    const userData = { 
      name, 
      email, 
      password, 
      phone_number, 
      gender, 
      deliveryman_status: 'pending',
      profile_photo: profilePhotoUrl
    };
    
    const vehicleDataWithImages = {
      ...vehicleData,
      driver_license_photo: driverLicensePhotoUrl,
      national_id_photo: nationalIdPhotoUrl,
    };
    
    const result = await registerDeliveryman(userData, vehicleDataWithImages);
    
    res.status(201).json({
      message: 'Deliveryman registered successfully',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone_number: result.user.phone_number,
        deliveryman_status: result.user.deliveryman_status,
      },
      vehicle: result.vehicle,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Register existing customer as deliveryman
const registerCustomerAsDeliverymanController = async (req, res) => {
  try {
    const { customer_id  , vehicleData } = req.body;
    
    
    if (!customer_id || !vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.license_plate || !vehicleData.vehicle_type || !vehicleData.color) {
      return res.status(400).json({ error: 'Customer ID and vehicle data are required' });
    }

    // Upload images to Cloudinary
    const driverLicensePhoto = req.files?.driver_license_photo?.[0];
    const nationalIdPhoto = req.files?.national_id_photo?.[0];
    
    let driverLicensePhotoUrl = '', nationalIdPhotoUrl = '';
    
    if (driverLicensePhoto) driverLicensePhotoUrl = (await uploadToCloudinary(driverLicensePhoto.path, 'deliveryman_licenses')).url;
    if (nationalIdPhoto) nationalIdPhotoUrl = (await uploadToCloudinary(nationalIdPhoto.path, 'deliveryman_ids')).url;

    const vehicleDataWithImages = {
      ...vehicleData,
      driver_license_photo: driverLicensePhotoUrl,
      national_id_photo: nationalIdPhotoUrl,
    };

    const result = await registerCustomerAsDeliveryman(customer_id, vehicleDataWithImages);
    
    res.status(201).json({
      message: 'Customer registered as deliveryman successfully',
      result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get deliveryman profile
const getDeliverymanProfileController = async (req, res) => {
  try {
    const deliverymanId = req.user.id;
    const profile = await getDeliverymanProfile(deliverymanId);
    
    res.status(200).json(profile);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Update deliveryman profile
const updateDeliverymanProfileController = async (req, res) => {
  try {
    const deliverymanId = req.user.id;
    const updateData = req.body;
    const imageFiles = req.files || {};
    
    const updatedProfile = await updateDeliverymanProfile(deliverymanId, updateData, imageFiles);
    
    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update vehicle information
const updateVehicleInfoController = async (req, res) => {
  try {
    const deliverymanId = req.user.id;
    const vehicleData = req.body;
    const imageFiles = req.files || {};
    
    const updatedVehicle = await updateDeliverymanVehicle(deliverymanId, vehicleData, imageFiles);
    
    res.status(200).json({
      message: 'Vehicle information updated successfully',
      vehicle: updatedVehicle,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get deliverymen by status (admin function)
const getDeliverymenByStatusController = async (req, res) => {
  try {
    const { status } = req.params;
    const deliverymen = await getDeliverymenByStatus(status);
    
    res.status(200).json(deliverymen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Set deliveryman status (admin function)
const setDeliverymanStatusController = async (req, res) => {
  try {
    const { deliveryman_id, status } = req.body;
    
    if (!deliveryman_id || !status) {
      return res.status(400).json({ error: 'Deliveryman ID and status are required' });
    }

    const updatedDeliveryman = await setDeliverymanStatus(deliveryman_id, status);
    
    res.status(200).json({
      message: 'Deliveryman status updated successfully',
      deliveryman: updatedDeliveryman,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get deliveryman status counts (admin function)
const getDeliverymanStatusCountsController = async (req, res) => {
  try {
    const counts = await getDeliverymanStatusCounts();
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete deliveryman (admin function)
const deleteDeliverymanController = async (req, res) => {
  try {
    const { deliveryman_id } = req.params;
    
    const result = await deleteDeliveryman(deliveryman_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Accept delivery order
const acceptDeliveryOrderController = async (req, res) => {
  try {
    const deliverymanId = req.user.id;
    const { orderId } = req.params;
    const { deliverymanId: requestDeliverymanId } = req.body;
    
    // Verify the deliveryman ID matches the authenticated user
    if (deliverymanId !== requestDeliverymanId) {
      return res.status(400).json({ error: 'Deliveryman ID mismatch' });
    }
    
    const result = await acceptDeliveryOrder(orderId, deliverymanId);
    
    res.status(200).json({
      success: true,
      message: 'Delivery order accepted successfully',
      order: result,
    });
  } catch (error) {
    console.error('Error accepting delivery order:', error);
    res.status(500).json({ 
      error: error.message,
      orderId: req.params.orderId,
      deliverymanId: req.user.id
    });
  }
};

// Update delivery status
const updateDeliveryStatusController = async (req, res) => {
  try {
    const deliverymanId = req.user.id;
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const result = await updateDeliveryStatus(orderId, deliverymanId, status);
    
    res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully',
      order: result,
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ 
      error: error.message,
      orderId: req.params.orderId,
      deliverymanId: req.user.id
    });
  }
};

module.exports = {
  registerDeliverymanController,
  registerCustomerAsDeliverymanController,
  getDeliverymanProfileController,
  updateDeliverymanProfileController,
  updateVehicleInfoController,
  getDeliverymenByStatusController,
  setDeliverymanStatusController,
  getDeliverymanStatusCountsController,
  deleteDeliverymanController,
  acceptDeliveryOrderController,
  updateDeliveryStatusController,
};
  