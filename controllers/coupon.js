import CouponModel from '../models/coupon.js';

const createCoupon = async (req, res) => {
  try {
      const { name, code, discountPercentage, expiryDate, isActive } = req.body;
      const coupon = new CouponModel({
          name,
          code,
          percentage,
          expiryDate,
          isActive
      });
      await coupon.save();
      res.status(201).send({ success: true, data: coupon });
  } catch (error) {
      res.status(400).send({ success: false, message: error.message });
  }
};

const getCoupons = async (req, res) => {
  try {
      const coupons = await CouponModel.find();
      res.send({ success: true, data: coupons });
  } catch (error) {
      res.status(500).send({ success: false, message: error.message });
  }
};

const getCoupon = async (req, res) => {
  try {
      const coupon = await CouponModel.findById(req.params.id);
      if (!coupon) {
          return res.status(404).send({ success: false, message: 'Coupon not found' });
      }
      res.send({ success: true, data: coupon });
  } catch (error) {
      res.status(500).send({ success: false, message: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
      const { name, code, discountPercentage, expiryDate, isActive } = req.body;
      const coupon = await CouponModel.findByIdAndUpdate(req.params.id, {
          name,
          code,
          percentage,
          expiryDate,
          isActive
      }, { new: true, runValidators: true });

      if (!coupon) {
          return res.status(404).send({ success: false, message: 'Coupon not found' });
      }

      res.send({ success: true, data: coupon });
  } catch (error) {
      res.status(400).send({ success: false, message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
      const coupon = await CouponModel.findByIdAndDelete(req.params.id);
      if (!coupon) {
          return res.status(404).send({ success: false, message: 'Coupon not found' });
      }
      res.send({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
      res.status(500).send({ success: false, message: error.message });
  }
};

export { createCoupon, getCoupons, getCoupon, updateCoupon, deleteCoupon };