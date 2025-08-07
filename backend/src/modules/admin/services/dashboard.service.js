const { User, VendorInfo, Order, Chat, ChatMessage } = require('../../../app/models');
const { Op } = require('sequelize');

const getDashboardStats = async () => {
  try {
    // Get counts
    const totalCustomers = await User.count({ 
      where: { 
        customer_status: { [Op.ne]: 'none' }
      } 
    });
    const totalCaptains = await User.count({ 
      where: { 
        captain_status: { [Op.ne]: 'none' }
      } 
    });
    const totalVendors = await User.count({ 
      where: { 
        vendor_status: { [Op.ne]: 'none' }
      } 
    });
    const totalOrders = await Order.count();

    // Get active counts
    const activeCustomers = await User.count({ 
      where: { 
        customer_status: 'Active'
      } 
    });
    
    const activeCaptains = await User.count({ 
      where: { 
        captain_status: 'Active'
      } 
    });
    
    const activeVendors = await User.count({ 
      where: { 
        vendor_status: 'Active'
      } 
    });

    // Get pending counts
    const pendingCaptains = await User.count({ 
      where: { 
        captain_status: 'pending'
      } 
    });
    
    const pendingVendors = await User.count({ 
      where: { 
        vendor_status: 'pending'
      } 
    });

    // Calculate revenue (mock data for now)
    const totalRevenue = 125000;
    const revenueGrowth = 12.5;
    const orderGrowth = 8.3;

    // Calculate average order value
    const completedOrders = await Order.count({ where: { status: 'completed' } });
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    // Mock customer retention and vendor satisfaction
    const customerRetention = 78;
    const vendorSatisfaction = 4.2;

    // Service distribution
    const serviceDistribution = {
      foodDelivery: 45,
      shopping: 30,
      rideServices: 25
    };

    return {
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        deactivated: totalCustomers - activeCustomers
      },
      captains: {
        total: totalCaptains,
        active: activeCaptains,
        pending: pendingCaptains,
        deactivated: totalCaptains - activeCaptains - pendingCaptains
      },
      vendors: {
        total: totalVendors,
        active: activeVendors,
        pending: pendingVendors,
        deactivated: totalVendors - activeVendors - pendingVendors
      },
      orders: {
        total: totalOrders,
        pending: await Order.count({ where: { status: 'pending' } }),
        completed: completedOrders,
        cancelled: await Order.count({ where: { status: 'cancelled' } })
      },
      revenue: {
        total: totalRevenue,
        growth: revenueGrowth
      },
      orderGrowth,
      averageOrderValue,
      customerRetention,
      vendorSatisfaction,
      serviceDistribution
    };
  } catch (error) {
    throw new Error(`Failed to get dashboard stats: ${error.message}`);
  }
};

const getRevenueData = async (range = 'month') => {
  try {
    // Mock revenue data - replace with actual implementation
    const revenueData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          data: [12000, 19000, 15000, 25000, 22000, 30000],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        }
      ]
    };

    return revenueData;
  } catch (error) {
    throw new Error(`Failed to get revenue data: ${error.message}`);
  }
};

const getRecentActivity = async (limit = 10) => {
  try {
    // Mock recent activity - replace with actual implementation
    const activities = [
      {
        id: 1,
        type: 'order',
        message: 'New order #1234 received',
        timestamp: new Date(),
        user: 'John Doe'
      },
      {
        id: 2,
        type: 'captain',
        message: 'New captain registration',
        timestamp: new Date(Date.now() - 3600000),
        user: 'Jane Smith'
      }
    ];

    return activities.slice(0, limit);
  } catch (error) {
    throw new Error(`Failed to get recent activity: ${error.message}`);
  }
};

module.exports = {
  getDashboardStats,
  getRevenueData,
  getRecentActivity
}; 