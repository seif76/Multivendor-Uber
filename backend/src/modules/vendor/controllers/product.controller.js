const {
    createProduct,
    updateProduct,
    deleteProduct,
    getVendorProducts,
    getProductById,
  } = require('../services/product.services');
  
  const createProductController = async (req, res) => {
    try {
      const vendorId = req.user.id;
      const product = await createProduct({ ...req.body, vendor_id: vendorId });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const updateProductController = async (req, res) => {
    try {
      const vendorId = req.user.id;
      const productId = req.params.productId;
      const updated = await updateProduct(productId, vendorId, req.body);
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const deleteProductController = async (req, res) => {
    try {
      const vendorId = req.user.id;
      const productId = req.params.productId;
      const message = await deleteProduct(productId, vendorId);
      res.status(200).json({ message });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const getVendorProductsController = async (req, res) => {
    try {
      const vendorId = req.user.id;
      const products = await getVendorProducts(vendorId);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const getProductByIdController = async (req, res) => {
    try {
      const vendorId = req.user.id;
      const productId = req.params.productId;
      const product = await getProductById(productId, vendorId);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  module.exports = {
    createProductController,
    updateProductController,
    deleteProductController,
    getVendorProductsController,
    getProductByIdController,
  };
  