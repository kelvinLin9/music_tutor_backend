import { Router } from 'express';
import {
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  getAllCourses
} from '../controllers/course.js';

const router = Router();

router.post('/courses', createCourse);
router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

export default router;
