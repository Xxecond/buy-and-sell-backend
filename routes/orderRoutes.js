const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const asyncHandler = require('express-async-handler');
const csurf = require('csurf');

const csrfProtection = csurf({
    cookie: true
});

const {createOrder, getMyOrders, getSellerOrders, updatedOrderStatus} = require('../controllers/orderController')


router.post('/', authMiddleware, createOrder);
router.put('/', authMiddleware, csrfProtection, updatedOrderStatus)

router.get('/my', authMiddleware, getMyOrders);
router.get('/sales', authMiddleware, getSellerOrders);

module.exports = router;