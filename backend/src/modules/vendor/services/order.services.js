const { Order, OrderItem, Product, User, DeliverymanVehicle, VendorInfo } = require('../../../app/models');
const { OrderSocket } = require('../../../config/socket');

// Get all orders that include products belonging to this vendor
const getVendorOrders = async (vendorId) => {
  // Find all order items for this vendor's products
  const items = await OrderItem.findAll({
    include: [{
      model: Product,
      as: 'product',
      where: { vendor_id: vendorId },
    }, {
      model: Order,
      as: 'order',
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone_number'] },
        { 
          model: User, 
          as: 'deliveryman', 
          attributes: ['id', 'name', 'phone_number'],
          include: [{
            model: DeliverymanVehicle,
            as: 'delivery_vehicle',
            attributes: ['make', 'model', 'license_plate', 'vehicle_type']
          }]
        }
      ]
    }],
  });

  // Group items by order
  const ordersMap = {};
  items.forEach(item => {
    const orderId = item.order_id;
    if (!ordersMap[orderId]) {
      ordersMap[orderId] = {
        ...item.order.dataValues,
        items: [],
      };
    }
    ordersMap[orderId].items.push(item);
  });
  
  // Get vendor info for each order
  const orders = Object.values(ordersMap);
  const vendor = await VendorInfo.findOne({ 
    where: { vendor_id: vendorId },
    attributes: ['id', 'vendor_id', 'shop_name', 'phone_number', 'shop_location']
  });
  
  // Add vendor info to each order
  orders.forEach(order => {
    order.vendor = vendor;
  });
  
  return orders;
};

// Get order details for this vendor (only their products/items)
const getVendorOrderDetails = async (orderId, vendorId) => {
  // Find order with customer info
  const order = await Order.findByPk(orderId, {
    include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone_number'] }]
  });
  if (!order) return null;
  // Find items for this vendor
  const items = await OrderItem.findAll({
    where: { order_id: orderId },
    include: [{
      model: Product,
      as: 'product',
      where: { vendor_id: vendorId },
    }],
  });
  return {
    ...order.dataValues,
    items,
    customer: order.customer,
    address: order.address,
  };
};

// Update order status (for now, update the whole order)
const updateOrderStatus = async (orderId, vendorId, status) => {
  // Validate status
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`);
  }

  // Find order with customer info
  const order = await Order.findByPk(orderId, {
    include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'email'] }]
  });
  
  if (!order) {
    throw new Error('Order not found');
  }

  // Check if vendor has products in this order
  const vendorItems = await OrderItem.findAll({
    where: { order_id: orderId },
    include: [{
      model: Product,
      as: 'product',
      where: { vendor_id: vendorId },
    }],
  });

  if (vendorItems.length === 0) {
    throw new Error('No products found for this vendor in this order');
  }

  // Update order status
  const previousStatus = order.status;
  order.status = status;
  await order.save();
  
  console.log(`Order ${orderId} status updated from ${previousStatus} to ${status} by vendor ${vendorId}`);
  
  // Send socket notification to customer
  if (order.customer) {
    OrderSocket.notifyOrderStatusChange(orderId, status, order.customer.id);
    console.log(`Socket notification sent to customer ${order.customer.id} for order ${orderId}`);
  }

  // If order is ready, notify deliverymen
  if (status === 'ready' && order.customer) {
    // Get vendor details from VendorInfo table
    const vendor = await VendorInfo.findOne({ 
      where: { vendor_id: vendorId },
      attributes: ['id', 'vendor_id', 'shop_name', 'phone_number', 'shop_location']
    });

    if (!vendor) {
      console.error(`Vendor info not found for vendor_id: ${vendorId}`);
      return {
        ...order.dataValues,
        previousStatus,
        vendorItems: vendorItems.length
      };
    }

    const orderDetails = {
      id: order.id,
      total_price: order.total_price,
      address: order.address,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email,
        phone_number: order.customer.phone_number,
        address: order.customer.address
      },
      vendor: {
        id: vendor.id,
        vendor_id: vendor.vendor_id,
        name: vendor.shop_name,
        phone_number: vendor.phone_number,
        address: vendor.shop_location
      }
    };
    OrderSocket.notifyDeliverymenNewOrder(orderId, order.customer.id, status, orderDetails);
    console.log(`Delivery order ${orderId} broadcasted to deliverymen with complete details`);
  }
  
  return {
    ...order.dataValues,
    previousStatus,
    vendorItems: vendorItems.length
  };
};

module.exports = {
  getVendorOrders,
  getVendorOrderDetails,
  updateOrderStatus,
}; 