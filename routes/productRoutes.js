const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const asyncHandler = require('express-async-handler');
const csurf = require('csurf');

const csrfProtection = csurf({
    cookie: true
});


const {createProduct, getAllProduct, getMyProduct, deleteProduct, updateProduct} = require('../controllers/productController')
const {validateCreatePost, validateUpdatePost, validatePostQuery, validatePostId} = require('../Validators/postValidator');

router.post('/', authMiddleware, csrfProtection, asyncHandler(createProduct));
router.put('/:id', validatePostId,authMiddleware, csrfProtection, authorizeRole('admin', 'user'), asyncHandler(updateProduct));
router.delete('/:id',authMiddleware, csrfProtection, authorizeRole('user', 'superAdmin'), asyncHandler(deleteProduct));

router.get('/', authMiddleware, authorizeRole('superAdmin'), asyncHandler(getAllProduct));
router.get('/me', authMiddleware, getMyProduct) 
module.exports = router;    