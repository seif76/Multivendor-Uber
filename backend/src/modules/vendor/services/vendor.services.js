const { User, VendorInfo  , Product, VendorWorkingHour} = require('../../../app/models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { uploadToCloudinary } = require('../../../config/cloudinary/services/cloudinary.service');

const registerVendor = async (userData, infoData) => {
  return await User.sequelize.transaction(async (transaction) => {
    // ✅ Hash the password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 10); // 10 salt rounds
    userData.password = hashedPassword;

    // ✅ Create user with hashed password
    const newUser = await User.create(userData, { transaction });

    // ✅ Create vendor info and associate it
    const vendorInfo = await VendorInfo.create(
      { ...infoData, vendor_id: newUser.id },
      { transaction }
    );

    return { user: newUser, info: vendorInfo };
  });
};

const registerCustomerAsVendor = async (customer_id, infoData) => {
  return await User.sequelize.transaction(async (transaction) => {
    
    const updatedUser = await User.update({ vendor_status: 'pending' }, { where: { id: customer_id }, transaction });

    // ✅ Create vendor info and associate it
    const vendorInfo = await VendorInfo.create(
      { ...infoData, vendor_id: customer_id },
      { transaction }
    );

    return { user: updatedUser, info: vendorInfo };
  });
}

const editVendor = async (phone_number, userUpdates, infoUpdates) => {
  const user = await User.findOne({ where: { phone_number } });
  if (!user || user.vendor_status === 'none') throw new Error('Vendor not found');

  await user.update(userUpdates);
  const info = await VendorInfo.findOne({ where: { vendor_id: user.id } });
  if (!info) throw new Error('Vendor info not found');
  await info.update(infoUpdates);

  return { user, info };
};

const updateVendorProfile = async (vendorId, updateData, imageFile = null, logoFile = null) => {
  const user = await User.findOne({
    where: { id: vendorId, vendor_status: { [Op.ne]: 'none' } }
  });
  
  if (!user) throw new Error('Vendor not found');

  const vendorInfo = await VendorInfo.findOne({ where: { vendor_id: user.id } });
  if (!vendorInfo) throw new Error('Vendor info not found');

  // Prepare update fields - only include fields that are being updated
  const updateFields = {
    shop_name: updateData.shop_name,
    shop_location: updateData.shop_location,
    owner_name: updateData.owner_name,
    phone_number: updateData.phone_number,
  };

  // Only update shop_front_photo if a new image is uploaded
  if (imageFile && imageFile.path) {
    try {
      console.log('Service: Uploading image to Cloudinary:', imageFile.path);
      const uploadResult = await uploadToCloudinary(imageFile.path, 'vendor_shops');
      updateFields.shop_front_photo = uploadResult.url;
      console.log('Service: Cloudinary upload successful:', updateFields.shop_front_photo);
    } catch (uploadError) {
      console.error('Service: Cloudinary upload failed:', uploadError);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  // Only update logo if a new logo file is uploaded
  if (logoFile && logoFile.path) {
    try {
      console.log('Service: Uploading logo to Cloudinary:', logoFile.path);
      const uploadResult = await uploadToCloudinary(logoFile.path, 'vendor_logos');
      updateFields.logo = uploadResult.url;
      console.log('Service: Cloudinary logo upload successful:', updateFields.logo);
    } catch (uploadError) {
      console.error('Service: Cloudinary logo upload failed:', uploadError);
      throw new Error('Failed to upload logo to Cloudinary');
    }
  }

  await vendorInfo.update(updateFields);

  return { user, vendor_info: vendorInfo };
};

const deleteVendor = async (phone_number) => {
  const user = await User.findOne({ where: { phone_number } });
  if (!user || user.vendor_status === 'none') throw new Error('Vendor not found');

  // Delete all products for this vendor
  await VendorWorkingHour.destroy({ where: { vendor_id: user.id } });
  await Product.destroy({ where: { vendor_id: user.id } });
  await VendorInfo.destroy({ where: { vendor_id: user.id } });
  await user.destroy();
  return 'Vendor deleted successfully';
};

const getVendorByPhone = async (phone_number) => {
  const user = await User.findOne({ where: { phone_number, vendor_status: { [Op.ne]: 'none' } } });
  if (!user) throw new Error('Vendor not found');
  const info = await VendorInfo.findOne({ where: { vendor_id: user.id } });
  return { user, info };
};

const getVendorsByStatus = async (status) => {
  const allowedStatuses = ['pending', 'Active', 'Deactivated'];
  if (!allowedStatuses.includes(status)) throw new Error('Invalid status');
  return await User.findAll({
    where: { vendor_status: status },
    include: [{ model: VendorInfo, as: 'vendor_info' }],
  });
};

const setVendorStatus = async (phone_number, status) => {
  const allowedStatuses = ['pending', 'Active', 'Deactivated'];
  if (!allowedStatuses.includes(status)) throw new Error('Invalid status');

  const user = await User.findOne({ where: { phone_number } });
  if (!user || user.vendor_status === 'none') throw new Error('Vendor not found');

  await user.update({ vendor_status: status });
  return user;
};

const getAllVendors = async ({ page = 1, limit = 10, status }) => {
  const where = { vendor_status: { [Op.ne]: 'none' } };
  if (status) where.vendor_status = status;

  const { count, rows } = await User.findAndCountAll({
    where,
    include: [{ model: VendorInfo, as: 'vendor_info' }],
    offset: (page - 1) * limit,
    limit: parseInt(limit),
    order: [['createdAt', 'DESC']],
  });

  return {
    vendors: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  };
};

const getVendorStatusCounts = async () => {
  const [active, pending, deactivated, total] = await Promise.all([
    User.count({ where: { vendor_status: 'Active' } }),
    User.count({ where: { vendor_status: 'pending' } }),
    User.count({ where: { vendor_status: 'Deactivated' } }),
    User.count({ where: { vendor_status: { [Op.ne]: 'none' } } }),
  ]);

  return { total, active, pending, deactivated };
};

const getVendorProfile = async (vendorId) => {
  const user = await User.findOne({
    where: { id: vendorId, vendor_status: { [Op.ne]: 'none' } },
    include: [{ model: VendorInfo, as: 'vendor_info' }],
  });

  if (!user) throw new Error('Vendor not found');
  return user;
};

const getVendorAndProductsByPhone = async (phone_number) => {
    // Find the user
    const user = await User.findOne({ where: { phone_number } });
    if (!user) throw new Error('User not found');
  
    // // Find vendor info
    // const vendorInfo = await VendorInfo.findOne({ where: { vendor_id: user.id } });
    // if (!vendorInfo) throw new Error('Vendor info not found');
  
    // // Get products for the vendor
    // const products = await Product.findAll({ where: { vendor_id: user.id } });
  
    // Get vendor info with selected fields
    console.log(user.id);
  const vendorInfo = await VendorInfo.findOne({
    where: { vendor_id: user.id },
    attributes: ['logo', 'shop_name', 'shop_location', 'owner_name', 'shop_front_photo' , 'vendor_id'],
  });

  if (!vendorInfo) throw new Error('Vendor info not found');

  // Get products with only selected fields
  const products = await Product.findAll({
    where: { vendor_id: user.id  },
    attributes: ['id', 'name', 'description', 'price', 'stock', 'image', 'vendor_category_id', 'status'],
  });

  return { vendorInfo, products };


    //return { vendor_info: vendorInfo, products };
  };

module.exports = {
  registerVendor,
  registerCustomerAsVendor,
  editVendor,
  updateVendorProfile,
  deleteVendor,
  getVendorByPhone,
  getVendorsByStatus,
  setVendorStatus,
  getAllVendors,
  getVendorStatusCounts,
  getVendorProfile,
  getVendorAndProductsByPhone,
};
