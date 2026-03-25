const {
  getOverviewStats,
  getRevenueOverTime,
  getOrdersBreakdown,
  getTopVendors,
  getTopProducts,
  getDeliverymanPerformance,
  getWalletStats,
} = require('../services/dashboard.service');

const getOverviewController = async (req, res) => {
  try {
    const data = await getOverviewStats();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getOverviewController:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRevenueController = async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    const data = await getRevenueOverTime(range);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getRevenueController:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getOrdersBreakdownController = async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    const data = await getOrdersBreakdown(range);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getOrdersBreakdownController:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTopVendorsController = async (req, res) => {
  try {
    const { limit = 10, range = 'month' } = req.query;
    const data = await getTopVendors(limit, range);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getTopVendorsController:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTopProductsController = async (req, res) => {
  try {
    const { limit = 10, range = 'month' } = req.query;
    const data = await getTopProducts(limit, range);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getTopProductsController:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getDeliverymanPerformanceController = async (req, res) => {
  try {
    const { limit = 10, range = 'month' } = req.query;
    const data = await getDeliverymanPerformance(limit, range);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getDeliverymanPerformanceController:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getWalletStatsController = async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    const data = await getWalletStats(range);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getWalletStatsController:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getOverviewController,
  getRevenueController,
  getOrdersBreakdownController,
  getTopVendorsController,
  getTopProductsController,
  getDeliverymanPerformanceController,
  getWalletStatsController,
};