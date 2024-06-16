import mongoose from 'mongoose';

const { Schema } = mongoose;

const couponSchema = new Schema({
  name: {
    type: String,
    required: [true, '名稱是必填的'],
    trim: true
  },
  code: {
    type: String,
    required: [true, '代碼是必填的'],
    unique: true,
    uppercase: true,
    trim: true
  },
  percentage: {
    type: Number,
    required: [true, '折扣百分比是必填的'],
    min: [0, '折扣百分比不能小於0'],
    max: [100, '折扣百分比不能超過100']
  },
  expiryDate: {
    type: Date,
    required: [true, '使用期限是必填的']
  },
  isActive: {
    type: Boolean,
    required: [true, '必須指定是否啟用'],
    default: true
  }
}, {
  versionKey: false,
  timestamps: true
});

export default mongoose.model('Coupon', couponSchema);
