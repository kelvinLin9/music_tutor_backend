import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import validator from 'validator';
import UsersModel from '../models/user.js'
import { generateToken, verifyToken } from '../utils/index.js';
import { handleErrorAsync} from '../statusHandle/handleErrorAsync.js';


const signup = handleErrorAsync(async (req, res, next) => {
  const { email, password, confirmPassword, name, role = 'user' } = req.body;

  if (!name) {
      throw createHttpError(400, '姓名為必填欄位');
  }
  if (password !== confirmPassword) {
      throw createHttpError(400, '兩次輸入的密碼不匹配');
  }

  const checkEmail = await UsersModel.findOne({ email });
  if (checkEmail) {
      throw createHttpError(400, '此 Email 已註冊');
  }

  const hashedPassword = await bcrypt.hash(password, 6);

  const user = await UsersModel.create({
      name,
      email,
      password: hashedPassword,
      role
  });

  res.send({
      status: true,
      token: generateToken({ userId: user._id, role: user.role })
  });
});



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


const updateInfo = handleErrorAsync(async (req, res, next) => {
  const { name, photo } = req.body;

  const userId = req.user.userId;
  // const updateData = { name, photo };
  
  // 移除未定義的字段
  // Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  if (name && !validator.isLength(name, { min: 2 })) {
      throw createHttpError(400, 'name 至少需要 2 個字元以上');
  }

  // if (photo && !validator.isURL(photo, {
  //     protocols: ['http', 'https'],
  //     require_protocol: true
  // })) {
  //     throw createHttpError(400, '大頭照的 URL 格式不正確');
  // }

  // if (sex && !['male', 'female'].includes(sex)) {
  //     throw createHttpError(400, '性別格式不正確');
  // }

  const updatedUser = await UsersModel.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true
      }
  );

  if (!updatedUser) {
      return res.status(404).send({
          status: false,
          message: '找不到用戶'
      });
  }

  res.send({
      status: true,
      result: updatedUser
  });
});



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

const updateRole = handleErrorAsync(async (req, res, next) => {
  // 從請求中獲取新的角色信息
  const { newRole } = req.body;

  // 更新數據庫中的用戶角色
  await UsersModel.updateOne({ _id: req.user.userId }, { role: newRole });

  // 生成新的 token
  const newUserDetails = await UsersModel.findByIdAndUpdate(req.user.userId, { role: newRole }, { new: true });
  if (!newUserDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
  }
  const newToken = generateToken({ userId: newUserDetails._id, role: newUserDetails.role });
  

  // 返回新的 token
  res.json({ success: true, token: newToken });

})

export {
    signup,
    login,
    forget,
    check,
    getUsers,
    updateInfo,
    updateRole,
};
