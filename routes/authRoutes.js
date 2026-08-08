const express = require("express");
const passport = require("passport");
const asyncHandler = require("express-async-handler");
const { oauthCallback } = require("../controllers/authController");

const router = express.Router();
const frontendUrl =
  process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${frontendUrl}/auth/login?error=oauth`,
  }),
  asyncHandler(oauthCallback("google")),
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] }),
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: `${frontendUrl}/auth/login?error=oauth`,
  }),
  asyncHandler(oauthCallback("facebook")),
);

router.get(
  "/twitter",
  passport.authenticate("twitter"),
);

router.get(
  "/twitter/callback",
  passport.authenticate("twitter", {
    session: false,
    failureRedirect: `${frontendUrl}/auth/login?error=oauth`,
  }),
  asyncHandler(oauthCallback("twitter")),
);

module.exports = router;
