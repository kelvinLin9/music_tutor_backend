import mongoose from 'mongoose';

const { Schema } = mongoose;

// 定義課程方案子文檔 Schema
const orderItemSchema = new Schema({
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
        required: true,
        min: [0, '單價不能為負數']
    },
    totalPrice: {
        type: Number,
        required: true
    },
    validityPeriod: {
        startDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        endDate: {
            type: Date,
            required: true
        }
    },
    remainingLessons: {
        type: Number,
        required: true
    }
});

// 主訂單 Schema
const orderSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    // 訂單狀態
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'paid', 'cancelled', 'refunded'],
        default: 'pending'
    },
    // 付款資訊
    payment: {
        status: {
            type: String,
            required: true,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        method: {
            type: String,
            required: true,
            enum: ['credit_card', 'line_pay', 'bank_transfer'],
            default: 'credit_card'
        },
        transactionId: String,
        paidAt: Date,
        refundedAt: Date
    },
    // 優惠券
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    discountAmount: {
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
    },
    // 發票資訊
    invoice: {
        type: {
            type: String,
            enum: ['personal', 'company'],
            required: true,
            default: 'personal'
        },
        number: String,
        title: String,
        taxId: String
    },
    // 備註
    studentNotes: {
        type: String,
        maxlength: 500
    },
    teacherNotes: {
        type: String,
        maxlength: 500
    },
    // 系統記錄
    logs: [{
        action: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        description: String
    }]
}, {
    versionKey: false,
    timestamps: true
});

// 添加索引
orderSchema.index({ student: 1, status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

// 計算總金額的中間件
orderSchema.pre('save', async function(next) {
    if (this.isModified('items') || this.isModified('coupon')) {
        // 計算小計
        const subtotal = this.items.reduce((total, item) => total + item.totalPrice, 0);
        
        // 如果有優惠券，驗證並計算折扣
        if (this.coupon) {
            try {
                const coupon = await mongoose.model('Coupon').findById(this.coupon);
                if (coupon) {
                    // 檢查優惠券是否有效
                    const isValid = coupon.isValid(this.student, subtotal);
                    this.couponInfo = {
                        isValid,
                        message: isValid ? '優惠券有效' : '優惠券無效',
                        discountType: coupon.discountType,
                        discountValue: coupon.discountValue,
                        minimumPurchase: coupon.minimumPurchase,
                        maximumDiscount: coupon.maximumDiscount
                    };
                    
                    if (isValid) {
                        this.discountAmount = coupon.calculateDiscount(subtotal);
                        // 記錄使用情況
                        await coupon.recordUsage(this.student, this, this.discountAmount);
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
        this.totalAmount = subtotal - this.discountAmount;
    }
    next();
});

export default mongoose.model('Order', orderSchema);
