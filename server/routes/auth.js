const express = require('express');
const passport = require('passport');
const router = express.Router();
const { generateToken, requireAuth } = require('../middleware/auth');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Redirect user to GitHub for OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'read:user', 'repo'] }));

// GitHub OAuth callback
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: `${CLIENT_URL}/?auth_error=true`, session: false }),
  (req, res) => {
    try {
      // User is authenticated, generate JWT
      const token = generateToken(req.user);
      
      // Redirect back to frontend callback route with token
      res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('OAuth Callback JWT generation error:', error);
      res.redirect(`${CLIENT_URL}/?auth_error=server`);
    }
  }
);

// Get current user profile (requires valid JWT)
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: req.user
  });
});

// Logout endpoint (client will also clear token in localStorage)
router.get('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
