import express from 'express';
import { auth } from '../middlewares/auth.js';
import Homework from '../models/homework.js';

const router = express.Router();

/**
 * @swagger
 * /api/homework:
 *   get:
 *     tags:
 *       - 作業管理
 *     summary: 獲取作業列表
 *     description: 獲取學生的作業列表，支持分頁和狀態篩選
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
 *           enum: [pending, submitted, graded]
 *         description: 作業狀態
 *     responses:
 *       200:
 *         description: 成功獲取作業列表
 *       401:
 *         description: 未授權
 */
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { student: req.user._id };
    if (status) query.status = status;
    
    const homework = await Homework.find(query)
      .populate('course')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await Homework.countDocuments(query);
    res.json({
      homework,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/homework/{id}:
 *   get:
 *     tags:
 *       - 作業管理
 *     summary: 獲取作業詳情
 *     description: 根據ID獲取作業詳情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 作業ID
 *     responses:
 *       200:
 *         description: 成功獲取作業詳情
 *       401:
 *         description: 未授權
 *       404:
 *         description: 作業不存在
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id)
      .populate('course');
    if (!homework) {
      return res.status(404).json({ message: '找不到該作業' });
    }
    if (homework.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '沒有權限查看此作業' });
    }
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/homework:
 *   post:
 *     tags:
 *       - 作業管理
 *     summary: 提交作業
 *     description: 提交新的作業
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
 *               - title
 *               - content
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: 課程ID
 *               title:
 *                 type: string
 *                 description: 作業標題
 *               content:
 *                 type: string
 *                 description: 作業內容
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 附件URL列表
 *     responses:
 *       201:
 *         description: 作業提交成功
 *       401:
 *         description: 未授權
 *       400:
 *         description: 請求格式錯誤
 */
router.post('/', auth, async (req, res) => {
  try {
    const homework = new Homework({
      ...req.body,
      student: req.user._id,
      status: 'submitted',
      submittedAt: new Date()
    });
    
    const newHomework = await homework.save();
    await newHomework.populate('course');
    res.status(201).json(newHomework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/homework/{id}:
 *   put:
 *     tags:
 *       - 作業管理
 *     summary: 更新作業
 *     description: 更新作業內容
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 作業ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 作業標題
 *               content:
 *                 type: string
 *                 description: 作業內容
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 附件URL列表
 *     responses:
 *       200:
 *         description: 作業更新成功
 *       401:
 *         description: 未授權
 *       404:
 *         description: 作業不存在
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: '找不到該作業' });
    }
    if (homework.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '沒有權限修改此作業' });
    }
    if (homework.status === 'graded') {
      return res.status(400).json({ message: '已評分的作業無法修改' });
    }
    
    Object.assign(homework, req.body);
    const updatedHomework = await homework.save();
    await updatedHomework.populate('course');
    res.json(updatedHomework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/homework/{id}/grade:
 *   post:
 *     tags:
 *       - 作業管理
 *     summary: 評分作業
 *     description: 老師評分作業（僅老師）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 作業ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *               - feedback
 *             properties:
 *               score:
 *                 type: number
 *                 description: 分數
 *               feedback:
 *                 type: string
 *                 description: 評語
 *     responses:
 *       200:
 *         description: 作業評分成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 作業不存在
 */
router.post('/:id/grade', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: '權限不足' });
    }
    
    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: '找不到該作業' });
    }
    
    homework.score = req.body.score;
    homework.feedback = req.body.feedback;
    homework.status = 'graded';
    homework.gradedAt = new Date();
    homework.gradedBy = req.user._id;
    
    const updatedHomework = await homework.save();
    await updatedHomework.populate('course');
    res.json(updatedHomework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 