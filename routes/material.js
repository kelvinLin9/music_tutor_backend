import express from 'express';
import { auth } from '../middlewares/auth.js';
import Material from '../models/material.js';

const router = express.Router();

/**
 * @swagger
 * /api/materials:
 *   get:
 *     tags:
 *       - 教材管理
 *     summary: 獲取教材列表
 *     description: 獲取所有教材，支持分頁和類別篩選
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
 *         name: category
 *         schema:
 *           type: string
 *         description: 教材類別
 *     responses:
 *       200:
 *         description: 成功獲取教材列表
 *       401:
 *         description: 未授權
 */
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const query = category ? { category } : {};
    const materials = await Material.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await Material.countDocuments(query);
    res.json({
      materials,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/materials/{id}:
 *   get:
 *     tags:
 *       - 教材管理
 *     summary: 獲取教材詳情
 *     description: 根據ID獲取教材詳情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 教材ID
 *     responses:
 *       200:
 *         description: 成功獲取教材詳情
 *       401:
 *         description: 未授權
 *       404:
 *         description: 教材不存在
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: '找不到該教材' });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/materials:
 *   post:
 *     tags:
 *       - 教材管理
 *     summary: 創建教材
 *     description: 創建新的教材（僅管理員）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - fileUrl
 *             properties:
 *               title:
 *                 type: string
 *                 description: 教材標題
 *               description:
 *                 type: string
 *                 description: 教材描述
 *               category:
 *                 type: string
 *                 description: 教材類別
 *               fileUrl:
 *                 type: string
 *                 description: 教材文件URL
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 標籤
 *     responses:
 *       201:
 *         description: 教材創建成功
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
    
    const material = new Material({
      ...req.body,
      createdBy: req.user._id
    });
    
    const newMaterial = await material.save();
    res.status(201).json(newMaterial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/materials/{id}:
 *   put:
 *     tags:
 *       - 教材管理
 *     summary: 更新教材
 *     description: 更新教材信息（僅管理員）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 教材ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 教材標題
 *               description:
 *                 type: string
 *                 description: 教材描述
 *               category:
 *                 type: string
 *                 description: 教材類別
 *               fileUrl:
 *                 type: string
 *                 description: 教材文件URL
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 標籤
 *     responses:
 *       200:
 *         description: 教材更新成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 教材不存在
 */
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '權限不足' });
    }
    
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: '找不到該教材' });
    }
    
    Object.assign(material, req.body);
    const updatedMaterial = await material.save();
    res.json(updatedMaterial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/materials/{id}:
 *   delete:
 *     tags:
 *       - 教材管理
 *     summary: 刪除教材
 *     description: 刪除教材（僅管理員）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 教材ID
 *     responses:
 *       200:
 *         description: 教材刪除成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 教材不存在
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '權限不足' });
    }
    
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: '找不到該教材' });
    }
    
    await material.remove();
    res.json({ message: '教材已刪除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;