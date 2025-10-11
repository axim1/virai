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



/**
 * Helper: build signed JWT (client_secret) for Apple token exchange
 */
function generateClientSecret() {
  try {
    const privateKey = fs.readFileSync(
      path.join(__dirname, "AuthKey_3AKVR8445V.p8")
    );
    const payload = {
      iss: process.env.APPLE_TEAM_ID || "NLF27X77L4",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 180, // 180 days
      aud: "https://appleid.apple.com",
      sub: process.env.APPLE_CLIENT_ID || "com.virtuartai.web.login",
    };
    const token = jwt.sign(payload, privateKey, {
      algorithm: "ES256",
      keyid: process.env.APPLE_KEY_ID || "3AKVR8445V",
    });
    console.log("✅ [generateClientSecret] Successfully created JWT");
    return token;
  } catch (err) {
    console.error("❌ [generateClientSecret] Failed to create JWT:", err);
    return null;
  }
}

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID || "com.virtuartai.web.login",
      teamID: process.env.APPLE_TEAM_ID || "NLF27X77L4",
      keyID: process.env.APPLE_KEY_ID || "3AKVR8445V",
      privateKeyString: fs
        .readFileSync(path.join(__dirname, "AuthKey_3AKVR8445V.p8"))
        .toString(),
      callbackURL:
        process.env.APPLE_CALLBACK_URL ||
        "https://virtuartai.com/auth/apple/callback",
      scope: ["name", "email"],
      passReqToCallback: true,
    },

    async (req, accessToken, refreshToken, idToken, profile, done) => {
      console.log("\n============================");
      console.log("🍎 [Apple Login Callback Triggered]");
      console.log("============================");
      console.log("accessToken:", !!accessToken);
      console.log("refreshToken:", !!refreshToken);
      console.log("profile:", profile);
      console.log("Raw idToken length:", idToken ? idToken.length : "❌ none");

      let decoded = {};
      try {
        // 1️⃣ Try to decode existing idToken
        if (idToken && idToken.split(".").length === 3) {
          decoded = JSON.parse(
            Buffer.from(idToken.split(".")[1], "base64").toString("utf8")
          );
          console.log("🧩 Decoded Apple ID Token (direct):", decoded);
        } else {
          console.log("⚠️ idToken missing, attempting manual token exchange...");
          if (req?.body?.code) {
            console.log("🔄 Exchanging code manually for tokens...");
            const form = new URLSearchParams({
              grant_type: "authorization_code",
              code: req.body.code,
              client_id: process.env.APPLE_CLIENT_ID || "com.virtuartai.web.login",
              client_secret: generateClientSecret(),
            });

            const tokenResp = await axios.post(
              "https://appleid.apple.com/auth/token",
              form,
              { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            console.log("📥 Apple token response:", tokenResp.data);

            if (tokenResp.data.id_token) {
              idToken = tokenResp.data.id_token;
              decoded = JSON.parse(
                Buffer.from(idToken.split(".")[1], "base64").toString("utf8")
              );
              console.log("🧩 Decoded Apple ID Token (manual):", decoded);
            } else {
              console.error("❌ No id_token returned from manual exchange!");
            }
          } else {
            console.error("❌ No code available in req.body for manual exchange.");
          }
        }
      } catch (err) {
        console.error("❌ [Decode Error]:", err);
      }

      const appleId = decoded.sub || profile?.id || null;
      const email =
        decoded.email ||
        profile?.email ||
        profile?._json?.email ||
        (appleId ? `appleuser_${appleId}@appleuser.com` : null);

      console.log("📧 Extracted Email:", email);
      console.log("🆔 Apple Sub ID:", appleId);

      try {
        // 🔎 Find or create user
        let user = appleId ? await User.findOne({ appleId }) : null;
        if (!user && email) {
          user = await User.findOne({ email });
          if (user) {
            user.appleId = appleId;
            user.authProvider = "apple";
            await user.save();
            console.log("🔗 Linked existing user to Apple ID:", user.email);
          }
        }

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
        console.error("❌ [Apple Auth Error]:", err);
        console.error("Stack:", err.stack);
        return done(err, null);
      }
    }
  )
);
