const { Order, OrderItem, Product, User, DeliverymanVehicle, VendorInfo } = require('../../../app/models');
const { OrderSocket } = require('../../../config/socket');

// Create a new order (checkout)
const createOrder = async (customerId, { items, address, payment_method }) => {
  // Calculate total price and validate single vendor
  let total = 0;
  const productMap = {};
  let vendorId = null;
  for (const item of items) {
    const product = await Product.findByPk(item.product_id);
    if (!product) throw new Error('Product not found');
    if (vendorId === null) vendorId = product.vendor_id;
    if (product.vendor_id !== vendorId) throw new Error('All items must be from the same vendor');
    productMap[item.product_id] = product;
    total += parseFloat(product.price) * item.quantity;
  }
  // Create order
  const order = await Order.create({
    customer_id: customerId,
    vendor_id: vendorId, // ✅ Add vendor_id to the order
    total_price: total,
    address,
    payment_method,
    status: 'pending',
  });
  // Create order items
  const orderItems = await Promise.all(items.map(item =>
    OrderItem.create({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: productMap[item.product_id].price,
    })
  ));

  const orderWithItems = { ...order.dataValues, items: orderItems };

  // Use OrderSocket for new order notification
  OrderSocket.notifyNewOrder(order.id, customerId, 'pending');
  
  // Notify vendor about new order
  OrderSocket.notifyVendorNewOrder(order.id, vendorId, customerId, 'pending');

  console.log(`New order ${order.id} created for vendor ${vendorId} by customer ${customerId}`);

  return orderWithItems;
};

// Get all orders for the logged-in customer
const getMyOrders = async (customerId) => {
  const orders = await Order.findAll({
    where: { customer_id: customerId },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [{ 
          model: Product, 
          as: 'product',
          include: [{ 
            model: VendorInfo, 
            as: 'vendor_info',
            attributes: ['id', 'vendor_id', 'shop_name', 'phone_number', 'shop_location']
          }]
        }],
      },
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
    ],
  });
  return orders;
};

// Get order details for the logged-in customer
const getOrderDetails = async (orderId, customerId) => {
  const order = await Order.findOne({
    where: { id: orderId, customer_id: customerId },
    include: [{
      model: OrderItem,
      as: 'items',
      include: [{ 
        model: Product, 
        as: 'product',
        include: [{ model: User, as: 'vendor' }]
      }],
    }],
  });
  return order;
};

const cancelOrder = async (orderId, customerId) => {
  const order = await Order.findOne({ where: { id: orderId, customer_id: customerId } });
  if (!order) throw new Error('Order not found');
  if (order.status !== 'pending') throw new Error('Only pending orders can be cancelled');
  await OrderItem.destroy({ where: { order_id: orderId } });
  await order.destroy();
  return { message: 'Order cancelled successfully' };
};

// Update customer delivery status
const updateCustomerDeliveryStatus = async (orderId, customerId, newStatus) => {
  try {
    const order = await Order.findOne({
      where: { 
        id: orderId, 
        customer_id: customerId 
      },
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone_number'] },
        { model: User, as: 'deliveryman', attributes: ['id', 'name', 'email', 'phone_number'] }
      ]
    });

    if (!order) {
      throw new Error('Order not found or not assigned to this customer');
    }

    // Validate status transition
    const validStatuses = ['none', 'deliveryman_arrived', 'order_handed_over', 'order_received', 'payment_made', 'payment_confirmed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid status');
    }

    // Update the customer delivery status
    await order.update({ customer_delivery_status: newStatus });

    // Check if this is the final step and update order status to 'delivered'
    const isFinalStep = (order.payment_method === 'cash' && newStatus === 'payment_confirmed') ||
                       (order.payment_method === 'wallet' && newStatus === 'order_received');
    
    if (isFinalStep) {
      await order.update({ status: 'delivered' });
      console.log(`Order ${orderId} marked as delivered - customer completed final step: ${newStatus}`);
    }

    // Get vendor info for notifications
    const { VendorInfo } = require('../../../app/models');
    const vendor = await VendorInfo.findOne({
      where: { vendor_id: order.vendor_id },
      attributes: ['id', 'vendor_id', 'shop_name', 'phone_number', 'shop_location']
    });

    // Refresh order data to get updated status
    await order.reload();

    // Prepare order details for socket notification
    const orderDetails = {
      id: order.id,
      customer: order.customer,
      deliveryman: order.deliveryman,
      vendor: vendor,
      status: order.status, // This will be 'delivered' if final step was completed
      delivery_status: order.delivery_status,
      customer_delivery_status: newStatus,
      total_price: order.total_price,
      payment_method: order.payment_method,
      address: order.address
    };

    // Notify via socket
    const socketManager = require('../../../config/socket/socketManager');
    
    // Notify deliveryman
    if (order.deliveryman) {
      socketManager.notifyDeliveryStatusUpdate(orderId, order.vendor_id, order.deliveryman.id, newStatus, orderDetails);
    }

    // Notify vendor
    if (vendor) {
      socketManager.notifyDeliveryStatusUpdate(orderId, vendor.vendor_id, order.deliveryman?.id, newStatus, orderDetails);
    }

    console.log(`Customer delivery status updated to: ${newStatus} for order: ${orderId}`);

    return order;
  } catch (error) {
    console.error('Error updating customer delivery status:', error);
    throw error;
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  updateCustomerDeliveryStatus,
  }; 