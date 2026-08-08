const prisma = require('../config/db');

const createOrder = async (data, userId) => {
  const { productId, quantity } = data;

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product || !product.available) {
    const err = new Error("Not available");
    err.status = 400;
    throw err;
  }

  const totalPrice = product.price * quantity;

  return await prisma.order.create({
    data: {
      productId,
      buyerId: userId,
      quantity,
      totalPrice
    }
  });
};

const getMyOrders = async (userId) => {
  return await prisma.order.findMany({
    where: { buyerId: userId }
  });
};

const getSellerOrders = async (userId) => {
  return await prisma.order.findMany({
    where: {
      product: {
        sellerId: userId
      }
    }
  });
};

const updateOrderStatus = async (data) => {
  const { orderId, status } = data;

  return await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
};

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus
};