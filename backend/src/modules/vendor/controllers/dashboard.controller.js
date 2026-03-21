const { getDashboardSummary } = require('../services/dashboard.service');

const dashboardSummaryController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    // Accept timeframe from query: ?timeframe=today | week | month (default: month)
    const timeframe = ['today', 'week', 'month'].includes(req.query.timeframe)
      ? req.query.timeframe
      : 'month';

    console.log(`Dashboard summary for vendor ${vendorId} — timeframe: ${timeframe}`);

    const summary = await getDashboardSummary(vendorId, timeframe);
    res.json(summary);
  } catch (err) {
    console.error('Dashboard summary error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { dashboardSummaryController };