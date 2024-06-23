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
            user: user,
            token: generateToken({ userId: user._id, role: user.role })
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
    if (!token) {
      throw createHttpError(401, '請先登入');
    }
    const payload = verifyToken(token);
    if (!payload) {
      throw createHttpError(403, '無訪問權限');
    }
    const user = await UsersModel.findById(req.user.userId);
      res.send({
          status: true,
          token,
          user,
          role: payload.role,
      });
  } catch (error) {
      res.status(401).send({ status: false, message: error.message });
  }
};
const getUser = async (req, res, next) => {
    try {
        const user = await UsersModel.findById(req.user.userId)
        .populate('courses');

        if (!user) {
            return res.status(404).send({
                status: false,
                message: '用戶未找到'
            });
        }

        res.send({
            status: true,
            result: user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        next(error);
    }
};
const updateInfo = handleErrorAsync(async (req, res, next) => {
  const { _id, name, email, role, phone, address, birthday, gender, photo, intro, facebook, instagram, discord } = req.body;

  if (name && !validator.isLength(name, { min: 2 })) {
      throw createHttpError(400, 'name 至少需要 2 個字元以上');
  }

  if (photo && !validator.isURL(photo, {
      protocols: ['http', 'https'],
      require_protocol: true
  })) {
      throw createHttpError(400, '大頭照的 URL 格式不正確');
  }


  const updatedUser = await UsersModel.findByIdAndUpdate(_id, {
    name,
    email,
    role,
    phone,
    address,
    birthday,
    gender,
    photo,
    intro,
    facebook,
    instagram,
    discord
}, { new: true, runValidators: true });

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const skip = (page - 1) * limit;
  
        const [users, totalItems] = await Promise.all([
            UsersModel.find({})
                      .select('-password')
                      .populate('courses')
                      .sort({ [sortBy]: sortOrder })
                      .limit(limit)
                      .skip(skip),
            UsersModel.countDocuments({})
        ]);
  
        const totalPages = Math.ceil(totalItems / limit);
  
        res.send({
            status: true,
            page,
            limit,
            totalPages,
            totalItems,
            sortBy,
            sortOrder,
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
const adminUpdateUserInfo = handleErrorAsync(async (req, res, next) => {
    const userId = req.body._id
    const allowedUpdates = ['name', 'email', 'role', 'phone', 'address', 'birthday', 'gender', 'photo', 'intro', 'facebook', 'instagram', 'discord']
    const updateData = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key) && req.body[key] !== undefined)
        .reduce((obj, key) => {
            obj[key] = req.body[key];
            return obj;
        }, {});

    // 驗證名稱
    if (updateData.name && !validator.isLength(updateData.name, { min: 2 })) {
        throw createHttpError(400, 'name 至少需要 2 個字元以上');
    }

    // 驗證電子郵件格式
    if (updateData.email && !validator.isEmail(updateData.email)) {
        throw createHttpError(400, 'Email 格式不正確');
    }

    // 驗證電話號碼格式
    if (updateData.phone && !validator.isMobilePhone(updateData.phone, 'any', { strictMode: false })) {
        throw createHttpError(400, '手機號碼格式不正確');
    }

    // 確認用戶是否有權限進行操作
    if (req.user.role !== 'admin' && req.user.role !== 'superuser') {
        throw createHttpError(403, '無權限執行此操作');
    }

    // 更新用戶信息
    const updatedUser = await UsersModel.findByIdAndUpdate(
        userId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedUser) {
        throw createHttpError(404, '用戶未找到');
    }

    res.send({
        status: true,
        data: updatedUser
    });
});
const adminDeleteUser = handleErrorAsync(async (req, res, next) => {
  const userId = req.params.id;

  if (req.user.role !== 'admin' && req.user.role !== 'superuser') {
      throw createHttpError(403, '無權限執行此操作');
  }

  const deletedUser = await UsersModel.findByIdAndDelete(userId);

  if (!deletedUser) {
      throw createHttpError(404, '用戶未找到');
  }

  res.send({
      status: true,
      data: deletedUser
  });
});
export {
    signup,
    login,
    forget,
    check,
    getUser,
    getUsers,
    updateInfo,
    updateRole,
    adminUpdateUserInfo,
    adminDeleteUser,
};
