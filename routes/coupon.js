import { Router } from 'express';
import { createCoupon, getCoupon, updateCoupon, deleteCoupon, getCoupons } from '../controllers/coupon.js';

const router = Router();

router.post('/', createCoupon);
router.get('/', getCoupons);
router.get('/:id', getCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;