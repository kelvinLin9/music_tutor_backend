import { Router } from 'express';
import { addReview, getReview, updateReview, deleteReview, getReviews } from '../controllers/review.js';

const router = Router();

router.post('/', addReview);
router.get('/course/:courseId', getReviews);
router.get('/:id', getReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;