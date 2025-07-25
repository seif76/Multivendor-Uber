const { getDashboardSummary } = require('../services/dashboard.service');

const dashboardSummaryController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    console.log('vendorId', vendorId);
    const summary = await getDashboardSummary(vendorId);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { dashboardSummaryController }; 