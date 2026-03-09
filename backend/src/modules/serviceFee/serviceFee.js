const express = require('express');
const router = express.Router();
const { ServiceFee } = require('../../app/models');

// GET - get service fee
router.get('/', async (req, res) => {
  try {
    const fee = await ServiceFee.findOne();
    if (!fee) return res.status(404).json({ error: 'Service fee not configured yet' });
    res.status(200).json(fee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - create only if table is empty
router.post('/', async (req, res) => {
  try {
    const existing = await ServiceFee.findOne();
    if (existing) {
      return res.status(400).json({ error: 'Service fee already exists, use PUT to update' });
    }

    const { fee_type, value, is_active } = req.body;

    if (!fee_type || value === undefined) {
      return res.status(400).json({ error: 'fee_type and value are required' });
    }
    if (!['percentage', 'fixed'].includes(fee_type)) {
      return res.status(400).json({ error: 'fee_type must be percentage or fixed' });
    }
    if (isNaN(value) || parseFloat(value) < 0) {
      return res.status(400).json({ error: 'Value must be a positive number' });
    }
    if (fee_type === 'percentage' && parseFloat(value) > 100) {
      return res.status(400).json({ error: 'Percentage value cannot exceed 100' });
    }

    const fee = await ServiceFee.create({ fee_type, value, is_active: is_active ?? true });
    res.status(201).json({ message: 'Service fee created successfully', fee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - update existing
router.put('/', async (req, res) => {
  try {
    const fee = await ServiceFee.findOne();
    if (!fee) {
      return res.status(404).json({ error: 'Service fee not found, use POST to create it first' });
    }

    const { fee_type, value, is_active } = req.body;

    if (fee_type !== undefined && !['percentage', 'fixed'].includes(fee_type)) {
      return res.status(400).json({ error: 'fee_type must be percentage or fixed' });
    }
    if (value !== undefined && (isNaN(value) || parseFloat(value) < 0)) {
      return res.status(400).json({ error: 'Value must be a positive number' });
    }
    if ((fee_type ?? fee.fee_type) === 'percentage' && value !== undefined && parseFloat(value) > 100) {
      return res.status(400).json({ error: 'Percentage value cannot exceed 100' });
    }

    await fee.update({
      ...(fee_type !== undefined && { fee_type }),
      ...(value !== undefined && { value }),
      ...(is_active !== undefined && { is_active }),
    });

    res.status(200).json({ message: 'Service fee updated successfully', fee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;