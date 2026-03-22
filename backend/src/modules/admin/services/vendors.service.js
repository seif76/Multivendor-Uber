const { User, VendorInfo, Product, Order, OrderItem } = require('../../../app/models');
const { Op } = require('sequelize');

const getAllVendors = async (page = 1, limit = 10, status = null) => {
  try {
    const offset = (page - 1) * limit;

    const whereClause = {
      vendor_status: { [Op.ne]: 'none' },
    };

    if (status) {
      whereClause.vendor_status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: VendorInfo,
          as: 'vendor_info',
          attributes: ['shop_name', 'owner_name', 'phone_number'],
        },
      ],
      attributes: ['id', 'name', 'email', 'phone_number', 'gender', 'vendor_status', 'rating', 'createdAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    return {
      vendors: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalVendors: count,
    };
  } catch (error) {
    throw new Error(`Failed to get vendors: ${error.message}`);
  }
};

const getVendorStats = async () => {
  try {
    const totalVendors = await User.count({ where: { vendor_status: { [Op.ne]: 'none' } } });
    const activeVendors = await User.count({ where: { vendor_status: 'Active' } });
    const pendingVendors = await User.count({ where: { vendor_status: 'pending' } });
    const deactivatedVendors = await User.count({ where: { vendor_status: 'Deactivated' } });

    return {
      total: totalVendors,
      active: activeVendors,
      pending: pendingVendors,
      deactivated: deactivatedVendors,
    };
  } catch (error) {
    throw new Error(`Failed to get vendor stats: ${error.message}`);
  }
};

const updateVendorStatus = async (phone_number, vendor_status) => {
  try {
    const vendor = await User.findOne({ where: { phone_number } });
    if (!vendor) throw new Error('Vendor not found');
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
      include: [{ model: VendorInfo, as: 'vendor_info' }],
    });

    if (!vendor) throw new Error('Vendor not found');

    const userUpdateData = {};
    if (updateData.name) userUpdateData.name = updateData.name;
    if (updateData.email) userUpdateData.email = updateData.email;
    if (updateData.gender) userUpdateData.gender = updateData.gender;
    if (updateData.vendor_status) userUpdateData.vendor_status = updateData.vendor_status;

    if (Object.keys(userUpdateData).length > 0) {
      await vendor.update(userUpdateData);
    }

    if (vendor.vendor_info) {
      const vendorInfoUpdateData = {};
      if (updateData.shop_name) vendorInfoUpdateData.shop_name = updateData.shop_name;
      if (updateData.shop_location) vendorInfoUpdateData.shop_location = updateData.shop_location;
      if (updateData.owner_name) vendorInfoUpdateData.owner_name = updateData.owner_name;

      if (Object.keys(vendorInfoUpdateData).length > 0) {
        await vendor.vendor_info.update(vendorInfoUpdateData);
      }
    }

    const updatedVendor = await User.findOne({
      where: { phone_number },
      include: [
        {
          model: VendorInfo,
          as: 'vendor_info',
          attributes: ['shop_name', 'shop_location', 'owner_name', 'phone_number', 'passport_photo', 'license_photo', 'shop_front_photo', 'logo'],
        },
      ],
      attributes: ['id', 'name', 'email', 'phone_number', 'gender', 'vendor_status', 'profile_photo', 'rating', 'createdAt'],
    });

    return updatedVendor;
  } catch (error) {
    throw new Error(`Failed to update vendor details: ${error.message}`);
  }
};

