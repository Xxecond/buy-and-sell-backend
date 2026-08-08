const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { generateToken } = require("../utils/jwt");
const { sendVerificationEmail, buildVerificationLink } = require("../services/emailService");

// =========================
// SIGNUP
// =========================

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: lowerCaseEmail,
    },
  });

  if (existingUser) {
    const err = new Error("User already exists");
    err.status = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const verificationToken = crypto.randomBytes(32).toString("hex");

  const formattedName =
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  await prisma.user.create({
    data: {
      name: formattedName,

      email: lowerCaseEmail,

      password: hashedPassword,

      isVerified: false,

      verificationToken,

      verificationExpires: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  await sendVerificationEmail(lowerCaseEmail, verificationToken);

  return res.status(201).json({
    message: "Account created! Check your email to verify.",
    verificationLink: process.env.NODE_ENV !== "production" ? buildVerificationLink(verificationToken) : undefined,
  });
};

// =========================
// LOGIN
// =========================

const login = async (req, res) => {
  const { email, password } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: lowerCaseEmail,
    },
  });

  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 400;
    throw err;
  }

  if (!user.isVerified) {
    return res.status(403).json({
      message: "Please verify your email before logging in",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.status = 400;
    throw err;
  }

  const token = generateToken({
    id: user.id,

    role: user.role,
  });

  res.cookie("accessToken", token, {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: "lax",

    maxAge: 21 * 60 * 60 * 1000,
  });

  return res.json({
    message: "Login successful",

    user: {
      id: user.id,

      name: user.name,

      email: user.email,

      role: user.role,
    },
  });
};

// =========================
// VERIFY EMAIL
// =========================

const verifyEmail = async (req, res) => {
  const token = req.params.token || req.query.token;

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,

      verificationExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid or expired verification link",
    });
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      isVerified: true,

      verificationToken: null,

      verificationExpires: null,
    },
  });

  return res.json({
    message: "Email verified successfully",
  });
};

// =========================
// RESEND VERIFICATION EMAIL
// =========================

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  const lowerCaseEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: lowerCaseEmail,
    },
  });

  if (!user) {
    return res.json({
      message: "If the email exists, a verification link has been sent.",
    });
  }

  if (user.isVerified) {
    return res.status(400).json({
      message: "Email already verified.",
    });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      verificationToken,

      verificationExpires: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  await sendVerificationEmail(
    lowerCaseEmail,

    verificationToken,
  );

  return res.json({
    message: "Verification email sent",
    verificationLink: process.env.NODE_ENV !== "production" ? buildVerificationLink(verificationToken) : undefined,
  });
};

// =========================
// LOGOUT
// =========================

const logout = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: "lax",
  });

  return res.json({
    message: "Logged out successfully",
  });
};

// =========================
// GET CURRENT USER
// =========================

const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },

    select: {
      id: true,

      name: true,

      email: true,

      role: true,
    },
  });

  return res.json(user);
};

// =========================
// GET ALL USERS
// =========================

const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,

      name: true,

      email: true,

      role: true,

      isVerified: true,
    },

    orderBy: {
      id: "asc",
    },
  });

  return res.json(users);
};

// =========================
// PROMOTE USER
// =========================

const promoteUser = async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: {
      id: Number(id),
    },

    data: {
      role: "admin",
    },
  });

  return res.json({
    message: "User promoted to admin",

    user,
  });
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

  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });

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
    where: {
      id: Number(id),
    },

    data: {
      role: "user",
    },
  });

  return res.json({
    message: "User demoted",

    user: updated,
  });
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

  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (user.isSuperAdmin) {
    return res.status(403).json({
      message: "Cannot delete super admin",
    });
  }

  await prisma.user.delete({
    where: {
      id: Number(id),
    },
  });

  return res.json({
    message: "User deleted",
  });
};

module.exports = {
  signup,

  login,

  verifyEmail,

  resendVerificationEmail,

  logout,

  getMe,

  getAllUsers,

  promoteUser,

  demoteUser,

  deleteUser,
};
