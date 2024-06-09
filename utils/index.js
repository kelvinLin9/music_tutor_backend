import createHttpError from 'http-errors';
import jsonWebToken from 'jsonwebtoken';

export const generateToken = (user) => {
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_DAY) {
      throw new Error("Required JWT environment variables are not set.");
  }

  // 生成 payload，包括用戶 ID 和角色
  const payload = {
      fq:'fqqqq',      
      userId: user._id,
      role: user.role  // 假設 user 對象中有 role 屬性
  };

  // 簽名 token
  return jsonWebToken.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_DAY
  });
};

export const verifyToken = (token) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is not set.");
    }
    try {
        return jsonWebToken.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw createHttpError(403, '請重新登入');
    }
};

export const generateEmailToken = () => {
    const code = generateRandomCode();
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is not set.");
    }
    const token = jsonWebToken.sign({ code }, process.env.JWT_SECRET, {
        expiresIn: 3600 // 1 hour
    });

    return { code, token };
};

const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
};
