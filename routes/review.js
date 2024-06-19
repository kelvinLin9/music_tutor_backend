import { Router } from 'express';
import { addReview, getReview, updateReview, deleteReview, getReviews } from '../controllers/review.js';
import { checkRequestBodyValidator, isAuth } from '../middlewares/index.js';
import { checkRequestBodyValidator, isAuth } from '../middlewares/index.js';

const router = Router();
router.use(checkRequestBodyValidator);

router.post('/', isAuth, addReview);
router.get('/course/:courseId', isAuth, getReviews);
router.get('/:id', isAuth, getReview);
router.put('/:id', isAuth, updateReview);
router.delete('/:id', isAuth, deleteReview);

export default router;