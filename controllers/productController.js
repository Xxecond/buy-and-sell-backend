const {PrismaClient} =require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { number } = require('zod');

const createProduct = async (req, res) => {

const {title, description, price, available} = req.body;


const product = await prisma.product.create({
    
    data:{
     title, 
     description,
     price: parseFloat(price),
     available,
     sellerId: req.user.id
    }
})
res.json(product)
}


const getAllProduct= async (req, res) =>{
    
const products = await prisma.product.findMany({

orderBy:{
    id: "desc"
}
});

res.json(products)
}

const getMyProduct = async (req, res) =>{
    
    const myProduct = await prisma.product.findMany({
        where:{
            sellerId: req.user.id
        }
    })
    res.json(myProduct)
}

const updateProduct = async (req, res) =>{
    const {id} = req.params;
    const {title, description, price} = req.body;

    const updatedProduct = await prisma.product.update({
        where:{
            id
        },

        data:{
            title,
            description,
            price: parseFloat(price),
            sellerId: req.user.id,
            available: false
        }
    })
    res.status(200).json(updatedProduct)
}

const deleteProduct = async (req, res) =>{
    const {id} = req.params;
    const deleteProduct = await prisma.product.delete({
           where :{
            id: Number(id)
           }
    })
    if(deleteProduct){
    return res.status(200).json({message: "product deleted successfully"})
    }
}

module.exports = {getAllProduct, getMyProduct, createProduct, deleteProduct, updateProduct}