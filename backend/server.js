const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());


// db staff
const syncDatabase = require('./src/app/models/seeders/seeders');
//syncDatabase();
//


// Routes
const captainRoutes = require('./src/modules/captain/routes/captain.routes')
const customerRoutes = require('./src/modules/customer/routes/customer.routes');
//

app.use('/api/captain', captainRoutes);
app.use('/api/customers',customerRoutes)

// Routes
app.get('/', (req, res) => {
  res.send('API is working!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
