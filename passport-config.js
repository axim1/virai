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

const AppleStrategy = require("passport-apple");
const fs = require("fs");
const path = require("path");

passport.use(
  new AppleStrategy(
    {
      clientID: "com.virtuartai.web.login", // ✅ Your Services ID
      teamID: "NLF27X77L4",                // ✅ Your Apple Team ID
      keyID: "3AKVR8445V",                 // ✅ Your 10-character Key ID
      privateKeyString: fs.readFileSync(path.join(__dirname, "AuthKey_3AKVR8445V.p8")).toString(),
      callbackURL: "https://virtuartai.com/auth/apple/callback",
      scope: ["name", "email"],
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      console.log("\n============================");
      console.log("🍎 [Apple Login Callback Triggered]");
      console.log("============================");
      console.log("accessToken:", accessToken ? "✅ present" : "❌ missing");
      console.log("refreshToken:", refreshToken ? "✅ present" : "❌ missing");
      console.log("idToken object type:", typeof idToken);
      console.log("Profile received from Apple:", JSON.stringify(profile, null, 2));
      console.log("============================");

      try {
        // Try to extract email safely
        const email =
          profile.email ||
          (idToken && idToken.email) ||
          `appleuser_${profile.id}@appleuser.com`; // fallback dummy email

        console.log("📧 Extracted Email:", email);
        console.log("🧩 Apple Profile ID:", profile.id);

        // Find user by email or appleId
        let user = await User.findOne({ $or: [{ email }, { appleId: profile.id }] });

        if (!user) {
          console.log("⚙️ Creating NEW Apple user in database...");
          user = await User.create({
            fname: profile.name?.firstName || "Apple",
            lname: profile.name?.lastName || "User",
            email,
            password: "external",
            phone: "external",
            userType: "individual",
            no_of_images_left: 0,
            appleId: profile.id,
            authProvider: "apple",
          });
          console.log("✅ New Apple user created:", user._id.toString());
        } else {
          console.log("🔄 Existing Apple user found:", user._id.toString());
        }

        console.log("🚀 Apple Auth Success for user:", user.email);
        console.log("============================\n");
        return done(null, user);
      } catch (err) {
        console.error("❌ Apple Auth Error:", err);
        console.error("Full Stack Trace:", err.stack);
        console.log("============================\n");
        return done(err, null);
      }
    }
  )
);

const AppleStrategy = require("passport-apple");
const fs = require("fs");

passport.use(new AppleStrategy({
  clientID: "com.virtuartai.web.login", // Your Services ID
  teamID: "NLF27X77L4",           // Your Team ID
  keyID: "3AKVR8445V",           // 10-char Key ID from Apple
  privateKeyString: fs.readFileSync(require('path').join(__dirname, 'AuthKey_3AKVR8445V.p8')).toString(),
  callbackURL: "https://virtuartai.com/auth/apple/callback",
  scope: ["name", "email"]
},
async (accessToken, refreshToken, idToken, profile, done) => {
  try {
    const email = profile.email || (idToken && idToken.email);
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fname: profile.name?.firstName || "Apple",
        lname: profile.name?.lastName || "User",
        email,
        password: "", // Not used for social login
        phone: "",
        userType: "individual",
        no_of_images_left: 0,
        appleId: profile.id,
        authProvider: "apple"
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

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

