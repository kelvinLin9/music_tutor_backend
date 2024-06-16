import mongoose from 'mongoose';

const { Schema } = mongoose;

// 定義商品項目子文檔 Schema
const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, '數量至少為1']
    },
    price: {
        type: Number,
        required: true
    }
});

// 主訂單 Schema
const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['未付款', '已付款'],
        default: '未付款'
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['信用卡', 'PayPal', '現金', '轉帳'],
        default: '信用卡'
    },
    couponUsed: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon',
        required: false
    },
    userNotes: {
        type: String,
        required: false,
        maxlength: 500
    }
}, 
{
  versionKey: false,
  timestamps: true
});

export default mongoose.model('Order', orderSchema);
