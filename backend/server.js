const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const { socketManager } = require('./src/config/socket');

const app = express();
app.use(cors());
app.use(express.json());

// db staff
// const syncDatabase = require('./src/app/models/seeders/seeders');
// syncDatabase();

// const syncMultivendorTables = require('./src/app/models/seeders/multivendorSeeders');
// syncMultivendorTables();

// const syncVendorCategory = require('./src/app/models/seeders/syncVendorCategory');
//  syncVendorCategory();

// const syncChatTables = require('./src/app/models/seeders/chatSeeders');
// syncChatTables();

// const syncAdminTables = require('./src/app/models/seeders/adminSeeders');
// syncAdminTables();

// const syncDeliverymanVehicleTables = require('./src/app/models/seeders/deliverymanVehicleSeeders');
// syncDeliverymanVehicleTables();

// const syncWalletTables = require('./src/app/models/seeders/walletSeeders');
// syncWalletTables();

// start Swagger 
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./src/config/swagger/swagger');

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
// End Swagger 

// Start Socket io with modular architecture
const server = http.createServer(app);

// OLD SOCKET ARCHITECTURE (COMMENTED OUT)
// const io = socketIo(server, {
//   cors: {
//     origin: "*" // or set to your frontend URL
//   }
// });

// app.set('io', io);

// Track connected captains
// let captains = {};

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   // Captain sends their live location
//   socket.on('captainLocation', ({ captainId, coords }) => {
//     captains[captainId] = { ...coords, socketId: socket.id };
//     console.log("location for captain file server" , JSON.stringify(captains) );
//     io.emit('captainLocationUpdate', captains); // Send to all clients
//   });

//   // Customer requests nearby captains
//   socket.on('getNearbyCaptains', () => {
//     socket.emit('captainsUpdate', captains);
//   });

//   // Ride confirmed: send route/pickup info
//   socket.on('confirmRide', ({ customerId, captainId, route }) => {
//     const captainSocket = captains[captainId]?.socketId;
//     if (captainSocket) {
//       io.to(captainSocket).emit('rideRequest', { customerId, route });
//     }
//   });

//   socket.on('disconnect', () => {
//     // Remove disconnected captain
//     for (let id in captains) {
//       if (captains[id].socketId === socket.id) {
//         delete captains[id];
//       }
//     }
//     io.emit('captainsUpdate', captains);
//     console.log('Client disconnected:', socket.id);
//   });
// });

// NEW MODULAR SOCKET ARCHITECTURE
socketManager.initialize(server);
app.set('io', socketManager.getIO());

// Routes
const captainRoutes = require('./src/modules/captain/routes/captain.routes')
const customerRoutes = require('./src/modules/customer/routes/customer.routes');
const rideRoutes = require('./src/modules/rides/routes/ride.routes');
const vendorRoutes = require('./src/modules/vendor/routes/vendor.routes');
const uploadRoutes = require('./src/config/cloudinary/routes/upload')
const chatRoutes = require('./src/modules/chat/routes/chat.routes');
const deliverymanRoutes = require('./src/modules/deliveryman/routes/deliveryman.routes');
const walletRoutes = require('./src/modules/wallet/routes/wallet.routes');
const adminWalletRoutes = require('./src/modules/wallet/routes/admin.wallet.routes');


app.use('/api/captain', captainRoutes);
app.use('/api/customers',customerRoutes)
app.use('/api/rides', rideRoutes);
app.use('/api/vendor', vendorRoutes );
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/deliveryman', deliverymanRoutes);
app.use('/api/wallet', walletRoutes);

//admin routes
const adminRoutes = require('./src/modules/admin/routes/admin.routes');
app.use('/api/admin', adminRoutes);
app.use('/api/admin/wallet', adminWalletRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('API is working!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT,'0.0.0.0', () => console.log(`Server running on port ${PORT}`));
