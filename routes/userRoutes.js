const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");
const asyncHandler = require("express-async-handler");

const {
  signup,
  login,
  logout,
  verifyEmail,
  checkVerification,
  resendVerificationEmail,
  promoteUser,
  demoteUser,
  deleteUser,
  getAllUsers,
  getMe,
} = require("../controllers/userController");
const {
  validateSignup,
  validateLogin,
  validateUserId,
} = require("../Validators/userValidator");

//protected routes
router.get(
  "/",
  authMiddleware,
  authorizeRole("superAdmin"),
  asyncHandler(getAllUsers),
);

router.get("/me", authMiddleware, asyncHandler(getMe));

router.put(
  "/promote/:id",
  validateUserId,
  authMiddleware,
  authorizeRole("superAdmin", "admin"),
  promoteUser,
);
router.put(
  "/demote/:id",
  validateUserId,
  authMiddleware,
  authorizeRole("admin", "superAdmin"),
  demoteUser,
);
router.delete(
  "/delete/:id",
  validateUserId,
  authMiddleware,
  authorizeRole("superAdmin"),
  deleteUser,
);

//public routes
router.post("/signup", validateSignup, asyncHandler(signup));
router.post("/login", validateLogin, asyncHandler(login));
router.post("/logout", asyncHandler(logout));
router.post("/resendVerification", asyncHandler(resendVerificationEmail));
router.get("/verify", asyncHandler(verifyEmail));
router.get("/check-verification", asyncHandler(checkVerification));

module.exports = router;
