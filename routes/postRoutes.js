const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const asyncHandler = require('express-async-handler');
const csurf = require('csurf');

const csrfProtection = csurf({
    cookie: true
});

const {getAllPosts, getMyPosts, createPost, updatePost, deletePost} = require('../controllers/postController');
const {validateCreatePost, validateUpdatePost, validatePostQuery, validatePostId} = require('../Validators/postValidator');
   
//SAFE READ ROUTES
router.get('/', authMiddleware, authorizeRole('superAdmin'), validatePostQuery, asyncHandler(getAllPosts));
router.get('/me', authMiddleware, validatePostQuery, asyncHandler(getMyPosts));

//STATE CHANGING ROUTES
router.post('/',  validateCreatePost, authMiddleware, csrfProtection,  createPost);
router.put('/:id', validatePostId, validateUpdatePost, authMiddleware, csrfProtection, updatePost);
router.delete('/:id', validatePostId, authMiddleware, csrfProtection, deletePost);

module.exports = router;