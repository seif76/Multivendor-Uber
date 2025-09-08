const socketIo = require('socket.io');
const SocketAuth = require('./socketAuth');

class SocketManager {
  constructor() {
    this.io = null;
    this.captains = {};
    this.customers = {};
    this.vendors = {};
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: "*"
      }
    });

    // Add authentication middleware
    this.io.use(SocketAuth.authenticate);
    
    this.setupEventHandlers();
    console.log('Socket manager initialized with authentication');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Authenticated client connected:', socket.id, 'User ID:', socket.user.id);

      // Customer joins with their ID for order updates
      socket.on('customerJoin', ({ customerId }) => {
        // Verify the customer ID matches the authenticated user
        if (socket.user.id !== customerId) {
          console.error('Customer ID mismatch');
          return;
        }
        this.customers[customerId] = { socketId: socket.id };
        console.log('Customer joined for order updates:', customerId);
      });

      // Vendor joins with their ID for order updates
      socket.on('vendorJoin', ({ vendorId }) => {
        // Verify the vendor ID matches the authenticated user
        if (socket.user.id !== vendorId) {
          console.error('Vendor ID mismatch');
          return;
        }
        this.vendors[vendorId] = { socketId: socket.id };
        console.log('Vendor joined for order updates:', vendorId);
      });

      // Captain sends their live location
      socket.on('captainLocation', ({ captainId, coords }) => {
        // Verify the captain ID matches the authenticated user
        if (socket.user.id !== captainId) {
          console.error('Captain ID mismatch');
          return;
        }
        this.captains[captainId] = { ...coords, socketId: socket.id };
        console.log("Location for captain:", JSON.stringify(this.captains));
        this.io.emit('captainLocationUpdate', this.captains);
      });

      // Customer requests nearby captains
      socket.on('getNearbyCaptains', () => {
        socket.emit('captainsUpdate', this.captains);
      });

      // Ride confirmed: send route/pickup info
      socket.on('confirmRide', ({ customerId, captainId, route }) => {
        const captainSocket = this.captains[captainId]?.socketId;
        if (captainSocket) {
          this.io.to(captainSocket).emit('rideRequest', { customerId, route });
        }
      });

      // Order status update event
      socket.on('orderStatusUpdate', ({ orderId, status, customerId }) => {
        this.notifyOrderStatusChange(orderId, status, customerId);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket.id);
      });
    });
  }

  // Order tracking methods
  notifyOrderStatusChange(orderId, status, customerId) {
    const customerSocket = this.customers[customerId]?.socketId;
    if (customerSocket) {
      this.io.to(customerSocket).emit('orderStatusChanged', { orderId, status });
    }
  }

  notifyNewOrder(orderId, customerId, status) {
    const customerSocket = this.customers[customerId]?.socketId;
    if (customerSocket) {
      this.io.to(customerSocket).emit('newOrderCreated', { orderId, customerId, status });
    }
  }

  notifyVendorNewOrder(orderId, vendorId, customerId, status) {
    const vendorSocket = this.vendors[vendorId]?.socketId;
    if (vendorSocket) {
      this.io.to(vendorSocket).emit('newOrderForVendor', { orderId, vendorId, customerId, status });
    }
  }

  // Ride tracking methods
  notifyCaptainLocation(captainId, coords) {
    this.captains[captainId] = { ...coords, socketId: this.captains[captainId]?.socketId };
    this.io.emit('captainLocationUpdate', this.captains);
  }

  notifyRideRequest(captainId, rideData) {
    const captainSocket = this.captains[captainId]?.socketId;
    if (captainSocket) {
      this.io.to(captainSocket).emit('rideRequest', rideData);
    }
  }

  handleDisconnect(socketId) {
    // Remove disconnected captain
    for (let id in this.captains) {
      if (this.captains[id].socketId === socketId) {
        delete this.captains[id];
      }
    }
    
    // Remove disconnected customer
    for (let id in this.customers) {
      if (this.customers[id].socketId === socketId) {
        delete this.customers[id];
      }
    }
    
    // Remove disconnected vendor
    for (let id in this.vendors) {
      if (this.vendors[id].socketId === socketId) {
        delete this.vendors[id];
      }
    }
    
    this.io.emit('captainsUpdate', this.captains);
    console.log('Client disconnected:', socketId);
  }

  getIO() {
    return this.io;
  }

  getCaptains() {
    return this.captains;
  }

  getCustomers() {
    return this.customers;
  }

  getVendors() {
    return this.vendors;
  }
}

module.exports = new SocketManager(); 