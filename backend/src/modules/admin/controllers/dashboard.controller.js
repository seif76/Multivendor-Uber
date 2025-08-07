const { getDashboardStats, getRevenueData, getTopPerformers } = require('../services/dashboard.service');

const getDashboardOverviewController = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRevenueAnalyticsController = async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    const revenueData = await getRevenueData(range);
    res.status(200).json(revenueData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTopVendorsController = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topVendors = await getTopPerformers('vendors', limit);
    res.status(200).json(topVendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTopProductsController = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topProducts = await getTopPerformers('products', limit);
    res.status(200).json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPlatformMetricsController = async (req, res) => {
  try {
    const metrics = await getDashboardStats();
    const platformMetrics = {
      averageOrderValue: metrics.averageOrderValue || 0,
      customerRetention: metrics.customerRetention || 0,
      vendorSatisfaction: metrics.vendorSatisfaction || 0,
      serviceDistribution: metrics.serviceDistribution || {}
    };
    res.status(200).json(platformMetrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardOverviewController,
  getRevenueAnalyticsController,
  getTopVendorsController,
  getTopProductsController,
  getPlatformMetricsController
}; 