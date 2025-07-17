const { Product } = require('../../../app/models');
const { Op } = require('sequelize');

const createProduct = async (productData) => {
  return await Product.create(productData);
};

const updateProduct = async (productId, vendorId, updates) => {
  const product = await Product.findOne({ where: { id: productId, vendor_id: vendorId } });
  if (!product) throw new Error('Product not found or unauthorized');
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
