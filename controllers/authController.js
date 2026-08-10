const { generateToken } = require("../utils/jwt");
const env = require('../config/env');

const frontendBaseUrl = env.FRONTEND_URL;

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 21 * 60 * 60 * 1000,
};

const oauthCallback = (provider) => (req, res) => {
  const user = req.user;

  if (!user) {
    return res.redirect(`${frontendBaseUrl}/auth/login?error=oauth`);
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  res.cookie("accessToken", token, cookieOptions);

  return res.redirect(`${frontendBaseUrl}/auth/login?social=${provider}`);
};

module.exports = {
  oauthCallback,
};
