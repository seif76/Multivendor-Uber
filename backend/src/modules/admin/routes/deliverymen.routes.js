const express = require('express');
const router = express.Router();
const { User, DeliverymanVehicle } = require('../../../app/models');

const {
  getAllDeliverymenController,
  getDeliverymanByIdController,
  getDeliverymanVehicleController,
  getDeliverymanOrdersController,
  updateDeliverymanStatusController,
  deleteDeliverymanController,
  getDeliverymanStatsController
} = require('../controllers/deliverymen.controller');


router.get('/', getAllDeliverymenController);

router.get('/details/:id', getDeliverymanByIdController);


router.get('/stats', getDeliverymanStatsController);


router.get('/pending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const pendingDeliverymen = await User.findAll({
      where: { deliveryman_status: 'pending' },
      offset,
      limit,
      attributes: ['id', 'name', 'email', 'phone_number', 'gender' , 'profile_photo']
    });

    const total = await User.count({ where: { deliveryman_status: 'pending' } });
    res.status(200).json({ deliverymen: pendingDeliverymen, total });
  } catch (error) {
    console.error('Error getting pending deliverymen:', error);
    res.status(500).json({ error: 'Failed to get pending deliverymen' });
  }
});


// Additional routes pointing to the controllers
router.get('/:deliverymanId/vehicle', getDeliverymanVehicleController);
router.get('/:deliverymanId/orders', getDeliverymanOrdersController);
router.put('/:deliverymanId/status', updateDeliverymanStatusController);
router.delete('/:deliverymanId', deleteDeliverymanController);

module.exports = router;