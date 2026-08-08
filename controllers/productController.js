const productService = require('../services/productService');

const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body, req.user.id);
  res.json(product);
};

const getAllProduct = async (req, res) => {
  const products = await productService.getAllProducts();
  res.json(products);
};

const getMyProduct = async (req, res) => {
  const products = await productService.getMyProducts(req.user.id);
  res.json(products);
};

const updateProduct = async (req, res) => {
  const updated = await productService.updateProduct(
    req.params.id,
    req.body,
    req.user.id
  );
  res.json(updated);
};

const deleteProduct = async (req, res) => {
  const result = await productService.deleteProduct(
    req.params.id,
    req.user.id
  );
  res.json(result);
};

module.exports = {
  createProduct,
  getAllProduct,
  getMyProduct,
  updateProduct,
  deleteProduct
};