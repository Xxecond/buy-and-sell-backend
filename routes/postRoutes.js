const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const asyncHandler = require('express-async-handler');

const {getAllPosts, getMyPosts, createPost, updatePost, deletePost} = require('../controllers/postController');
const {validateCreatePost, validateUpdatePost, validatePostQuery, validatePostId} = require('../Validators/postValidator');
   
//SAFE READ ROUTES
router.get('/', authMiddleware, authorizeRole('superAdmin'), validatePostQuery, asyncHandler(getAllPosts));
router.get('/me', authMiddleware, validatePostQuery, asyncHandler(getMyPosts));

//STATE CHANGING ROUTES
router.post('/',  validateCreatePost, authMiddleware, createPost);
router.put('/:id', validatePostId, validateUpdatePost, authMiddleware, updatePost);
router.delete('/:id', validatePostId, authMiddleware, deletePost);

module.exports = router;