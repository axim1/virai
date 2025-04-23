const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('./models'); // Adjust path

passport.serializeUser((user, done) => {
  done(null, user.id); // serialize user by Mongo _id
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          fname: profile.name.givenName || "Google",
          lname: profile.name.familyName || "User",
          password: 'external', // Optional: you may leave it empty or mark as external login
          phone: 'external',
          no_of_images_left: 0,
          subscribed_monthly: false,
          subscribed_yearly: false,
          authProvider: 'google',
        });

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);
