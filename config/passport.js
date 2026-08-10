const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = require("./db");
const env = require("./env");

const getBackendUrl = () => env.BACKEND_URL;

const buildCallbackUrl = (provider) =>
  `${getBackendUrl()}/api/auth/${provider}/callback`;

const getEmailFromProfile = (profile) =>
  profile.emails?.[0]?.value?.toLowerCase();

const findOrCreateSocialUser = async (profile) => {
  const email = getEmailFromProfile(profile);

  if (!email) {
    throw new Error("Unable to retrieve email from social provider.");
  }

  let user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user = await prisma.user.create({
      data: {
        name: profile.displayName || profile.username || email.split("@")[0],
        email,
        password: hashedPassword,
        isVerified: true,
        avatar: profile.photos?.[0]?.value,
      },
    });
  } else if (!user.isVerified) {
    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
      },
    });
  }

  return user;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: buildCallbackUrl("google"),
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await findOrCreateSocialUser(profile);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

passport.use(
  new FacebookStrategy(
    {
      clientID: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      callbackURL: buildCallbackUrl("facebook"),
      profileFields: ["id", "emails", "name", "displayName", "photos"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await findOrCreateSocialUser(profile);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: env.TWITTER_CONSUMER_KEY,
      consumerSecret: env.TWITTER_CONSUMER_SECRET,
      callbackURL: buildCallbackUrl("twitter"),
      includeEmail: true,
    },
    async (_token, _tokenSecret, profile, done) => {
      try {
        const user = await findOrCreateSocialUser(profile);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

module.exports = passport;
