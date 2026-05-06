const {PrismaClient} =require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createOrder = async (req, res) =>{

const {productId, quantity} = req.body;
//const productAvailble = !product || product.productAvailble
const product = await prisma.product.findUnique({
    where:{
        id: productId
    }
})
if(!product || !product.available){
    return res.status(400).json({message: "Not available"})
}

const totalPrice = product.price * quantity;

const order = await prisma.order.create({
    data: {
        productId,
        buyerId: req.user.id,
        quantity,
        totalPrice
    }
});

res.json(order);
}

const getMyOrders = async (req, res) =>{

    if(!req.user){
        res.json("no token");
        return console.log(req.user)
    }
    const myOrders = await prisma.order.findMany({
        where: {
            buyerId:req.user.id
        }
    })
res.json(myOrders)
}

const getSellerOrders = async (req, res) =>{

    const sellerOrders = await prisma.order.findMany({
    where:{
        product:{
        sellerId: req.user.id
    }}
})
res.json(sellerOrders)
}
const updatedOrderStatus = async (req, res) =>{
    const {orderId, status} = req.body;
const orderStatus = await  prisma.order.update({
    where:{
        id: orderId
    },
    data:{
        status,
    }
})
res.json(orderStatus)
}

module.exports = {createOrder, getMyOrders, getSellerOrders, updatedOrderStatus}