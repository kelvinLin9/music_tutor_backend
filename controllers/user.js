import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import UsersModel from '../models/user.js'
import { generateToken, verifyToken } from '../utils/index.js';

const signup = async (req, res, next) => {
  console.log(req.body)
  try {
      const { email, password, confirmPassword, name } = req.body;
      
      if (!name) {
        throw createHttpError(400, '姓名為必填欄位');
      }
    
      if (password !== confirmPassword) {
          throw createHttpError(400, '兩次輸入的密碼不匹配');
      }

      // 檢查郵箱是否已經註冊
      const checkEmail = await UsersModel.findOne({ email });
      if (checkEmail) {
          throw createHttpError(400, '此 Email 已註冊');
      }

      // 密碼加密
      const hashedPassword = await bcrypt.hash(password, 6);

      // 創建用戶記錄
      const user = await UsersModel.create({
          name,
          email,
          password: hashedPassword
      });

      // 發送帶有 token 的響應
      res.send({
          status: true,
          token: generateToken({ userId: user._id })
      });
  } catch (error) {
      next(error);
  }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await UsersModel.findOne({ email }).select('+password');
        if (!user) {
            throw createHttpError(404, '此使用者不存在');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw createHttpError(400, '密碼錯誤');
        }

        res.send({
            status: true,
            token: generateToken({ userId: user._id })
        });
    } catch (error) {
        next(error);
    }
};

const forget = async (req, res, next) => {
    try {
        const { email, code, newPassword } = req.body;
        const user = await UsersModel.findOne({ email }).select('+verificationToken');
        if (!user) {
            throw createHttpError(404, '此使用者不存在');
        }

        const payload = verifyToken(user.verificationToken);
        if (payload.code !== code) {
            throw createHttpError(400, '驗證碼錯誤');
        }

        user.password = await bcrypt.hash(newPassword, 6);
        await user.save();

        res.send({ status: true });
    } catch (error) {
        next(error);
    }
};

const check = async (req, res) => {
  try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const payload = verifyToken(token);
      if (!token) {
          throw createHttpError(404, 'Token not found');
      }
      res.send({
          status: true,
          token
      });
  } catch (error) {
      res.status(500).send({ status: false, message: error.message });
  }
};


// const getUserInfo = async (req, res, next) => {
//     try {
//         // 檢查用戶是否登入且擁有管理者權限
//         const token = req.headers.authorization?.replace('Bearer ', '');
//         const payload = verifyToken(token);

//         if (!payload) {
//             throw createHttpError(403, '無訪問權限');
//         }

//         // 從數據庫提取所有用戶資訊
//         const users = await UsersModel.find({}).select('-password');  // 確保不返回密碼字段
//         res.send({
//             status: true,
//             users
//         });
//     } catch (error) {
//         next(error);
//     }
// };


const updateInfo = async (req, res, next) => {
    try {
        const { userId, name, phone, birthday, address } = req.body;

        const updateData = { name, phone, birthday, address };
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const updatedUser = await UsersModel.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        res.send({
            status: true,
            result: updatedUser
        });
    } catch (error) {
        next(error);
    }
};



// admin
const getUsers = async (req, res, next) => {
  try {
      // 檢查用戶是否登入且擁有管理者權限
      const token = req.headers.authorization?.replace('Bearer ', '');
      const payload = verifyToken(token);

      if (!payload) {
          throw createHttpError(403, '無訪問權限');
      }

      // 從數據庫提取所有用戶資訊
      const users = await UsersModel.find({}).select('-password');  // 確保不返回密碼字段
      res.send({
          status: true,
          users
      });
  } catch (error) {
      next(error);
  }
};

export {
    signup,
    login,
    forget,
    check,
    getUsers,
    updateInfo
};
