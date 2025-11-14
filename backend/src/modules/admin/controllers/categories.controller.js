
const { AdminVendorCategory } = require('../../../app/models');
const { Op } = require('sequelize');


const getAdminCategoriesController = async (req, res) => {
    try {
    
        // Admin needs all data, including inactive, to manage them
        const categories = await AdminVendorCategory.findAll({
          order: [['name', 'ASC']],
          // We can add pagination here later using req.query.page, etc.
        });
    
        res.status(200).json({
          success: true,
          count: categories.length,
          data: categories,
        });
    
      } catch (error) {
        console.error('Error fetching admin categories:', error);
        res.status(500).json({
          success: false,
          message: 'Server Error',
        });
  };

}  

module.exports = {
    getAdminCategoriesController
  }; 