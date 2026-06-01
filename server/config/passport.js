const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'dummy_client_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_client_secret',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
    scope: ['user:email', 'read:user', 'repo'],
    customHeaders: { 'User-Agent': 'SkillForge-App' }
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
      const avatarUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '';
      const bio = profile._json ? profile._json.bio : '';
      const publicRepos = profile._json ? profile._json.public_repos : 0;
      const followers = profile._json ? profile._json.followers : 0;
      const following = profile._json ? profile._json.following : 0;
      const location = profile._json ? profile._json.location : '';
      const company = profile._json ? profile._json.company : '';

      const userData = {
        githubId: profile.id,
        githubAccessToken: accessToken,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        avatarUrl,
        email,
        profileUrl: profile.profileUrl,
        bio,
        publicRepos,
        followers,
        following,
        location,
        company
      };

      // Find and update or create user
      let user = await User.findOneAndUpdate(
        { githubId: profile.id },
        userData,
        { new: true, upsert: true }
      );

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// We are using JWT, but Passport still requires serialize/deserialize setup
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
