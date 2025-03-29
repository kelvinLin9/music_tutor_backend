import mongoose from 'mongoose';

const { Schema } = mongoose;

const appointmentSchema = new Schema({
    // 基本資訊
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    orderItem: {
        type: Schema.Types.ObjectId,
        required: true
    },
    
    // 時間資訊
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    
    // 上課狀態
    status: {
        type: String,
        enum: [
            'scheduled',    // 已預約
            'confirmed',    // 老師已確認
            'in_progress', // 上課中
            'completed',   // 已完成
            'cancelled',   // 已取消
            'missed'       // 未出席
        ],
        default: 'scheduled',
        required: true
    },
    
    // 上課地點
    location: {
        type: {
            type: String,
            enum: ['在學生家', '在老師家', '線上'],
            required: true
        },
        address: String,
        onlineLink: String
    },
    
    // 課程內容
    lessonContent: {
        title: String,
        description: String,
        materials: [{
            type: String,
            url: String,
            description: String
        }],
        homework: {
            description: String,
            dueDate: Date
        }
    },
    
    // 課後評價
    feedback: {
        teacher: {
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: String,
            submittedAt: Date
        },
        student: {
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: String,
            submittedAt: Date
        }
    },
    
    // 出席記錄
    attendance: {
        studentPresent: {
            type: Boolean,
            default: null
        },
        teacherPresent: {
            type: Boolean,
            default: null
        },
        recordedAt: Date
    },
    
    // 筆記和備註
    notes: {
        teacher: {
            type: String,
            maxlength: 1000
        },
        student: {
            type: String,
            maxlength: 1000
        },
        internal: {
            type: String,
            maxlength: 1000
        }
    },
    
    // 取消/改期記錄
    rescheduling: [{
        originalTime: {
            start: Date,
            end: Date
        },
        requestedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String,
        requestedAt: Date,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    }],
    
    // 系統記錄
    logs: [{
        action: {
            type: String,
            required: true
        },
        performedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        description: String
    }]
}, {
    timestamps: true
});

// 索引
appointmentSchema.index({ teacher: 1, startTime: 1 });
appointmentSchema.index({ student: 1, startTime: 1 });
appointmentSchema.index({ status: 1, startTime: 1 });
appointmentSchema.index({ order: 1, orderItem: 1 });

// 驗證時間
appointmentSchema.pre('save', function(next) {
    if (this.startTime >= this.endTime) {
        next(new Error('結束時間必須晚於開始時間'));
    }
    next();
});

// 更新課程剩餘堂數
appointmentSchema.post('save', async function(doc) {
    if (doc.status === 'completed') {
        const Order = mongoose.model('Order');
        await Order.findOneAndUpdate(
            { 
                _id: doc.order,
                'items._id': doc.orderItem 
            },
            { 
                $inc: { 'items.$.remainingLessons': -1 } 
            }
        );
    }
});

export default mongoose.model('Appointment', appointmentSchema);

