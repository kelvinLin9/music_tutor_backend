import express from 'express';
import { addReview, getReview, updateReview, deleteReview, getReviews } from '../controllers/courseReview.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/course-reviews:
 *   post:
 *     summary: 新增課程評價
 *     tags: [Course Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course
 *               - teacher
 *               - student
 *               - appointment
 *               - ratings
 *               - comment
 *               - learningProgress
 *             properties:
 *               course:
 *                 type: string
 *                 description: 課程ID
 *               teacher:
 *                 type: string
 *                 description: 老師ID
 *               student:
 *                 type: string
 *                 description: 學生ID
 *               appointment:
 *                 type: string
 *                 description: 課程預約ID
 *               ratings:
 *                 type: object
 *                 properties:
 *                   teachingQuality:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                   communication:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                   punctuality:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                   professionalism:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                   overall:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *               learningProgress:
 *                 type: string
 *                 enum: [excellent, good, fair, needs_improvement]
 *     responses:
 *       201:
 *         description: 評價創建成功
 *       400:
 *         description: 請求參數錯誤
 *       401:
 *         description: 未授權
 */
router.post('/', isAuth, addReview);

/**
 * @swagger
 * /api/course-reviews/{courseId}:
 *   get:
 *     summary: 獲取課程的所有評價
 *     tags: [Course Reviews]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: 課程ID
 *     responses:
 *       200:
 *         description: 成功獲取評價列表
 *       404:
 *         description: 課程不存在
 */
router.get('/:courseId', isAuth, getReviews);

/**
 * @swagger
 * /api/course-reviews/{id}:
 *   get:
 *     summary: 獲取單個評價詳情
 *     tags: [Course Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 評價ID
 *     responses:
 *       200:
 *         description: 成功獲取評價詳情
 *       404:
 *         description: 評價不存在
 */
router.get('/:id', isAuth, getReview);

/**
 * @swagger
 * /api/course-reviews/{id}:
 *   put:
 *     summary: 更新評價
 *     tags: [Course Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 評價ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ratings:
 *                 type: object
 *               comment:
 *                 type: string
 *               learningProgress:
 *                 type: string
 *     responses:
 *       200:
 *         description: 評價更新成功
 *       404:
 *         description: 評價不存在
 *       401:
 *         description: 未授權
 */
router.put('/:id', isAuth, updateReview);

/**
 * @swagger
 * /api/course-reviews/{id}:
 *   delete:
 *     summary: 刪除評價
 *     tags: [Course Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 評價ID
 *     responses:
 *       200:
 *         description: 評價刪除成功
 *       404:
 *         description: 評價不存在
 *       401:
 *         description: 未授權
 */
router.delete('/:id', isAuth, deleteReview);

export default router;