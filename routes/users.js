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
import { checkRequestBodyValidator, isAuth } from '../middlewares/index.js';

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
router.get('/', isAuth, getUser);
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
router.put('/', isAuth, updateInfo);
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
router.put('update-role', isAuth, updateRole)
export default router;
