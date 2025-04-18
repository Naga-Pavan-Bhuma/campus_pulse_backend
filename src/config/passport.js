const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models/User");
require("dotenv").config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists
                let user = await User.findOne({ email: profile.emails[0].value });
                if (!user) {
                    // Create new user
                    user = new User({
                        firstName: profile.name.givenName || "Google",
                        lastName: profile.name.familyName || "User",
                        email: profile.emails[0].value,
                        photoUrl: profile.photos[0].value,
                        password: "GoogleOAuth", // Placeholder, not used for Google accounts
                    });
                    await user.save();
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
    User.findById(id).then((user) => done(null, user))
);