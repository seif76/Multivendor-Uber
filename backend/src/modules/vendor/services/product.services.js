const { Product } = require('../../../app/models');
const { Op } = require('sequelize');

const createProduct = async (productData) => {
  // Accept vendor_category_id in productData
  return await Product.create(productData);
};

const updateProduct = async (productId, vendorId, updates) => {
  const product = await Product.findOne({ where: { id: productId, vendor_id: vendorId } });
  if (!product) throw new Error('Product not found or unauthorized');
  // Accept vendor_category_id in updates
  return await product.update(updates);
};

const deleteProduct = async (productId, vendorId) => {
  const product = await Product.findOne({ where: { id: productId, vendor_id: vendorId } });
  if (!product) throw new Error('Product not found or unauthorized');
  await product.destroy();
  return 'Product deleted successfully';
};

const getVendorProducts = async (vendorId) => {
  return await Product.findAll({ where: { vendor_id: vendorId } });
};

const getProductById = async (productId, vendorId) => {
  return await Product.findOne({ where: { id: productId, vendor_id: vendorId } });
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  getProductById,
};
