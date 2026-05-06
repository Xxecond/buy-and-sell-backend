const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRole = require('../middleware/roleMiddleware');
const asyncHandler = require('express-async-handler');
const csurf = require('csurf');

const csrfProtection = csurf({
    cookie: true
});


const {signup, login, logout, promoteUser, demoteUser, deleteUser, getAllUsers} = require('../controllers/userController');
const { validateSignup, validateLogin, validateUserId } = require('../Validators/userValidator');


//protected routes
router.get('/', authMiddleware, csrfProtection, authorizeRole('superAdmin'), asyncHandler(getAllUsers));
router.put('/promote/:id', validateUserId, authMiddleware, csrfProtection, authorizeRole('superAdmin', 'admin'), promoteUser);
router.put('/demote/:id', validateUserId, authMiddleware, csrfProtection, authorizeRole('admin',  'superAdmin'), demoteUser);
router.delete('/delete/:id', validateUserId, authMiddleware, csrfProtection, authorizeRole('superAdmin'), deleteUser);

//public routes
router.post('/signup', validateSignup, asyncHandler(signup));
router.post('/login', validateLogin, asyncHandler(login));
router.post('/logout', asyncHandler(logout));

module.exports = router;