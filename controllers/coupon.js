import CouponModel from '../models/coupon.js';

const createCoupon = async (req, res) => {
  try {
      const { name, code, percentage, expiryDate, isActive } = req.body;
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const filterBy = req.query.filterBy ? JSON.parse(req.query.filterBy) : {};

    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      CouponModel.find(filterBy)
        .sort({ [sortBy]: sortOrder })
        .limit(limit)
        .skip(skip),
      CouponModel.countDocuments(filterBy)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.send({
      success: true,
      coupons,
      page,
      limit,
      totalPages,
      totalItems,
      sortBy,
      sortOrder,
    });
  } catch (error) {
    next(error);
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
      const { name, code, percentage, expiryDate, isActive } = req.body;
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