const deleteVendor = async (phone_number) => {
  try {
    const vendor = await User.findOne({ where: { phone_number } });
    if (!vendor) throw new Error('Vendor not found');
    await VendorInfo.destroy({ where: { vendor_id: vendor.id } });
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
          attributes: ['shop_name', 'shop_location', 'owner_name', 'phone_number', 'passport_photo', 'license_photo', 'shop_front_photo', 'logo'],
        },
      ],
      attributes: ['id', 'name', 'email', 'phone_number', 'gender', 'vendor_status', 'profile_photo', 'rating', 'createdAt'],
    });

    if (!vendor) throw new Error('Vendor not found');

    // ─── Products ───
    const productsCount = await Product.count({ where: { vendor_id: vendor.id } });
    const products = await Product.findAll({
      where: { vendor_id: vendor.id },
      attributes: ['id', 'name', 'price', 'description', 'image', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    // ─── Order stats ───
    const totalOrders = await Order.count({ where: { vendor_id: vendor.id } });
    const completedOrders = await Order.count({ where: { vendor_id: vendor.id, status: 'delivered' } });
    const pendingOrders = await Order.count({ where: { vendor_id: vendor.id, status: 'pending' } });
    const cancelledOrders = await Order.count({ where: { vendor_id: vendor.id, status: 'cancelled' } });

    // ─── Total sales (sum of vendor_fee from delivered orders) ───
    const salesResult = await Order.findOne({
      where: { vendor_id: vendor.id, status: 'delivered' },
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('vendor_fee')), 'totalSales'],
      ],
      raw: true,
    });
    const totalSales = parseFloat(salesResult?.totalSales || 0).toFixed(2);

    // ─── Recent orders ───
    const recentOrders = await Order.findAll({
      where: { vendor_id: vendor.id },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'status', 'total_price', 'vendor_fee', 'payment_method', 'createdAt'],
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'phone_number'],
        },
      ],
    });

    const vendorData = vendor.toJSON();
    vendorData.products_count = productsCount;
    vendorData.products = products;
    vendorData.orderStats = {
      total: totalOrders,
      completed: completedOrders,
      pending: pendingOrders,
      cancelled: cancelledOrders,
      totalSales,
    };
    vendorData.recentOrders = recentOrders;

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
          attributes: ['shop_name', 'shop_location', 'owner_name', 'phone_number', 'passport_photo', 'license_photo', 'shop_front_photo', 'logo'],
        },
      ],
      attributes: ['id', 'name', 'email', 'phone_number', 'gender', 'vendor_status', 'profile_photo', 'rating', 'createdAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    return {
      vendors: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalVendors: count,
    };
  } catch (error) {
    throw new Error(`Failed to get pending vendors: ${error.message}`);
  }
};

/**
 * ─── Get all orders for a vendor with pagination and order ID search ───
 */
const getVendorOrders = async (vendorId, page = 1, limit = 10, orderId = null) => {
  try {
    const offset = (page - 1) * limit;

    const where = { vendor_id: vendorId };

    // ─── Filter by order ID if provided ───
    if (orderId) {
      where.id = orderId;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ['id', 'status', 'total_price', 'vendor_fee', 'payment_method', 'createdAt'],
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'phone_number'],
        },
      ],
    });

    // ─── Total sales from delivered orders ───
    const salesResult = await Order.findOne({
      where: { vendor_id: vendorId, status: 'delivered' },
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('vendor_fee')), 'totalSales'],
      ],
      raw: true,
    });

    // ─── Order status counts ───
    const [total, completed, pending, cancelled] = await Promise.all([
      Order.count({ where: { vendor_id: vendorId } }),
      Order.count({ where: { vendor_id: vendorId, status: 'delivered' } }),
      Order.count({ where: { vendor_id: vendorId, status: 'pending' } }),
      Order.count({ where: { vendor_id: vendorId, status: 'cancelled' } }),
    ]);

    return {
      orders: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count,
      orderStats: {
        total,
        completed,
        pending,
        cancelled,
        totalSales: parseFloat(salesResult?.totalSales || 0).toFixed(2),
      },
    };
  } catch (error) {
    throw new Error(`Failed to get vendor orders: ${error.message}`);
  }
};

module.exports = {
  getAllVendors,
  getVendorStats,
  updateVendorStatus,
  updateVendorDetails,
  deleteVendor,
  getVendorById,
  getPendingVendors,
  getVendorOrders,
};