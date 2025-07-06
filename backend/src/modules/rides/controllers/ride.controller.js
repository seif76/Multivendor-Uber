const { createRideRequest } = require('../services/ride.service');

const createRideRequestController = async (req, res) => {
  try {
    const {
      customer_id,
      pickup_coordinates,
      pickup_address,
      pickup_place_id,
      dropoff_coordinates,
      dropoff_address,
      dropoff_place_id,
      requested_fare,
    } = req.body;

    // Basic validation
    if (
      !customer_id ||
      !pickup_coordinates ||
      !dropoff_coordinates ||
      !requested_fare
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ride = await createRideRequest({
      customer_id,
      pickup_coordinates,
      pickup_address,
      pickup_place_id,
      dropoff_coordinates,
      dropoff_address,
      dropoff_place_id,
      requested_fare,
    });
    
    const io = req.app.get('io');
    io.emit('newRideRequest', ride);

    return res.status(201).json({
      message: 'Ride requested successfully',
      ride,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRideRequestController,
};
