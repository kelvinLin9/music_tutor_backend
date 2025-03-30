import { Router } from 'express';
import { 
  login, 
  signup,
  forget,
  check,
  getUser,
  updateInfo,
  updateRole,
} from '../controllers/user.js';
import { googleLogin } from '../controllers/auth.js';
import { checkRequestBodyValidator, isAuth } from '../middlewares/index.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
dotenv.config();
import UsersModel from '../models/user.js'
import { handleErrorAsync } from '../statusHandle/handleErrorAsync.js';

// google
// const callbackURL = process.env.NODE_ENV === 'production'
//   // ? 'https://kelvinlin9.github.io/music_tutor_dashboard/google/callback'
//   ? 'https://kelvinlin9.github.io/LeLe_Music_Tutor/google/callback'
//   // ? 'http://localhost:3010/music_tutor_dashboard/google/callback'
//   : 'http://localhost:3000/users/google/callback';
//   // : 'http://localhost:3000/users/googleClient/callback';

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: callbackURL
// },
// async function(accessToken, refreshToken, profile, cb) {
//   console.log("測試")
//   console.log(profile)
//   try {
//     let user = await UsersModel.findOne({ googleId: profile.id });
//     if (!user) {
//       user = await UsersModel.create({
//         googleId: profile.id,
//         name: profile.displayName,
//         email: profile.emails[0].value,
//         photo: profile.photos[0].value,
//         role: 'user'
//       });
//     }
//     console.log('user', user);
//     return cb(null, user);
//   } catch (err) {
//     return cb(err);
//   }
// }
// ));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://kelvinlin9.github.io/music_tutor_dashboard/api/users/google/callback',
  passReqToCallback: true
},
async function(req, accessToken, refreshToken, profile, done) {
  console.log("測試")
  console.log("profile", profile)
  try {
    // 先尋找是否有使用 Google 登入的用戶
    let user = await UsersModel.findOne({ 
      'oauthProviders.provider': 'google',
      'oauthProviders.providerId': profile.id 
    });

    if (!user) {
      // 如果沒有找到，則尋找是否有相同 email 的用戶
      user = await UsersModel.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // 如果找到相同 email 的用戶，添加 Google OAuth 資訊
        await user.addOAuthProvider(
          'google',
          profile.id,
          accessToken,
          refreshToken,
          new Date(Date.now() + 3600000) // 1小時後過期
        );
        await user.save();
      } else {
        // 如果都沒有找到，創建新用戶
        user = await UsersModel.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0].value,
          role: 'user'
        });
        
        await user.addOAuthProvider(
          'google',
          profile.id,
          accessToken,
          refreshToken,
          new Date(Date.now() + 3600000) // 1小時後過期
        );
        await user.save();
      }
    } else {
      // 如果找到用戶，更新 OAuth 資訊
      await user.addOAuthProvider(
        'google',
        profile.id,
        accessToken,
        refreshToken,
        new Date(Date.now() + 3600000) // 1小時後過期
      );
      await user.save();
    }

    console.log('user', user);
    const frontendCallback = req.query.state;
    console.log('frontendCallback', frontendCallback)
    return done(null, { user, frontendCallback });
  } catch (err) {
    return done(err);
  }
}));


const router = Router();

router.use(checkRequestBodyValidator);

// 登入
router.post('/login', handleErrorAsync(login));
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags:
 *       - 用戶管理
 *     summary: 用戶登入
 *     description: 用戶登入系統
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 電子郵件
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密碼
 *     responses:
 *       200:
 *         description: 登入成功
 *       401:
 *         description: 認證失敗
 */

// 註冊
router.post('/signup', handleErrorAsync(signup));
/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     tags:
 *       - 用戶管理
 *     summary: 用戶註冊
 *     description: 創建新用戶帳號
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: 用戶名稱
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 電子郵件
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密碼
 *     responses:
 *       201:
 *         description: 註冊成功
 *       400:
 *         description: 請求格式錯誤
 */

// 忘記密碼
router.post('/forgot', forget);
/**
 * #swagger.description = "忘記密碼"
 * #swagger.parameters['body'] = {
 *     in: 'body',
 *     required: true,
 *     schema: {
 *         email: "timmothy.ramos@example.com",
 *         code: "0Zvjde",
 *         newPassword: "Dirt5528295",
 *     }
 * }
 * #swagger.responses[200] = {
 *     schema: {
 *         "status": true,
 *     }
 * }
 * #swagger.responses[404] = {
 *     schema: {
 *         "status": false,
 *         "message": "此使用者不存在",
 *     }
 * }
 */

// 檢查是否登入
router.get('/check', isAuth, check);
/**
 * #swagger.description = "檢查是否登入"
 * #swagger.responses[200] = {
 *     description: '已登入',
 *     schema: {
 *         "status": true,
 *         "token": "eyJhbGciOiJI....",
 *     }
 * }
 */

// 取得使用者資訊
router.get('/profile', isAuth, handleErrorAsync(getUser));
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags:
 *       - 用戶管理
 *     summary: 獲取用戶資料
 *     description: 獲取當前登入用戶的資料
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取用戶資料
 *       401:
 *         description: 未授權
 */

// 更新使用者資訊
router.put('/profile', isAuth, checkRequestBodyValidator, handleErrorAsync(updateInfo));
/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags:
 *       - 用戶管理
 *     summary: 更新用戶資料
 *     description: 更新當前登入用戶的資料
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 用戶名稱
 *               phone:
 *                 type: string
 *                 description: 電話號碼
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: 生日
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未授權
 */
router.put('/update-role', isAuth, updateRole)

// Google 登入路由
router.get('/google', (req, res, next) => {
  const { callback } = req.query;
  console.log('Callback URL:', callback);
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    state: callback // 使用 state 參數傳遞 callback URL
  })(req, res, next);
});

// Google 回調路由
router.get('/google/callback', 
  passport.authenticate('google', { session: false }), 
  googleLogin
);

// router.post('/googleClient/callback', passport.authenticate('google', { session: false }), googleLogin)

router.post('/googleClient/callback', (req, res, next) => {
  // 從請求體獲取授權碼
  const { code } = req.body;
  console.log('code', code);
  if (!code) {
    return res.status(400).json({
      success: false, 
      error: { message: 'Missing auth code' }
    });
  }
  
  // 將授權碼放入 req.query 中以便 passport-google-oauth20 能使用它
  req.query = { ...req.query, code };
  
  next();
}, passport.authenticate('google', { session: false }), googleLogin);



// router.post('/googleClient/callback', 
//   passport.authenticate('google', { session: false, failureRedirect: '/login' }),
//   googleLogin,
//   // (req, res) => {
//   //   const { user, frontendCallback } = req.user;
//   //   // 生成 JWT token
//   //   const token = generateToken(user); // 假設你有一個生成 token 的函數
    
//   //   // 重定向到前端 URL，並帶上 token
//   //   res.redirect(`${frontendCallback}?token=${token}`);
//   // }
// );

export default router;


// res.send({
//   status: true,
//   data: {
//     id: req.user.id,
//     name: req.user.displayName
//   }
// });