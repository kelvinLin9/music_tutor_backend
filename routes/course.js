import express from 'express';
import { auth } from '../middlewares/auth.js';
import Course from '../models/course.js';

const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags:
 *       - 課程管理
 *     summary: 獲取所有課程
 *     description: 獲取課程列表，支持分頁和篩選
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
 *         description: 課程類別
 *     responses:
 *       200:
 *         description: 成功獲取課程列表
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const query = category ? { category } : {};
    const courses = await Course.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Course.countDocuments(query);
    res.json({
      courses,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags:
 *       - 課程管理
 *     summary: 獲取單個課程
 *     description: 根據ID獲取課程詳情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 課程ID
 *     responses:
 *       200:
 *         description: 成功獲取課程詳情
 *       404:
 *         description: 課程不存在
 */
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: '找不到該課程' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags:
 *       - 課程管理
 *     summary: 創建新課程
 *     description: 創建新的課程
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - intro
 *               - category
 *               - place
 *               - mode
 *               - minutes
 *               - price
 *               - img
 *             properties:
 *               name:
 *                 type: string
 *                 description: 課程名稱
 *               intro:
 *                 type: string
 *                 description: 課程簡介
 *               category:
 *                 type: string
 *                 description: 課程類別
 *               place:
 *                 type: string
 *                 description: 上課地點
 *               mode:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [在學生家, 在老師家, 線上]
 *                 description: 上課模式
 *               minutes:
 *                 type: integer
 *                 description: 上課時間（分鐘）
 *               price:
 *                 type: number
 *                 description: 課程價格
 *               img:
 *                 type: string
 *                 description: 課程圖片URL
 *     responses:
 *       201:
 *         description: 課程創建成功
 *       401:
 *         description: 未授權
 */
router.post('/', auth, async (req, res) => {
  const course = new Course({
    ...req.body,
    instructor: req.user._id
  });
  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     tags:
 *       - 課程管理
 *     summary: 更新課程
 *     description: 更新課程信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 課程ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 課程名稱
 *               intro:
 *                 type: string
 *                 description: 課程簡介
 *               category:
 *                 type: string
 *                 description: 課程類別
 *               place:
 *                 type: string
 *                 description: 上課地點
 *               mode:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [在學生家, 在老師家, 線上]
 *                 description: 上課模式
 *               minutes:
 *                 type: integer
 *                 description: 上課時間（分鐘）
 *               price:
 *                 type: number
 *                 description: 課程價格
 *               img:
 *                 type: string
 *                 description: 課程圖片URL
 *     responses:
 *       200:
 *         description: 課程更新成功
 *       401:
 *         description: 未授權
 *       404:
 *         description: 課程不存在
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: '找不到該課程' });
    }
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '沒有權限修改此課程' });
    }
    Object.assign(course, req.body);
    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     tags:
 *       - 課程管理
 *     summary: 刪除課程
 *     description: 刪除指定課程
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 課程ID
 *     responses:
 *       200:
 *         description: 課程刪除成功
 *       401:
 *         description: 未授權
 *       404:
 *         description: 課程不存在
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: '找不到該課程' });
    }
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '沒有權限刪除此課程' });
    }
    await course.remove();
    res.json({ message: '課程已刪除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
