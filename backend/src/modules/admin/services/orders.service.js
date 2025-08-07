const { Order, OrderItem, User, VendorInfo, Product } = require('../../../app/models');
const { Op } = require('sequelize');

const getAllOrders = async (page = 1, limit = 10, status = null) => {
  try {
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['name', 'phone_number', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Get order items separately to avoid complex associations
    const ordersWithItems = await Promise.all(
      rows.map(async (order) => {
        const orderData = order.toJSON();
        
        // Get order items
        const orderItems = await OrderItem.findAll({
          where: { order_id: order.id },
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'image', 'description', 'vendor_id']
            }
          ]
        });
        
        orderData.items = orderItems;
        
        // Get vendor information if there are products
        if (orderItems.length > 0) {
          const vendorIds = [...new Set(orderItems.map(item => item.product?.vendor_id).filter(Boolean))];
          
          if (vendorIds.length > 0) {
            const vendors = await User.findAll({
              where: { 
                id: vendorIds
              },
              include: [
                {
                  model: VendorInfo,
                  as: 'vendor_info',
                  attributes: ['shop_name']
                }
              ],
              attributes: ['id', 'name', 'phone_number', 'email']
            });
            
            orderData.vendors = vendors;
          } else {
            orderData.vendors = [];
          }
        } else {
          orderData.vendors = [];
        }
        
        // Format data for frontend
        orderData.customer_name = orderData.customer?.name || 'Unknown Customer';
        orderData.vendor_name = orderData.vendors?.[0]?.name || 'Unknown Vendor';
        orderData.items_count = orderData.items?.length || 0;
        orderData.total_amount = parseFloat(orderData.total_price) || 0;
        orderData.created_at = orderData.createdAt ? new Date(orderData.createdAt).toISOString() : new Date().toISOString();
        
        return orderData;
      })
    );

    // Debug: Log first order data
    if (ordersWithItems.length > 0) {
      console.log('First order data:', JSON.stringify(ordersWithItems[0], null, 2));
    }

    return {
      orders: ordersWithItems,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count
    };
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    throw new Error(`Failed to get orders: ${error.message}`);
  }
};

const getOrderStats = async () => {
  try {
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const confirmedOrders = await Order.count({ where: { status: 'confirmed' } });
    const completedOrders = await Order.count({ where: { status: 'delivered' } });
    const cancelledOrders = await Order.count({ where: { status: 'cancelled' } });

    return {
      total: totalOrders,
      pending: pendingOrders,
      confirmed: confirmedOrders,
      completed: completedOrders,
      cancelled: cancelledOrders
    };
  } catch (error) {
    console.error('Error in getOrderStats:', error);
    throw new Error(`Failed to get order stats: ${error.message}`);
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    await order.update({ status });
    return order;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};

const getOrderById = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['name', 'phone_number', 'email']
        }
      ]
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const orderData = order.toJSON();
    
    // Get order items
    const orderItems = await OrderItem.findAll({
      where: { order_id: orderId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image', 'description', 'vendor_id']
        }
      ]
    });
    
    orderData.items = orderItems;
    
    // Get vendor information if there are products
    if (orderItems.length > 0) {
      const vendorIds = [...new Set(orderItems.map(item => item.product?.vendor_id).filter(Boolean))];
      
      if (vendorIds.length > 0) {
        const vendors = await User.findAll({
          where: { 
            id: vendorIds
          },
          include: [
            {
              model: VendorInfo,
              as: 'vendor_info',
              attributes: ['shop_name', 'shop_location']
            }
          ],
          attributes: ['id', 'name', 'phone_number', 'email']
        });
        
        orderData.vendors = vendors;
      } else {
        orderData.vendors = [];
      }
    } else {
      orderData.vendors = [];
    }

    // Format data for frontend
    orderData.customer_name = orderData.customer?.name || 'Unknown Customer';
    orderData.vendor_name = orderData.vendors?.[0]?.name || 'Unknown Vendor';
    orderData.items_count = orderData.items?.length || 0;
    orderData.total_amount = parseFloat(orderData.total_price) || 0;
    orderData.created_at = orderData.createdAt ? new Date(orderData.createdAt).toISOString() : new Date().toISOString();

    return orderData;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    throw new Error(`Failed to get order: ${error.message}`);
  }
};

const deleteOrder = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Delete associated order items first
    await OrderItem.destroy({
      where: { order_id: orderId }
    });

    await order.destroy();
    return { message: 'Order deleted successfully' };
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    throw new Error(`Failed to delete order: ${error.message}`);
  }
};

module.exports = {
  getAllOrders,
  getOrderStats,
  updateOrderStatus,
  getOrderById,
  deleteOrder
}; 