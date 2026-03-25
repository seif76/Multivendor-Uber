const express = require('express');
const router = express.Router();
// Assuming you have an models index file that exports your initialized models
const { ServiceFee, AdminVendorCategory } = require('../../../app/models'); 

// ==========================================
// 1. SERVICE FEE ROUTES (Single Row Logic)
// ==========================================

router.get('/service-fee', async (req, res) => {
  try {
    // Find the first record
    let fee = await ServiceFee.findOne();
    
    // If no row exists yet, create the initial default row to ensure we always have exactly one
    if (!fee) {
      fee = await ServiceFee.create({
        fee_type: 'percentage',
        value: 0.00,
        is_active: true
      });
    }

    res.json(fee);
  } catch (error) {
    console.error('Error fetching service fee:', error);
    res.status(500).json({ error: 'Server Error fetching service fee' });
  }
});


router.put('/service-fee', async (req, res) => {
  try {
    const { fee_type, value, is_active } = req.body;

    // Find the single record
    let fee = await ServiceFee.findOne();
    
    if (!fee) {
      // Failsafe in case PUT is called before GET somehow
      fee = await ServiceFee.create({ fee_type, value, is_active });
    } else {
      // Update the existing row
      fee.fee_type = fee_type || fee.fee_type;
      fee.value = value !== undefined ? value : fee.value;
      fee.is_active = is_active !== undefined ? is_active : fee.is_active;
      await fee.save();
    }

    res.json({ message: 'Service fee updated successfully', serviceFee: fee });
  } catch (error) {
    console.error('Error updating service fee:', error);
    res.status(500).json({ error: 'Server Error updating service fee' });
  }
});


// ==========================================
// 2. VENDOR CATEGORIES ROUTES (CRUD)
// ==========================================

router.get('/vendor-categories', async (req, res) => {
  try {
    const categories = await AdminVendorCategory.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server Error fetching vendor categories' });
  }
});

router.post('/vendor-categories', async (req, res) => {
  try {
    const { name, description, icon, is_active } = req.body;

    const existingCategory = await AdminVendorCategory.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }

    const category = await AdminVendorCategory.create({
      name,
      description,
      icon,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Server Error creating vendor category' });
  }
});


router.put('/vendor-categories/:id', async (req, res) => {
  try {
    const { name, description, icon, is_active } = req.body;
    const categoryId = req.params.id;

    const category = await AdminVendorCategory.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if new name conflicts with another existing category
    if (name && name !== category.name) {
      const nameExists = await AdminVendorCategory.findOne({ where: { name } });
      if (nameExists) {
        return res.status(400).json({ error: 'Another category with this name already exists' });
      }
    }

    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      icon: icon !== undefined ? icon : category.icon,
      is_active: is_active !== undefined ? is_active : category.is_active
    });

    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Server Error updating vendor category' });
  }
});


router.patch('/vendor-categories/:id/status', async (req, res) => {
  try {
    const { is_active } = req.body;
    const category = await AdminVendorCategory.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.update({ is_active });
    res.json({ message: 'Category status updated successfully', category });
  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({ error: 'Server Error toggling status' });
  }
});

// router.delete('/vendor-categories/:id', async (req, res) => {
//   try {
//     const category = await AdminVendorCategory.findByPk(req.params.id);
    
//     if (!category) {
//       return res.status(404).json({ error: 'Category not found' });
//     }

//     await category.destroy();
//     res.json({ message: 'Category deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting category:', error);
//     res.status(500).json({ error: 'Server Error deleting vendor category' });
//   }
// });

module.exports = router;