import { Router } from 'express';
import { addReview, getReview, updateReview, deleteReview, getReviews } from '../controllers/review.js';

const router = Router();

router.post('/reviews', addReview);
router.get('/reviews/course/:courseId', getReviews);
router.get('/reviews/:id', getReview);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

export default router;