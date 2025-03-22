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
  // callbackURL: "https://music-tutor-backend.onrender.com/users/google/callback", // 使用固定的後端回調 URL
  callbackURL: "https://music-tutor-backend.onrender.com/users/google/callback", // 使用固定的後端回調 URL
  passReqToCallback: true
},
async function(req, accessToken, refreshToken, profile, done) {
  console.log("測試")
  console.log(profile)
  try {
    let user = await UsersModel.findOne({ googleId: profile.id });
    if (!user) {
      user = await UsersModel.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos[0].value,
        role: 'user'
      });
    }
    console.log('user', user);
    // 從 state 參數中獲取前端回調 URL
    const frontendCallback = req.query.callback;
    console.log('frontendCallback', frontendCallback)
    return done(null, { user, frontendCallback });
  } catch (err) {
    return done(err);
  }
}
));


const router = Router();

router.use(checkRequestBodyValidator);

// 登入
router.post('/login', login);
/**
 * #swagger.description = "登入"
 * #swagger.parameters['body'] = {
 *     in: 'body',
 *     required: true,
 *     schema: {
 *         email: "timmothy.ramos@example.com",
 *         password: "Dirt5528295",
 *     }
 * }
 * #swagger.responses[200] = {
 *     description: '登入成功',
 *     schema: {
 *         "status": true,
 *         "token": "eyJhbGciOiJI....",
 *         "user": {
 *             "_id": "6533f0ef4cdf5b7f762747b0",
 *             "email": "timmothy.ramos@example.com",
 *         }
 *     }
 * }
 * #swagger.responses[400] = {
 *     description: '登入失敗，密碼錯誤',
 *     schema: {
 *         "status": false,
 *         "message": "密碼錯誤",
 *     }
 * }
 * #swagger.responses[404] = {
 *     schema: {
 *         "status": false,
 *         "message": "此使用者不存在",
 *     }
 * }
 */

// 註冊
router.post('/signup', signup);
/**
 * #swagger.description = "註冊"
 * #swagger.parameters['body'] = {
 *     in: 'body',
 *     required: true,
 *     schema: {
 *         email: "lori.murphy@example.com",
 *         password: "YourPassword",
 *     }
 * }
 * #swagger.responses[200] = {
 *     description: '註冊成功',
 *     schema: {
 *         "status": true,
 *         "token": "eyJhbGciOiJI....",
 *         "user": {
 *             "_id": "6533f0ef4cdf5b7f762747b0",
 *             "email": "lori.murphy@example.com",
 *         }
 *     }
 * }
 * #swagger.responses[400] = {
 *     description: '註冊失敗，Email已被註冊',
 *     schema: {
 *         "status": false,
 *         "message": "此 Email 已註冊",
 *     }
 * }
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
router.get('/profile', isAuth, getUser);
/**
 * #swagger.description = "取得使用者資訊"
 * #swagger.responses[200] = {
 *     schema: {
 *         "status": true,
 *         "user": {
 *             "_id": "6533f0ef4cdf5b7f762747b0",
 *             "email": "timmothy.ramos@example.com",
 *             "name": "Lori Murphy",
 *             "phone": "(663) 742-3828",
 *             "birthday": "1982-02-03T16:00:00.000Z",
 *         }
 *     }
 * }
 */

// 更新使用者資訊
router.put('/profile', isAuth, updateInfo);
/**
 * #swagger.description = "更新使用者資訊"
 * #swagger.parameters['body'] = {
 *     in: 'body',
 *     required: true,
 *     schema: {
 *         userId: "6523e9fc3a22dd8d8207ef80",
 *         name: "Kylie Stanley",
 *         phone: "(937) 233-2482",
 *         birthday: "1948/6/5",
 *         address: {
 *             detail: "文山路23號",
 *         },
 *         oldPassword: "舊密碼",
 *         newPassword: "新密碼",
 *     }
 * }
 * #swagger.responses[400] = {
 *     schema: {
 *         "status": false,
 *         "message": "密碼錯誤",
 *     }
 * }
 * #swagger.responses[404] = {
 *     schema: {
 *         "status": false,
 *         "message": "此使用者不存在",
 *     }
 * }
 */
router.put('/update-role', isAuth, updateRole)

// google
// router.get('/google', passport.authenticate('google', {
//   scope: [ 'email', 'profile' ],
// }));

router.get('/google', (req, res, next) => {
  const { callback } = req.query;
  console.log('???', callback)
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    state: callback // 使用 state 參數傳遞 callback URL
  })(req, res, next);
});


router.get('/google/callback', passport.authenticate('google', { session: false }), googleLogin)

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