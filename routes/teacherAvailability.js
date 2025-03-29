import express from 'express';
import { auth } from '../middlewares/auth.js';
import TeacherAvailability from '../models/teacherAvailability.js';

const router = express.Router();

/**
 * @swagger
 * /api/teacher-availability:
 *   get:
 *     tags:
 *       - 教師可用時間管理
 *     summary: 獲取教師可用時間
 *     description: 獲取指定教師的可用時間列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: 教師ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 開始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 結束日期
 *     responses:
 *       200:
 *         description: 成功獲取教師可用時間
 *       401:
 *         description: 未授權
 */
router.get('/', auth, async (req, res) => {
  try {
    const { teacherId, startDate, endDate } = req.query;
    const query = { teacher: teacherId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const availability = await TeacherAvailability.find(query)
      .populate('teacher')
      .sort({ date: 1, startTime: 1 });
      
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/teacher-availability/{id}:
 *   get:
 *     tags:
 *       - 教師可用時間管理
 *     summary: 獲取可用時間詳情
 *     description: 根據ID獲取可用時間詳情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 可用時間ID
 *     responses:
 *       200:
 *         description: 成功獲取可用時間詳情
 *       401:
 *         description: 未授權
 *       404:
 *         description: 可用時間不存在
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const availability = await TeacherAvailability.findById(req.params.id)
      .populate('teacher');
    if (!availability) {
      return res.status(404).json({ message: '找不到該可用時間' });
    }
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/teacher-availability:
 *   post:
 *     tags:
 *       - 教師可用時間管理
 *     summary: 添加可用時間
 *     description: 添加教師的可用時間（僅教師）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: 日期
 *               startTime:
 *                 type: string
 *                 description: 開始時間
 *               endTime:
 *                 type: string
 *                 description: 結束時間
 *               notes:
 *                 type: string
 *                 description: 備註
 *     responses:
 *       201:
 *         description: 可用時間添加成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: '權限不足' });
    }
    
    const availability = new TeacherAvailability({
      ...req.body,
      teacher: req.user._id
    });
    
    const newAvailability = await availability.save();
    await newAvailability.populate('teacher');
    res.status(201).json(newAvailability);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/teacher-availability/{id}:
 *   put:
 *     tags:
 *       - 教師可用時間管理
 *     summary: 更新可用時間
 *     description: 更新教師的可用時間（僅教師）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 可用時間ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: 日期
 *               startTime:
 *                 type: string
 *                 description: 開始時間
 *               endTime:
 *                 type: string
 *                 description: 結束時間
 *               notes:
 *                 type: string
 *                 description: 備註
 *     responses:
 *       200:
 *         description: 可用時間更新成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 可用時間不存在
 */
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: '權限不足' });
    }
    
    const availability = await TeacherAvailability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({ message: '找不到該可用時間' });
    }
    if (availability.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '沒有權限修改此可用時間' });
    }
    
    Object.assign(availability, req.body);
    const updatedAvailability = await availability.save();
    await updatedAvailability.populate('teacher');
    res.json(updatedAvailability);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/teacher-availability/{id}:
 *   delete:
 *     tags:
 *       - 教師可用時間管理
 *     summary: 刪除可用時間
 *     description: 刪除教師的可用時間（僅教師）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 可用時間ID
 *     responses:
 *       200:
 *         description: 可用時間刪除成功
 *       401:
 *         description: 未授權
 *       403:
 *         description: 權限不足
 *       404:
 *         description: 可用時間不存在
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: '權限不足' });
    }
    
    const availability = await TeacherAvailability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({ message: '找不到該可用時間' });
    }
    if (availability.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '沒有權限刪除此可用時間' });
    }
    
    await availability.remove();
    res.json({ message: '可用時間已刪除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;