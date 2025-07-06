const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');


const app = express();
app.use(cors());
app.use(express.json());


// db staff
//const syncDatabase = require('./src/app/models/seeders/seeders');
//syncDatabase();
//




// Start Socket io  //
const server = http.createServer(app); // <--- wrap express in http server

const io = socketIo(server, {
  cors: {
    origin: "*" // or set to your frontend URL
  }
});

app.set('io', io);

// Track connected captains
let captains = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Captain sends their live location
  
  socket.on('captainLocation', ({ captainId, coords }) => {
    captains[captainId] = { ...coords, socketId: socket.id };
    console.log("location for captain file server" , JSON.stringify(captains) );
    io.emit('captainLocationUpdate', captains); // Send to all clients
  });

  // Customer requests nearby captains
  socket.on('getNearbyCaptains', () => {
    socket.emit('captainsUpdate', captains);
  });

  // Ride confirmed: send route/pickup info
  socket.on('confirmRide', ({ customerId, captainId, route }) => {
    const captainSocket = captains[captainId]?.socketId;
    if (captainSocket) {
      io.to(captainSocket).emit('rideRequest', { customerId, route });
    }
  });

  socket.on('disconnect', () => {
    // Remove disconnected captain
    for (let id in captains) {
      if (captains[id].socketId === socket.id) {
        delete captains[id];
      }
    }
    io.emit('captainsUpdate', captains);
    console.log('Client disconnected:', socket.id);
  });
});

// End Socket io  //


// Routes
const captainRoutes = require('./src/modules/captain/routes/captain.routes')
const customerRoutes = require('./src/modules/customer/routes/customer.routes');
const rideRoutes = require('./src/modules/rides/routes/ride.routes');
//

app.use('/api/captain', captainRoutes);
app.use('/api/customers',customerRoutes)
app.use('/api/rides', rideRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('API is working!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
