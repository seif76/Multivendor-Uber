const express = require('express');
const router = express.Router();
const { DeliveryZone } = require('../../app/models');

// GET - get service fee
router.get('/', async (req, res) => {
  try {
    const deliveryZone = await DeliveryZone.findAll();
    if (!deliveryZone) return res.status(404).json({ error: 'DeliveryZone fee not configured yet' });
    res.status(200).json(deliveryZone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;