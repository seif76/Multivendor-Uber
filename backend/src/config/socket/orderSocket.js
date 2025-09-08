const socketManager = require('./socketManager');

class OrderSocket {
  static notifyOrderStatusChange(orderId, status, customerId) {
    socketManager.notifyOrderStatusChange(orderId, status, customerId);
  }

  static notifyNewOrder(orderId, customerId, status) {
    socketManager.notifyNewOrder(orderId, customerId, status);
  }

  static notifyOrderCancelled(orderId, customerId) {
    socketManager.notifyOrderStatusChange(orderId, 'cancelled', customerId);
  }

  static notifyOrderDelivered(orderId, customerId) {
    socketManager.notifyOrderStatusChange(orderId, 'delivered', customerId);
  }

  static notifyOrderShipped(orderId, customerId) {
    socketManager.notifyOrderStatusChange(orderId, 'shipped', customerId);
  }

  static notifyOrderConfirmed(orderId, customerId) {
    socketManager.notifyOrderStatusChange(orderId, 'confirmed', customerId);
  }

  static notifyVendorNewOrder(orderId, vendorId, customerId, status) {
    socketManager.notifyVendorNewOrder(orderId, vendorId, customerId, status);
  }

  static notifyDeliverymenNewOrder(orderId, customerId, status, orderDetails) {
    socketManager.notifyDeliverymenNewOrder(orderId, customerId, status, orderDetails);
  }
}

module.exports = OrderSocket; 