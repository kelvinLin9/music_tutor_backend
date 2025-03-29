import express from 'express';
import { auth } from '../middlewares/auth.js';
import Coupon from '../models/coupon.js';

const router = express.Router();

/**
 * @swagger
 * /api/coupons:
 *   get:
 *     tags:
 *       - 優惠券管理
 *     summary: 獲取優惠券列表
 *     description: 獲取所有可用的優惠券
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每頁數量
 *     responses:
 *       200:
 *         description: 成功獲取優惠券列表
 *       401:
 *         description: 未授權
 */
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const coupons = await Coupon.find({ isActive: true })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await Coupon.countDocuments({ isActive: true });
    res.json({
      coupons,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/coupons/{code}:
 *   get:
 *     tags:
 *       - 優惠券管理
 *     summary: 驗證優惠券
 *     description: 驗證優惠券是否可用
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: 優惠券代碼
 *     responses:
 *       200:
 *         description: 優惠券有效
 *       401:
 *         description: 未授權
 *       404:
 *         description: 優惠券不存在或已過期
 */
router.get('/:code', auth, async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      code: req.params.code,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });
    
    if (!coupon) {
      return res.status(404).json({ message: '優惠券不存在或已過期' });
    }
    
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/coupons:
 *   post:
 *     tags:
 *       - 優惠券管理
 *     summary: 創建優惠券
 *     description: 創建新的優惠券（僅管理員）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discount
 *               - expiryDate
 *             properties:
 *               code:
 *                 type: string
 *                 description: 優惠券代碼
 *               discount:
 *                 type: number
 *                 description: 折扣金額
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: 過期日期
 *               minAmount:
 *                 type: number
 *                 description: 最低消費金額
 *               usageLimit:
 *                 type: integer
 *                 description: 使用次數限制
 *     responses:
 *       201:
 *         description: 優惠券創建成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '權限不足' });
    }
    
    const coupon = new Coupon({
      ...req.body,
      isActive: true,
      usageCount: 0
    });
    
    const newCoupon = await coupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/coupons/{id}:
 *   put:
 *     tags:
 *       - 優惠券管理
 *     summary: 更新優惠券
 *     description: 更新優惠券信息（僅管理員）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 優惠券ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: 優惠券代碼
 *               discount:
 *                 type: number
 *                 description: 折扣金額
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: 過期日期
 *               minAmount:
 *                 type: number
 *                 description: 最低消費金額
 *               usageLimit:
 *                 type: integer
 *                 description: 使用次數限制
 *               isActive:
 *                 type: boolean
 *                 description: 是否啟用
 *     responses:
 *       200:
 *         description: 優惠券更新成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 優惠券不存在
 */
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '權限不足' });
    }
    
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: '找不到該優惠券' });
    }
    
    Object.assign(coupon, req.body);
    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/coupons/{id}:
 *   delete:
 *     tags:
 *       - 優惠券管理
 *     summary: 刪除優惠券
 *     description: 刪除優惠券（僅管理員）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 優惠券ID
 *     responses:
 *       200:
 *         description: 優惠券刪除成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 優惠券不存在
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '權限不足' });
    }
    
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: '找不到該優惠券' });
    }
    
    await coupon.remove();
    res.json({ message: '優惠券已刪除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;