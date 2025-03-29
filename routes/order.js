import express from 'express';
import { auth } from '../middlewares/auth.js';
import Order from '../models/order.js';
import Cart from '../models/cart.js';

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags:
 *       - 訂單管理
 *     summary: 獲取訂單列表
 *     description: 獲取用戶的訂單列表，支持分頁和狀態篩選
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, completed, cancelled]
 *         description: 訂單狀態
 *     responses:
 *       200:
 *         description: 成功獲取訂單列表
 *       401:
 *         description: 未授權
 */
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    
    const orders = await Order.find(query)
      .populate('items.course')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await Order.countDocuments(query);
    res.json({
      orders,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags:
 *       - 訂單管理
 *     summary: 獲取訂單詳情
 *     description: 根據ID獲取訂單詳情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 訂單ID
 *     responses:
 *       200:
 *         description: 成功獲取訂單詳情
 *       401:
 *         description: 未授權
 *       404:
 *         description: 訂單不存在
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.course');
    if (!order) {
      return res.status(404).json({ message: '找不到該訂單' });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '沒有權限查看此訂單' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags:
 *       - 訂單管理
 *     summary: 創建訂單
 *     description: 從購物車創建新訂單
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, line_pay]
 *                 description: 支付方式
 *               couponCode:
 *                 type: string
 *                 description: 優惠券代碼
 *     responses:
 *       201:
 *         description: 訂單創建成功
 *       401:
 *         description: 未授權
 *       400:
 *         description: 購物車為空或請求格式錯誤
 */
router.post('/', auth, async (req, res) => {
  try {
    const { paymentMethod, couponCode } = req.body;
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.course');
      
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: '購物車為空' });
    }
    
    const order = new Order({
      user: req.user._id,
      items: cart.items,
      totalAmount: cart.items.reduce((sum, item) => sum + item.course.price, 0),
      paymentMethod,
      couponCode,
      status: 'pending'
    });
    
    const newOrder = await order.save();
    
    // 清空購物車
    cart.items = [];
    await cart.save();
    
    await newOrder.populate('items.course');
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   post:
 *     tags:
 *       - 訂單管理
 *     summary: 取消訂單
 *     description: 取消指定訂單
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 訂單ID
 *     responses:
 *       200:
 *         description: 訂單取消成功
 *       401:
 *         description: 未授權
 *       404:
 *         description: 訂單不存在
 *       400:
 *         description: 訂單無法取消
 */
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '找不到該訂單' });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '沒有權限取消此訂單' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ message: '只能取消待付款的訂單' });
    }
    
    order.status = 'cancelled';
    await order.save();
    res.json({ message: '訂單已取消' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;