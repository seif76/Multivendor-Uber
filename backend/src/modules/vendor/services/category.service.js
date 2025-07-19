const { VendorCategory } = require('../../../app/models');

const createCategory = async (categoryData) => {
  return await VendorCategory.create(categoryData);
};

const updateCategory = async (categoryId, vendorId, updates) => {
  const category = await VendorCategory.findOne({ where: { id: categoryId, vendor_id: vendorId } });
  if (!category) throw new Error('Category not found or unauthorized');
  return await category.update(updates);
};

const deleteCategory = async (categoryId, vendorId) => {
  const category = await VendorCategory.findOne({ where: { id: categoryId, vendor_id: vendorId } });
  if (!category) throw new Error('Category not found or unauthorized');
  await category.destroy();
  return 'Category deleted successfully';
};

const getVendorCategories = async (vendorId) => {
  return await VendorCategory.findAll({ where: { vendor_id: vendorId } });
};

const getCategoryById = async (categoryId, vendorId) => {
  return await VendorCategory.findOne({ where: { id: categoryId, vendor_id: vendorId } });
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getVendorCategories,
  getCategoryById,
}; 