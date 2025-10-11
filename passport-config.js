const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('./models'); // Adjust path
const path = require("path");
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
const AppleStrategy = require("passport-apple");
const fs = require("fs");
const jwt = require("jsonwebtoken");

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID || "com.virtuartai.web.login",
      teamID: process.env.APPLE_TEAM_ID || "NLF27X77L4",
      keyID: process.env.APPLE_KEY_ID || "3AKVR8445V",
      privateKeyString: fs.readFileSync(path.join(__dirname, "AuthKey_3AKVR8445V.p8")).toString(),
      callbackURL: process.env.APPLE_CALLBACK_URL || "https://virtuartai.com/auth/apple/callback",
      scope: ["name", "email"],
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      console.log("\n============================");
      console.log("🍎 [Apple Login Callback Triggered]");
      console.log("============================");
      console.log("accessToken:", !!accessToken);
      console.log("refreshToken:", !!refreshToken);

      // ✅ Decode Apple ID token to extract user info
      let decoded = {};
      try {
        decoded = jwt.decode(idToken) || {};
        console.log("🧩 Decoded Apple ID Token:", decoded);
      } catch (err) {
        console.error("❌ Failed to decode Apple ID token:", err);
      }

      const appleId = decoded.sub || profile?.id || null;
      const email = decoded.email || profile?.email || (profile?._json?.email) || null;

      console.log("📧 Extracted Email:", email);
      console.log("🆔 Apple Sub ID:", appleId);

      try {
        // 🧠 1. Find by Apple ID first (never collide with existing users)
        let user = appleId ? await User.findOne({ appleId }) : null;

        // 🧠 2. If not found and email exists, check if any user has same email
        if (!user && email) {
          user = await User.findOne({ email });
          if (user) {
            // Attach appleId for future logins
            user.appleId = appleId;
            await user.save();
            console.log("🔗 Linked existing user to Apple ID:", user.email);
          }
        }

        // 🧠 3. If still not found → Create a new user
        if (!user) {
          console.log("⚙️ Creating NEW Apple user in DB...");
          user = await User.create({
            fname: profile?.name?.firstName || "Apple",
            lname: profile?.name?.lastName || "User",
            email: email || `apple_${Date.now()}@appleuser.com`,
            appleId,
            password: "external",
            phone: "external",
            userType: "individual",
            no_of_images_left: 0,
            subscribed_monthly: false,
            subscribed_yearly: false,
            authProvider: "apple",
          });
          console.log("✅ New Apple user created:", user.email);
        } else {
          console.log("🔄 Existing Apple user found:", user.email);
        }

        console.log("🚀 Apple Auth Success for:", user.email);
        return done(null, user);
      } catch (err) {
        console.error("❌ Apple Auth Error:", err);
        return done(err, null);
      }
    }
  )
);
