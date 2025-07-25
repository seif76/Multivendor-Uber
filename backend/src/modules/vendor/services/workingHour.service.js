const { VendorWorkingHour, VendorInfo } = require('../../../app/models');

const getVendorWorkingHours = async (vendorId) => {
    console.log("vendorId: "+ vendorId);
  return await VendorWorkingHour.findAll({ where: { vendor_id: vendorId } });
};

const addVendorWorkingHour = async (vendorId, day_of_week, open_time, close_time) => {
  return await VendorWorkingHour.create({ vendor_id: vendorId, day_of_week, open_time, close_time });
};

const updateVendorWorkingHour = async (id, vendorId, day_of_week, open_time, close_time) => {
  const hour = await VendorWorkingHour.findOne({ where: { id, vendor_id: vendorId } });
  if (!hour) throw new Error('Working hour not found');
  await hour.update({ day_of_week, open_time, close_time });
  return hour;
};

const deleteVendorWorkingHour = async (id, vendorId) => {
  const hour = await VendorWorkingHour.findOne({ where: { id, vendor_id: vendorId } });
  if (!hour) throw new Error('Working hour not found');
  await hour.destroy();
  return { message: 'Deleted' };
};

const getPublicWorkingHours = async (vendorId) => {
  return await VendorWorkingHour.findAll({ where: { vendor_id: vendorId } });
};

const isVendorOpenNow = async (vendorId) => {
  const now = new Date();
  const day = now.getDay();
  const time = now.toTimeString().slice(0,5); // 'HH:MM'
  const hours = await VendorWorkingHour.findAll({ where: { vendor_id: vendorId, day_of_week: day } });
  const isOpen = hours.some(h => h.open_time <= time && h.close_time > time);
  return { isOpen };
};

module.exports = {
  getVendorWorkingHours,
  addVendorWorkingHour,
  updateVendorWorkingHour,
  deleteVendorWorkingHour,
  getPublicWorkingHours,
  isVendorOpenNow,
}; 