import mongoose from 'mongoose';

const { Schema } = mongoose;

const couponSchema = new Schema({
  name: {
    type: String,
    required: [true, '優惠券名稱未填寫'],
    trim: true
  },
  code: {
    type: String,
    required: [true, '優惠券代碼未填寫'],
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9]{6,20}$/.test(v);
      },
      message: '優惠券代碼必須為 6-20 位的大寫字母或數字'
    }
  },
  description: {
    type: String,
    maxlength: 500
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed', 'free_lesson'],
    description: {
      percentage: '百分比折扣',
      fixed: '固定金額折扣',
      free_lesson: '免費課程'
    }
  },
  discountValue: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        if (this.discountType === 'percentage') {
          return v > 0 && v <= 100;
        }
        return v > 0;
      },
      message: '折扣值必須大於 0，百分比折扣不得超過 100%'
    }
  },
  minimumPurchase: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumDiscount: {
    type: Number,
    min: 0
  },
  startDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v >= new Date();
      },
      message: '開始日期不能早於現在'
    }
  },
  expiryDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > this.startDate;
      },
      message: '結束日期必須晚於開始日期'
    }
  },
  usageLimit: {
    total: {
      type: Number,
      min: 0,
      description: '總共可使用次數，0 表示無限制'
    },
    perUser: {
      type: Number,
      min: 0,
      default: 1,
      description: '每位用戶可使用次數'
    }
  },
  applicableTo: {
    courses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }],
    teachers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
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
