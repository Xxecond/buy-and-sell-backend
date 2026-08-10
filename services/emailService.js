const { Resend } = require("resend");
const env = require('../config/env');

let resend;

function getResend() {
  if (resend) return resend;

  if (!env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY in .env");
  }

  resend = new Resend(env.RESEND_API_KEY);

  return resend;
}

const getVerificationBaseUrl = () => env.BACKEND_URL;

const buildVerificationLink = (verificationToken) =>
  `${getVerificationBaseUrl()}/api/users/verify?token=${verificationToken}`;

const sendVerificationEmail = async (toEmail, verificationToken) => {
  const verificationLink = buildVerificationLink(verificationToken);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
      <h2>Verify your email</h2>

      <p>Welcome to Buy & Sell!</p>

      <p>Please click the button below to verify your email address.</p>

      <div style="margin:30px 0;">
        <a
          href="${verificationLink}"
          style="
            background:#16a34a;
            color:white;
            padding:14px 22px;
            text-decoration:none;
            border-radius:8px;
            font-weight:bold;
            display:inline-block;
          "
        >
          Verify Email
        </a>
      </div>

      <p>This link expires in 30 minutes.</p>

      <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;

  const resend = getResend();

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: toEmail,
    subject: "Verify your email",
    html,
  });
};

module.exports = {
  sendVerificationEmail,
  buildVerificationLink,
};
