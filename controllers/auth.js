import UsersModel from '../models/user.js'
import { generateToken } from '../utils/index.js';
import { handleErrorAsync } from '../statusHandle/handleErrorAsync.js';

// const googleLogin = handleErrorAsync(async (req, res, next) => {
//   console.log("googleLogin")
//   // console.log('req', req.query.callback);
//   console.log('req', req.query.state);
//   const token = generateToken({ userId: req.user.user._id, role: req.user.user.role })
//   // res.send({
//   //   status: true,
//   //   user: req.user,
//   //   token: token
//   // });
//   res.redirect(`${req.query.state}?token=${token}`);
// });

const googleLogin = handleErrorAsync(async (req, res, next) => {
  console.log("googleLogin");
  console.log('用戶資料:', req.user);
  console.log('重定向目標:', req.query.state || '未指定');
  
  // 檢查必要的用戶數據
  if (!req.user || !req.user.user || !req.user.user._id) {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid user data' }
    });
  }
  
  // 生成 token，包含用戶 ID 和角色
  const token = generateToken({ 
    userId: req.user.user._id, 
    role: req.user.user.role 
  });
  
  // 準備返回的用戶資料
  const userData = {
    _id: req.user.user._id,
    name: req.user.user.name,
    email: req.user.user.email,
    photo: req.user.user.photo,
    role: req.user.user.role
  };
  
  // 如果是 POST 請求 (直接從前端發來的)
  if (req.method === 'POST') {
    return res.json({
      success: true,
      user: userData,
      token: token
    });
  }
  
  // 如果是 GET 請求 (來自 Google 重定向)
  const redirectUrl = req.query.state || process.env.FRONTEND_URL || 'http://localhost:3010';
  res.redirect(`${redirectUrl}?token=${token}`);
});


export {
  googleLogin,
};