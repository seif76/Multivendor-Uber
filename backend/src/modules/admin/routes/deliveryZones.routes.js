const express = require('express');
const router = express.Router();
const {
  getAllZones,
  getZoneById,
  createZone,
  updateZone,
  toggleZoneStatus,
  deleteZone
} = require('../controllers/deliveryZone.controller');


router.get('/', getAllZones);

router.get('/:id', getZoneById);

router.post('/', createZone);

router.put('/:id', updateZone);

router.patch('/:id/status', toggleZoneStatus);

router.delete('/:id', deleteZone);

module.exports = router;