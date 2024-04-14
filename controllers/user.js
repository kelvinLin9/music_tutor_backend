import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import UsersModel from '../models/user.js'
import { generateToken, verifyToken } from '../utils/index.js';

const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const checkEmail = await UsersModel.findOne({ email });
        if (checkEmail) {
            throw createHttpError(400, '此 Email 已註冊');
        }

        const hashedPassword = await bcrypt.hash(password, 6);
        const user = await UsersModel.create({
            email,
            password: hashedPassword
        });

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
    const token = req.headers.authorization?.replace('Bearer ', '');
    res.send({
        status: true,
        token
    });
};

const getInfo = async (req, res) => {
    res.send({
        status: true,
        result: req.user
    });
};

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

export {
    signup,
    login,
    forget,
    check,
    getInfo,
    updateInfo
};
