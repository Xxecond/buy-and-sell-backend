const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const passport = require("./config/passport");
const errorHandler = require("./middleware/errorHandler");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  message: "Too many requests, try again later",
});

// =====================
// GLOBAL MIDDLEWARE
// =====================

app.use(
  cors({
    origin: ["http://localhost:3000", "https://buy-and-sell-nu.vercel.app"],

    credentials: true,
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// Parse cookies
app.use(cookieParser());
app.use(passport.initialize());

// Rate limit
app.use(limiter);

// =====================
// ROUTES
// =====================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

// =====================
// ERROR HANDLER
// =====================

app.use(errorHandler);

module.exports = app;
