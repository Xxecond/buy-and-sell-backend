const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
  const order = await orderService.createOrder(req.body, req.user.id);
  res.json(order);
};

const getMyOrders = async (req, res) => {
  const orders = await orderService.getMyOrders(req.user.id);
  res.json(orders);
};

const getSellerOrders = async (req, res) => {
  const orders = await orderService.getSellerOrders(req.user.id);
  res.json(orders);
};

const updatedOrderStatus = async (req, res) => {
  const updated = await orderService.updateOrderStatus(req.body);
  res.json(updated);
};

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updatedOrderStatus
};