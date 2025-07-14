const { User, VendorInfo } = require('../../../app/models');
const { Op } = require('sequelize');

const registerVendor = async (userData, infoData) => {
  return await User.sequelize.transaction(async (transaction) => {
    const newUser = await User.create(userData, { transaction });
    const vendorInfo = await VendorInfo.create({ ...infoData, vendor_id: newUser.id }, { transaction });
    return { user: newUser, info: vendorInfo };
  });
};

const editVendor = async (phone_number, userUpdates, infoUpdates) => {
  const user = await User.findOne({ where: { phone_number } });
  if (!user || user.vendor_status === 'none') throw new Error('Vendor not found');

  await user.update(userUpdates);
  const info = await VendorInfo.findOne({ where: { vendor_id: user.id } });
  if (!info) throw new Error('Vendor info not found');
  await info.update(infoUpdates);

  return { user, info };
};

const deleteVendor = async (phone_number) => {
  const user = await User.findOne({ where: { phone_number } });
  if (!user || user.vendor_status === 'none') throw new Error('Vendor not found');

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

module.exports = {
  registerVendor,
  editVendor,
  deleteVendor,
  getVendorByPhone,
  getVendorsByStatus,
  setVendorStatus,
  getAllVendors,
  getVendorStatusCounts,
  getVendorProfile,
};
