import express from 'express';
import { auth } from '../middlewares/auth.js';
import Cart from '../models/cart.js';

const router = express.Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags:
 *       - 購物車管理
 *     summary: 獲取購物車
 *     description: 獲取當前用戶的購物車內容
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取購物車內容
 *       401:
 *         description: 未授權
 */
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.course');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/cart:
 *   post:
 *     tags:
 *       - 購物車管理
 *     summary: 添加課程到購物車
 *     description: 將課程添加到購物車
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: 課程ID
 *     responses:
 *       200:
 *         description: 課程添加成功
 *       401:
 *         description: 未授權
 *       400:
 *         description: 請求格式錯誤
 */
router.post('/', auth, async (req, res) => {
  try {
    const { courseId } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ course: courseId }]
      });
    } else {
      const existingItem = cart.items.find(
        item => item.course.toString() === courseId
      );
      
      if (existingItem) {
        return res.status(400).json({ message: '課程已在購物車中' });
      }
      
      cart.items.push({ course: courseId });
      await cart.save();
    }
    
    await cart.populate('items.course');
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/cart/{courseId}:
 *   delete:
 *     tags:
 *       - 購物車管理
 *     summary: 從購物車移除課程
 *     description: 從購物車中移除指定課程
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: 課程ID
 *     responses:
 *       200:
 *         description: 課程移除成功
 *       401:
 *         description: 未授權
 *       404:
 *         description: 課程不存在於購物車中
 */
router.delete('/:courseId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: '購物車不存在' });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.course.toString() === req.params.courseId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: '課程不存在於購物車中' });
    }
    
    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    await cart.populate('items.course');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     tags:
 *       - 購物車管理
 *     summary: 清空購物車
 *     description: 清空當前用戶的購物車
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 購物車清空成功
 *       401:
 *         description: 未授權
 */
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: '購物車不存在' });
    }
    
    cart.items = [];
    await cart.save();
    res.json({ message: '購物車已清空' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 