const {
  getVendorWorkingHours,
  addVendorWorkingHour,
  updateVendorWorkingHour,
  deleteVendorWorkingHour,
  getPublicWorkingHours,
  isVendorOpenNow,
} = require('../services/workingHour.service');

const getVendorWorkingHoursController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    console.log("vendorId: "+ vendorId);
    const hours = await getVendorWorkingHours(vendorId);
    res.json(hours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addVendorWorkingHourController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { day_of_week, open_time, close_time } = req.body;
    const hour = await addVendorWorkingHour(vendorId, day_of_week, open_time, close_time);
    res.json(hour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateVendorWorkingHourController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { day_of_week, open_time, close_time } = req.body;
    const hour = await updateVendorWorkingHour(req.params.id, vendorId, day_of_week, open_time, close_time);
    res.json(hour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteVendorWorkingHourController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const result = await deleteVendorWorkingHour(req.params.id, vendorId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPublicWorkingHoursController = async (req, res) => {
  try {
    const hours = await getPublicWorkingHours(req.params.vendorId);
    res.json(hours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const isVendorOpenNowController = async (req, res) => {
  try {
    const result = await isVendorOpenNow(req.params.vendorId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getVendorWorkingHoursController,
  addVendorWorkingHourController,
  updateVendorWorkingHourController,
  deleteVendorWorkingHourController,
  getPublicWorkingHoursController,
  isVendorOpenNowController,
}; 