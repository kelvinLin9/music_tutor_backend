import createHttpError from 'http-errors';
import validator from 'validator';
import { verifyToken } from '../utils/index.js';

// token 驗證
export const isAuth = async (req, res, next) => {
  try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const decoded = verifyToken(token); // 假設 verifyToken 返回解碼的 token
      req.user = decoded; // 將解碼的 token 信息存儲在 req.user 中以便後續使用
      next();
  } catch (error) {
      next(createHttpError(401, '認證失敗：無效的 Token')); // 提供更明確的錯誤信息
  }
};

// 實作管理員權限（這部分需要後續完善）
export const isAdmin = async (req, res, next) => {
  isAuth(req, res, async (err) => {
      if (err) {
          return next(err); // 如果認證中間件遇到錯誤，直接將錯誤傳遞下去
      }

      try {
          // 檢查 req.user 中是否有角色資訊並且角色是否為 'admin'
          if (req.user.role !== 'admin') {
              throw createHttpError(403, '授權失敗：您不具備管理員權限');
          }
          next();
      } catch (error) {
          next(error);
      }
  });
};

export const checkRequestBodyValidator = (req, _res, next) => {
    try {
        for (let [key, value] of Object.entries(req.body)) {
            if (value === undefined || value === null) {
                throw new Error('欄位未填寫正確');
            }

            const _value = `${value}`;

            switch (key) {
                case 'name':
                    if (!validator.isLength(_value, { min: 2 })) {
                        throw new Error('name 至少 2 個字元以上');
                    }
                    break;
                case 'email':
                    if (!validator.isEmail(_value)) {
                        throw new Error('Email 格式不正確');
                    }
                    break;
                case 'password':
                case 'newPassword':
                    if (!validator.isLength(_value, { min: 8 })) {
                        throw new Error('密碼需至少 8 碼以上');
                    }
                    if (validator.isAlpha(_value)) {
                        throw new Error('密碼不能只有英文');
                    }
                    if (validator.isNumeric(_value)) {
                        throw new Error('密碼不能只有數字');
                    }
                    if (!validator.isAlphanumeric(_value)) {
                        throw new Error('密碼需至少 8 碼以上，並英數混合');
                    }
                    break;
                case 'image':
                    if (!validator.isURL(_value, { protocols: ['https'] })) {
                        throw new Error('image 格式不正確');
                    }
                    break;
                default:
                    break;
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};
