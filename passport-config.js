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


// const AppleStrategy = require('passport-apple');
// const fs = require('fs');
// const path = require('path');

// passport.use(new AppleStrategy({
//   clientID: process.env.APPLE_CLIENT_ID,
//   teamID: process.env.APPLE_TEAM_ID,
//   keyID: process.env.APPLE_KEY_ID,
//   privateKeyString: fs.readFileSync(path.join(__dirname, './AuthKey.p8')).toString(),
//   callbackURL: `${process.env.BACKEND_URL}/auth/apple/callback`,
//   passReqToCallback: false,
//   scope: ['name', 'email'],
// }, async (accessToken, refreshToken, idToken, profile, done) => {
//   try {
//     const { sub: appleId, email } = idToken;

//     const existingUser = await User.findOne({ appleId });

//     if (existingUser) return done(null, existingUser);

//     const newUser = await User.create({
//       appleId,
//       email: email || 'anonymous@apple.com',
//       fname: 'Apple',
//       lname: 'User',
//       password: 'external',
//       phone: 'external',
//       no_of_images_left: 0,
//       subscribed_monthly: false,
//       subscribed_yearly: false,
//       authProvider: 'apple',
//     });

//     return done(null, newUser);
//   } catch (err) {
//     return done(err);
//   }
// }));

