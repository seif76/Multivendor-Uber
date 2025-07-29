const socketManager = require('./socketManager');

class RideSocket {
  static notifyCaptainLocation(captainId, coords) {
    socketManager.notifyCaptainLocation(captainId, coords);
  }

  static notifyRideRequest(captainId, rideData) {
    socketManager.notifyRideRequest(captainId, rideData);
  }

  static notifyRideAccepted(rideId, customerId, captainId) {
    const customerSocket = socketManager.getCustomers()[customerId]?.socketId;
    if (customerSocket) {
      socketManager.getIO().to(customerSocket).emit('rideAccepted', { 
        rideId, 
        captainId 
      });
    }
  }

  static notifyRideStarted(rideId, customerId) {
    const customerSocket = socketManager.getCustomers()[customerId]?.socketId;
    if (customerSocket) {
      socketManager.getIO().to(customerSocket).emit('rideStarted', { rideId });
    }
  }

  static notifyRideCompleted(rideId, customerId) {
    const customerSocket = socketManager.getCustomers()[customerId]?.socketId;
    if (customerSocket) {
      socketManager.getIO().to(customerSocket).emit('rideCompleted', { rideId });
    }
  }

  static notifyRideCancelled(rideId, customerId, reason) {
    const customerSocket = socketManager.getCustomers()[customerId]?.socketId;
    if (customerSocket) {
      socketManager.getIO().to(customerSocket).emit('rideCancelled', { 
        rideId, 
        reason 
      });
    }
  }
}

module.exports = RideSocket; 