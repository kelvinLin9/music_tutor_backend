import { Router } from 'express';
import {
  createCourse,
  getCourses,
  getCourseByID,
  updateCourse,
  deleteCourse,
} from '../controllers/course.js';

const router = Router();

router.post('/', createCourse);
router.get('/', getCourses);
router.get('/:id', getCourseByID);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
