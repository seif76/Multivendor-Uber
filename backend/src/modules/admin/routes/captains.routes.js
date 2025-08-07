const express = require('express');
const router = express.Router();
const {
  getAllCaptainsController,
  getCaptainByIdController,
  getCaptainVehicleController,
  getCaptainRidesController,
  updateCaptainStatusController,
  deleteCaptainController,
  getCaptainStatsController
} = require('../controllers/captains.controller');

/**
 * @swagger
 * /api/admin/captains:
 *   get:
 *     summary: Get all captains with pagination and filtering
 *     tags: [Admin Captains]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of captains per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, pending, Deactivated]
 *         description: Filter by captain status
 *     responses:
 *       200:
 *         description: List of captains
 *       500:
 *         description: Server error
 */
router.get('/', getAllCaptainsController);

router.get('/details/:id', getCaptainByIdController);




/**
 * @swagger
 * /api/admin/captains/stats:
 *   get:
 *     summary: Get captain statistics
 *     tags: [Admin Captains]
 *     responses:
 *       200:
 *         description: Captain statistics
 *       500:
 *         description: Server error
 */
router.get('/stats', getCaptainStatsController);

/**
 * @swagger
 * /api/admin/captains/pending:
 *   get:
 *     summary: Get pending captains
 *     tags: [Admin Captains]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of captains per page
 *     responses:
 *       200:
 *         description: List of pending captains
 *       500:
 *         description: Server error
 */
router.get('/pending', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const pendingCaptains = await Captain.findAll({
      where: { captain_status: 'pending' },
      offset,
      limit,
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'phone_number', 'gender', 'profile_photo'],
        },
        {
          model: CaptainVehicle,
          attributes: ['make', 'model', 'year', 'license_plate', 'vehicle_type', 'color'],
        },
      ],
    });

    res.status(200).json(pendingCaptains);
  } catch (error) {
    console.error('Error getting pending captains:', error);
    res.status(500).json({ error: 'Failed to get pending captains' });
  }
});

/**
 * @swagger
 * /api/admin/captains/register:
 *   post:
 *     summary: Register a new captain
 *     tags: [Admin Captains]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user, vehicle]
 *             properties:
 *               user:
 *                 type: object
 *                 required: [name, email, password, phone_number]
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *                   phone_number:
 *                     type: string
 *                   gender:
 *                     type: string
 *                     enum: [male, female]
 *                   profile_photo:
 *                     type: string
 *               vehicle:
 *                 type: object
 *                 required: [make, model, year, license_plate]
 *                 properties:
 *                   make:
 *                     type: string
 *                   model:
 *                     type: string
 *                   year:
 *                     type: string
 *                   license_plate:
 *                     type: string
 *                   vehicle_type:
 *                     type: string
 *                     enum: [sedan, suv, truck]
 *                   color:
 *                     type: string
 *                   driver_license_photo:
 *                     type: string
 *                   national_id_photo:
 *                     type: string
 *     responses:
 *       201:
 *         description: Captain registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/register', async (req, res) => {
  try {
    const { user, vehicle } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { phone_number: user.phone_number } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    // Create new captain
    const captain = await User.create({
      name: user.name,
      email: user.email,
      password: user.password, // Note: In production, hash the password
      phone_number: user.phone_number,
      gender: user.gender || 'male',
      profile_photo: user.profile_photo || '',
      user_type: 'captain',
      captain_status: 'Active'
    });

    // Create captain vehicle
    const captainVehicle = await CaptainVehicle.create({
      captain_phone_number: user.phone_number,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      license_plate: vehicle.license_plate,
      vehicle_type: vehicle.vehicle_type || 'sedan',
      color: vehicle.color || '',
      driver_license_photo: vehicle.driver_license_photo || '',
      national_id_photo: vehicle.national_id_photo || ''
    });

    res.status(201).json({ 
      message: 'Captain registered successfully',
      captain: {
        id: captain.id,
        name: captain.name,
        email: captain.email,
        phone_number: captain.phone_number,
        gender: captain.gender,
        captain_status: captain.captain_status,
        vehicle: captainVehicle
      }
    });
  } catch (error) {
    console.error('Error registering captain:', error);
    res.status(500).json({ error: 'Failed to register captain' });
  }
});

module.exports = router; 