import { Router } from 'express';
import { addReview, getReview, updateReview, deleteReview, getReviews } from '../controllers/review.js';
import { checkRequestBodyValidator, isAuth } from '../middlewares/index.js';

const router = Router();
router.use(checkRequestBodyValidator);

router.post('/', addReview);
router.get('/course/:courseId', getReviews);
router.get('/:id', getReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;