const { User, VendorInfo, Product } = require('../../../app/models');

const getAllVendors = async (page = 1, limit = 10, status = null) => {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (status) {
      whereClause.vendor_status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where: { vendor_status: { [require('sequelize').Op.ne]: 'none' } },
      include: [
        {
          model: VendorInfo,
          as: 'vendor_info',
          attributes: ['shop_name', 'shop_location', 'owner_name', 'phone_number', 'passport_photo', 'license_photo', 'shop_front_photo', 'logo']
        }
      ],
      attributes: [
        'id', 'name', 'email', 'phone_number', 'gender', 
        'vendor_status', 'profile_photo', 'rating', 'createdAt'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return {
      vendors: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalVendors: count
    };
  } catch (error) {
    throw new Error(`Failed to get vendors: ${error.message}`);
  }
};

const getVendorStats = async () => {
  try {
    const totalVendors = await User.count({ 
      where: { 
        vendor_status: { [require('sequelize').Op.ne]: 'none' }
      } 
    });
    const activeVendors = await User.count({ 
      where: { 
        vendor_status: 'Active'
      } 
    });
    const pendingVendors = await User.count({ 
      where: { 
        vendor_status: 'pending'
      } 
    });
    const deactivatedVendors = await User.count({ 
      where: { 
        vendor_status: 'Deactivated'
      } 
    });

    return {
      total: totalVendors,
      active: activeVendors,
      pending: pendingVendors,
      deactivated: deactivatedVendors
    };
  } catch (error) {
    throw new Error(`Failed to get vendor stats: ${error.message}`);
  }
};

const updateVendorStatus = async (phone_number, vendor_status) => {
  try {
    const vendor = await User.findOne({ where: { phone_number } });
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    await vendor.update({ vendor_status });
    return vendor;
  } catch (error) {
    throw new Error(`Failed to update vendor status: ${error.message}`);
  }
};

const updateVendorDetails = async (phone_number, updateData) => {
  try {
    const vendor = await User.findOne({ 
      where: { phone_number },
      include: [
        {
          model: VendorInfo,
          as: 'vendor_info'
        }
      ]
    });
    
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Update user details
    const userUpdateData = {};
    if (updateData.name) userUpdateData.name = updateData.name;
    if (updateData.email) userUpdateData.email = updateData.email;
    if (updateData.gender) userUpdateData.gender = updateData.gender;
    if (updateData.vendor_status) userUpdateData.vendor_status = updateData.vendor_status;

    if (Object.keys(userUpdateData).length > 0) {
      await vendor.update(userUpdateData);
    }

    // Update vendor info
    if (vendor.vendor_info) {
      const vendorInfoUpdateData = {};
      if (updateData.shop_name) vendorInfoUpdateData.shop_name = updateData.shop_name;
      if (updateData.shop_location) vendorInfoUpdateData.shop_location = updateData.shop_location;
      if (updateData.owner_name) vendorInfoUpdateData.owner_name = updateData.owner_name;

      if (Object.keys(vendorInfoUpdateData).length > 0) {
        await vendor.vendor_info.update(vendorInfoUpdateData);
      }
    }

    // Return updated vendor with vendor info
    const updatedVendor = await User.findOne({ 
      where: { phone_number },
      include: [
        {
          model: VendorInfo,
          as: 'vendor_info',
          attributes: ['shop_name', 'shop_location', 'owner_name', 'phone_number', 'passport_photo', 'license_photo', 'shop_front_photo', 'logo']
        }
      ],
      attributes: [
        'id', 'name', 'email', 'phone_number', 'gender', 
        'vendor_status', 'profile_photo', 'rating', 'createdAt'
      ]
    });

    return updatedVendor;
  } catch (error) {
    throw new Error(`Failed to update vendor details: ${error.message}`);
  }
};

const deleteVendor = async (phone_number) => {
  try {
    const vendor = await User.findOne({ where: { phone_number } });
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Also delete associated vendor info
    await VendorInfo.destroy({
      where: { vendor_id: vendor.id }
    });

    await vendor.destroy();
    return { message: 'Vendor deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete vendor: ${error.message}`);
  }
};

const getVendorById = async (phone_number) => {
  try {
    const vendor = await User.findOne({ 
      where: { phone_number },
      include: [
        {
          model: VendorInfo,
          as: 'vendor_info',
          attributes: ['shop_name', 'shop_location', 'owner_name', 'phone_number', 'passport_photo', 'license_photo', 'shop_front_photo', 'logo']
        }
      ],
      attributes: [
        'id', 'name', 'email', 'phone_number', 'gender', 
        'vendor_status', 'profile_photo', 'rating', 'createdAt'
      ]
    });
    
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Get products count and products list
    const productsCount = await Product.count({
      where: { vendor_id: vendor.id }
    });

    const products = await Product.findAll({
      where: { vendor_id: vendor.id },
      attributes: ['id', 'name', 'price', 'description', 'image', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10 // Limit to recent 10 products
    });

    // Convert to plain object and add products data
    const vendorData = vendor.toJSON();
    vendorData.products_count = productsCount;
    vendorData.products = products;

    return vendorData;
  } catch (error) {
    throw new Error(`Failed to get vendor: ${error.message}`);
  }
};

const getPendingVendors = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: { vendor_status: 'pending' },
      include: [
        {
          model: VendorInfo,
          as: 'vendor_info',
          attributes: ['shop_name', 'shop_location', 'owner_name', 'phone_number', 'passport_photo', 'license_photo', 'shop_front_photo', 'logo']
        }
      ],
      attributes: [
        'id', 'name', 'email', 'phone_number', 'gender', 
        'vendor_status', 'profile_photo', 'rating', 'createdAt'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return {
      vendors: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalVendors: count
    };
  } catch (error) {
    throw new Error(`Failed to get pending vendors: ${error.message}`);
  }
};

module.exports = {
  getAllVendors,
  getVendorStats,
  updateVendorStatus,
  updateVendorDetails,
  deleteVendor,
  getVendorById,
  getPendingVendors
}; 