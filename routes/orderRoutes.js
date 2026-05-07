const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const asyncHandler = require('express-async-handler');

const {createOrder, getMyOrders, getSellerOrders, updatedOrderStatus} = require('../controllers/orderController')


router.post('/', authMiddleware, createOrder);
router.put('/', authMiddleware, updatedOrderStatus)

router.get('/my', authMiddleware, getMyOrders);
router.get('/sales', authMiddleware, getSellerOrders);

module.exports = router;