const { Ride } = require('../../../app/models');

const createRideRequest = async (rideData) => {
  const newRide = await Ride.create({
    customer_id: rideData.customer_id,
    pickup_coordinates: rideData.pickup_coordinates,
    pickup_address: rideData.pickup_address,
    pickup_place_id: rideData.pickup_place_id,

    dropoff_coordinates: rideData.dropoff_coordinates,
    dropoff_address: rideData.dropoff_address,
    dropoff_place_id: rideData.dropoff_place_id,

    requested_fare: rideData.requested_fare,
    status: 'pending',
  });

  return newRide;
};

module.exports = { createRideRequest };
