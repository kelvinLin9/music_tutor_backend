import mongoose from 'mongoose';

const { Schema } = mongoose;

const cartItemSchema = new Schema({
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    packageType: {
        type: String,
        enum: ['single', 'package'],
        required: true
    },
    lessons: {
        type: Number,
        required: true,
        min: [1, '課程數量至少為1']
    },
    pricePerLesson: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    }
});

const cartSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema],
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    subtotal: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    // 優惠券相關資訊
    couponInfo: {
        isValid: {
            type: Boolean,
            default: false
        },
        message: String,
        discountType: String,
        discountValue: Number,
        minimumPurchase: Number,
        maximumDiscount: Number
    }
}, {
    timestamps: true
});

// 計算購物車金額的中間件
cartSchema.pre('save', async function(next) {
    if (this.isModified('items') || this.isModified('coupon')) {
        // 計算小計
        this.subtotal = this.items.reduce((total, item) => total + item.totalPrice, 0);
        
        // 如果有優惠券，驗證並計算折扣
        if (this.coupon) {
            try {
                const coupon = await mongoose.model('Coupon').findById(this.coupon);
                if (coupon) {
                    // 檢查優惠券是否有效
                    const isValid = coupon.isValid(this.student, this.subtotal);
                    this.couponInfo = {
                        isValid,
                        message: isValid ? '優惠券有效' : '優惠券無效',
                        discountType: coupon.discountType,
                        discountValue: coupon.discountValue,
                        minimumPurchase: coupon.minimumPurchase,
                        maximumDiscount: coupon.maximumDiscount
                    };
                    
                    if (isValid) {
                        this.discountAmount = coupon.calculateDiscount(this.subtotal);
                    } else {
                        this.discountAmount = 0;
                    }
                }
            } catch (error) {
                this.couponInfo = {
                    isValid: false,
                    message: '優惠券驗證失敗',
                    discountType: null,
                    discountValue: null,
                    minimumPurchase: null,
                    maximumDiscount: null
                };
                this.discountAmount = 0;
            }
        } else {
            this.discountAmount = 0;
            this.couponInfo = {
                isValid: false,
                message: '未使用優惠券',
                discountType: null,
                discountValue: null,
                minimumPurchase: null,
                maximumDiscount: null
            };
        }
        
        // 計算總金額
        this.total = this.subtotal - this.discountAmount;
    }
    next();
});

// 添加索引
cartSchema.index({ student: 1 });
cartSchema.index({ updatedAt: -1 });

export default mongoose.model('Cart', cartSchema); 