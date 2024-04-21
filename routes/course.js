import { Router } from 'express';
import {
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  getAllCourses
} from '../controllers/course.js';

const router = Router();

router.post('/', createCourse);
router.get('/', getAllCourses);
router.get('/:id', getCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
