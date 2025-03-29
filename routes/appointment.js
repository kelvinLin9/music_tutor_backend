import express from 'express';
import { auth } from '../middlewares/auth.js';
import Appointment from '../models/appointment.js';

const router = express.Router();

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     tags:
 *       - 預約管理
 *     summary: 獲取預約列表
 *     description: 獲取用戶的預約列表，支持分頁和狀態篩選
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
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: 預約狀態
 *     responses:
 *       200:
 *         description: 成功獲取預約列表
 *       401:
 *         description: 未授權
 */
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    
    const appointments = await Appointment.find(query)
      .populate('course')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await Appointment.countDocuments(query);
    res.json({
      appointments,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     tags:
 *       - 預約管理
 *     summary: 獲取預約詳情
 *     description: 根據ID獲取預約詳情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 預約ID
 *     responses:
 *       200:
 *         description: 成功獲取預約詳情
 *       401:
 *         description: 未授權
 *       404:
 *         description: 預約不存在
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('course');
    if (!appointment) {
      return res.status(404).json({ message: '找不到該預約' });
    }
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '沒有權限查看此預約' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags:
 *       - 預約管理
 *     summary: 創建預約
 *     description: 創建新的課程預約
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
 *               - date
 *               - time
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: 課程ID
 *               date:
 *                 type: string
 *                 format: date
 *                 description: 預約日期
 *               time:
 *                 type: string
 *                 description: 預約時間
 *               notes:
 *                 type: string
 *                 description: 備註
 *     responses:
 *       201:
 *         description: 預約創建成功
 *       401:
 *         description: 未授權
 *       400:
 *         description: 請求格式錯誤
 */
router.post('/', auth, async (req, res) => {
  const appointment = new Appointment({
    ...req.body,
    user: req.user._id,
    status: 'pending'
  });
  try {
    const newAppointment = await appointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     tags:
 *       - 預約管理
 *     summary: 更新預約
 *     description: 更新預約信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 預約ID
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
 *                 description: 預約日期
 *               time:
 *                 type: string
 *                 description: 預約時間
 *               notes:
 *                 type: string
 *                 description: 備註
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 description: 預約狀態
 *     responses:
 *       200:
 *         description: 預約更新成功
 *       401:
 *         description: 未授權
 *       404:
 *         description: 預約不存在
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: '找不到該預約' });
    }
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '沒有權限修改此預約' });
    }
    Object.assign(appointment, req.body);
    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     tags:
 *       - 預約管理
 *     summary: 取消預約
 *     description: 取消指定預約
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 預約ID
 *     responses:
 *       200:
 *         description: 預約取消成功
 *       401:
 *         description: 未授權
 *       404:
 *         description: 預約不存在
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: '找不到該預約' });
    }
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '沒有權限取消此預約' });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: '預約已取消' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;