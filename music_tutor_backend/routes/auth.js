const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Google OAuth 策略配置
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 查找或創建用戶
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (!user) {
        user = await User.create({
          email: profile.emails[0].value,
          name: profile.displayName,
          googleId: profile.id,
          role: 'user'
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// 獲取 Google 登入 URL
router.get('/google/url', (req, res) => {
  const url = passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state: req.query.redirect || '/'
  })(req, res, () => {});
  res.json({ url });
});

// Google 登入路由
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google 回調路由
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // 生成 JWT token
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 重定向到前端並帶上 token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router; 