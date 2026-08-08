//service layer

const prisma = require('../config/db');

//service functions
const createProduct = async (data, userId) => {
  const { title, description, price, available } = data;

  return await prisma.product.create({
    data: {
      title,
      description,
      price: parseFloat(price),
      available,
      sellerId: userId
    }
  });
};

const getAllProducts = async () => {
  return await prisma.product.findMany({
    orderBy: { id: "desc" }
  });
};

const getMyProducts = async (userId) => {
  return await prisma.product.findMany({
    where: { sellerId: userId }
  });
};

const updateProduct = async (id, data, userId) => {
  const { title, description, price } = data;

  return await prisma.product.update({
    where: { id: Number(id) },
    data: {
      title,
      description,
      price: parseFloat(price),
      sellerId: userId,
      available: false
    }
  });
};

const deleteProduct = async (id, userId) => {
  await prisma.product.delete({
    where: { id: Number(id) }
  });

  return { message: "Product deleted successfully" };
};

module.exports = {
  createProduct,
  getAllProducts,
  getMyProducts,
  updateProduct,
  deleteProduct
};