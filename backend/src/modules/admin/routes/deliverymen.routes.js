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

/**
 * @swagger
 * /api/admin/deliverymen:
 * get:
 * summary: Get all deliverymen with pagination and filtering
 * tags: [Admin Deliverymen]
 * parameters:
 * - in: query
 * name: page
 * schema:
 * type: integer
 * description: Page number
 * - in: query
 * name: limit
 * schema:
 * type: integer
 * description: Number of deliverymen per page
 * - in: query
 * name: status
 * schema:
 * type: string
 * enum: [Active, pending, Deactivated]
 * description: Filter by deliveryman status
 * responses:
 * 200:
 * description: List of deliverymen
 * 500:
 * description: Server error
 */
router.get('/', getAllDeliverymenController);

router.get('/details/:id', getDeliverymanByIdController);

/**
 * @swagger
 * /api/admin/deliverymen/stats:
 * get:
 * summary: Get deliveryman statistics
 * tags: [Admin Deliverymen]
 * responses:
 * 200:
 * description: Deliveryman statistics
 * 500:
 * description: Server error
 */
router.get('/stats', getDeliverymanStatsController);

/**
 * @swagger
 * /api/admin/deliverymen/pending:
 * get:
 * summary: Get pending deliverymen
 * tags: [Admin Deliverymen]
 * parameters:
 * - in: query
 * name: page
 * schema:
 * type: integer
 * description: Page number
 * - in: query
 * name: limit
 * schema:
 * type: integer
 * description: Number of deliverymen per page
 * responses:
 * 200:
 * description: List of pending deliverymen
 * 500:
 * description: Server error
 */
router.get('/pending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const pendingDeliverymen = await User.findAll({
      where: { deliveryman_status: 'pending' },
      offset,
      limit,
      include: [
        {
          model: DeliverymanVehicle,
          attributes: ['make', 'model', 'year', 'license_plate', 'vehicle_type', 'color'],
        },
      ],
      attributes: ['id', 'name', 'email', 'phone_number', 'gender', 'profile_photo']
    });

    res.status(200).json(pendingDeliverymen);
  } catch (error) {
    console.error('Error getting pending deliverymen:', error);
    res.status(500).json({ error: 'Failed to get pending deliverymen' });
  }
});

/**
 * @swagger
 * /api/admin/deliverymen/register:
 * post:
 * summary: Register a new deliveryman
 * tags: [Admin Deliverymen]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [user, vehicle]
 * properties:
 * user:
 * type: object
 * required: [name, email, password, phone_number]
 * properties:
 * name:
 * type: string
 * email:
 * type: string
 * password:
 * type: string
 * phone_number:
 * type: string
 * gender:
 * type: string
 * enum: [male, female]
 * profile_photo:
 * type: string
 * vehicle:
 * type: object
 * required: [make, model, vehicle_type]
 * properties:
 * make:
 * type: string
 * model:
 * type: string
 * year:
 * type: integer
 * license_plate:
 * type: string
 * vehicle_type:
 * type: string
 * enum: [motorcycle, bicycle, car, van]
 * color:
 * type: string
 * driver_license_photo:
 * type: string
 * national_id_photo:
 * type: string
 * responses:
 * 201:
 * description: Deliveryman registered successfully
 * 400:
 * description: Bad request
 * 500:
 * description: Server error
 */
router.post('/register', async (req, res) => {
  try {
    const { user, vehicle } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { phone_number: user.phone_number } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    // Create new deliveryman
    const deliveryman = await User.create({
      name: user.name,
      email: user.email,
      password: user.password, // Note: In production, hash the password
      phone_number: user.phone_number,
      gender: user.gender || 'male',
      profile_photo: user.profile_photo || '',
      deliveryman_status: 'Active'
    });

    // Create deliveryman vehicle
    const deliverymanVehicle = await DeliverymanVehicle.create({
      deliveryman_id: deliveryman.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year || null,
      license_plate: vehicle.license_plate || null,
      vehicle_type: vehicle.vehicle_type || 'motorcycle',
      color: vehicle.color || '',
      driver_license_photo: vehicle.driver_license_photo || null,
      national_id_photo: vehicle.national_id_photo || ''
    });

    res.status(201).json({ 
      message: 'Deliveryman registered successfully',
      deliveryman: {
        id: deliveryman.id,
        name: deliveryman.name,
        email: deliveryman.email,
        phone_number: deliveryman.phone_number,
        gender: deliveryman.gender,
        deliveryman_status: deliveryman.deliveryman_status,
        vehicle: deliverymanVehicle
      }
    });
  } catch (error) {
    console.error('Error registering deliveryman:', error);
    res.status(500).json({ error: 'Failed to register deliveryman' });
  }
});

// Additional routes pointing to the controllers
router.get('/:deliverymanId/vehicle', getDeliverymanVehicleController);
router.get('/:deliverymanId/orders', getDeliverymanOrdersController);
router.put('/:deliverymanId/status', updateDeliverymanStatusController);
router.delete('/:deliverymanId', deleteDeliverymanController);

module.exports = router;