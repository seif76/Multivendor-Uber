const {
  createCategory,
  updateCategory,
  deleteCategory,
  getVendorCategories,
  getCategoryById,
} = require('../services/category.service');
const { VendorInfo, VendorCategory } = require('../../../app/models');

const createCategoryController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const category = await createCategory({ ...req.body, vendor_id: vendorId });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCategoryController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const categoryId = req.params.categoryId;
    const updated = await updateCategory(categoryId, vendorId, req.body);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCategoryController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const categoryId = req.params.categoryId;
    const message = await deleteCategory(categoryId, vendorId);
    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVendorCategoriesController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const categories = await getVendorCategories(vendorId);
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCategoryByIdController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const categoryId = req.params.categoryId;
    const category = await getCategoryById(categoryId, vendorId);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCategoriesByPhoneController = async (req, res) => {
  console.log("getCategoriesByPhoneController called with params:", req.params);
  try {
    const { phone_number } = req.params;
    const vendor = await VendorInfo.findOne({ where: { phone_number } });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    const categories = await await getVendorCategories(vendor.vendor_id);;
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getVendorCategoriesController,
  getCategoryByIdController,
  getCategoriesByPhoneController,
}; 