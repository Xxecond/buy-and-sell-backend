const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const env = require("../config/env");

const { generateToken } = require("../utils/jwt");
const {
  sendVerificationEmail,
  buildVerificationLink,
} = require("../services/emailService");

// =========================
// SIGNUP
// =========================

const signup = async (req, res) => {
  const { name, email, password, deviceId } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: lowerCaseEmail },
  });

  if (existingUser) {
    const err = new Error("User already exists");
    err.status = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const formattedName =
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  const sessionId = deviceId || crypto.randomBytes(32).toString("hex");

  const newUser = await prisma.user.create({
    data: {
      name: formattedName,
      email: lowerCaseEmail,
      password: hashedPassword,
      isVerified: false,
    },
  });

  await prisma.deviceSession.upsert({
    where: { deviceId: sessionId },
    update: {
      userId: newUser.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
    create: {
      deviceId: sessionId,
      userId: newUser.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  await sendVerificationEmail(lowerCaseEmail, sessionId);

  return res.status(201).json({
    success: true,
    message: "Check email to verify account.",
    nextStep: "VERIFY_EMAIL",
    data: {
      user: {
        id: newUser.id,
        email: lowerCaseEmail,
        name: formattedName,
        isVerified: false,
      },
    },
    verificationLink:
      env.NODE_ENV !== "production"
        ? buildVerificationLink(sessionId)
        : undefined,
  });
};

// =========================
// LOGIN
// =========================

const login = async (req, res) => {
  const { email, password } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: lowerCaseEmail },
  });

  if (!user) {
    const err = new Error("Password or email is incorrect.");
    err.status = 400;
    throw err;
  }


  if (!user.isVerified) {
    return res
      .status(403)
      .json({ message: "Please verify your email before logging in" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const err = new Error("Password or email is incorrect.");
    err.status = 400;
    throw err;
  }

  const token = generateToken({ id: user.id, role: user.role });
  
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 21 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
};

// =========================
// VERIFY EMAIL
// =========================

const verifyEmail = async (req, res) => {
  const deviceId = req.query.device_id;

  if (!deviceId) {
    return res.redirect(`${env.FRONTEND_URL}/auth/verify?error=Token+missing`);
  }

  const session = await prisma.deviceSession.findUnique({
    where: { deviceId },
  });

  if (!session || new Date() > session.expiresAt) {
    await prisma.deviceSession.deleteMany({ where: { deviceId } });
    return res.redirect(`${env.FRONTEND_URL}/auth/verify?error=Token+expired`);
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.userId },
    data: { isVerified: true },
  });

  const authToken = generateToken({
    id: updatedUser.id,
    role: updatedUser.role,
  });

  await prisma.deviceSession.update({
    where: { deviceId },
    data: { token: authToken },
  });

  res.cookie("accessToken", authToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 21 * 60 * 60 * 1000,
  });

  return res.redirect(`${env.FRONTEND_URL}/auth/verify?success=true`);
};

// =========================
// CHECK VERIFICATION (POLLING)
// =========================

const checkVerification = async (req, res) => {
  const { device_id } = req.query;

  if (!device_id) {
    return res.status(400).json({ verified: false });
  }

  const session = await prisma.deviceSession.findUnique({
    where: { deviceId: device_id },
  });

  if (!session || new Date() > session.expiresAt) {
    await prisma.deviceSession.deleteMany({ where: { deviceId: device_id } });
    return res.status(400).json({ verified: false, error: "Session expired" });
  }

  if (!session.token) {
    return res.json({ verified: false });
  }

  await prisma.deviceSession.delete({ where: { deviceId: device_id } });

  return res.json({ verified: true, token: session.token });
};

// =========================
// RESEND VERIFICATION EMAIL
// =========================

const resendVerificationEmail = async (req, res) => {
  const { email, deviceId } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: lowerCaseEmail },
  });

  if (!user) {
    const err = new Error("Email is incorrect.");
    err.status = 400;
    throw err;
  }

  if (user.isVerified) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Email already verified.",
        error: "EMAIL_ALREADY_VERIFIED",
      });
  }

  const sessionId = deviceId || crypto.randomBytes(32).toString("hex");

  await prisma.deviceSession.upsert({
    where: { deviceId: sessionId },
    update: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      token: null,
    },
    create: {
      deviceId: sessionId,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await sendVerificationEmail(lowerCaseEmail, sessionId);

  return res.json({
    success: true,
    message: "Verification email sent! Check your inbox.",
    data: { email: lowerCaseEmail },
    verificationLink:
      env.NODE_ENV !== "production"
        ? buildVerificationLink(sessionId)
        : undefined,
  });
};

// =========================
// LOGOUT
// =========================

const logout = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.json({ success: true, message: "Logged out successfully" });
};

// =========================
// GET CURRENT USER
// =========================

const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  return res.json(user);
};

// =========================
// GET ALL USERS
// =========================

const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isVerified: true },
    orderBy: { id: "asc" },
  });

  return res.json(users);
};

// =========================
// PROMOTE USER
// =========================

const promoteUser = async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { role: "admin" },
  });

  return res.json({ message: "User promoted to admin", user });
};

// =========================
// DEMOTE USER
// =========================

const demoteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user.id === Number(id)) {
    const err = new Error("You cannot demote yourself");
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: Number(id) } });

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  if (user.isSuperAdmin) {
    const err = new Error("Cannot demote super admin");
    err.status = 403;
    throw err;
  }

  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: { role: "user" },
  });

  return res.json({ message: "User demoted", user: updated });
};

// =========================
// DELETE USER
// =========================

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user.id === Number(id)) {
    const err = new Error("You cannot delete yourself");
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: Number(id) } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.isSuperAdmin) {
    return res.status(403).json({ message: "Cannot delete super admin" });
  }

  await prisma.user.delete({ where: { id: Number(id) } });

  return res.json({ message: "User deleted" });
};

module.exports = {
  signup,
  login,
  verifyEmail,
  checkVerification,
  resendVerificationEmail,
  logout,
  getMe,
  getAllUsers,
  promoteUser,
  demoteUser,
  deleteUser,
};
