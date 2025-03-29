import mongoose from 'mongoose';

const { Schema } = mongoose;

const teacherAvailabilitySchema = new Schema({
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 週期性可用時間
    regularSchedule: [{
        dayOfWeek: {
            type: Number,
            required: true,
            min: 0,
            max: 6
        },
        timeSlots: [{
            startTime: {
                type: String,
                required: true,
                validate: {
                    validator: function(v) {
                        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                    },
                    message: '時間格式必須為 HH:mm'
                }
            },
            endTime: {
                type: String,
                required: true,
                validate: {
                    validator: function(v) {
                        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                    },
                    message: '時間格式必須為 HH:mm'
                }
            }
        }]
    }],
    // 特殊日期設定（休假或額外工作時間）
    specialDates: [{
        date: {
            type: Date,
            required: true
        },
        type: {
            type: String,
            enum: ['vacation', 'extra_work'],
            required: true
        },
        timeSlots: [{
            startTime: {
                type: String,
                validate: {
                    validator: function(v) {
                        return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                    },
                    message: '時間格式必須為 HH:mm'
                }
            },
            endTime: {
                type: String,
                validate: {
                    validator: function(v) {
                        return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                    },
                    message: '時間格式必須為 HH:mm'
                }
            }
        }]
    }],
    // 教學地點設定
    teachingLocations: [{
        type: {
            type: String,
            enum: ['在學生家', '在老師家', '線上'],
            required: true
        },
        address: String,
        travelDistance: {
            type: Number,
            min: 0,
            description: '老師願意移動的最大距離（公里）'
        },
        additionalFee: {
            type: Number,
            min: 0,
            default: 0,
            description: '交通費用'
        }
    }],
    // 預約設定
    bookingSettings: {
        minimumNotice: {
            type: Number,
            default: 24,
            description: '最少需要提前幾小時預約'
        },
        maximumDaysInAdvance: {
            type: Number,
            default: 30,
            description: '最多可以提前幾天預約'
        },
        breakBetweenLessons: {
            type: Number,
            default: 0,
            description: '課程之間的休息時間（分鐘）'
        }
    }
}, {
    timestamps: true
});

// 索引
teacherAvailabilitySchema.index({ teacher: 1 });
teacherAvailabilitySchema.index({ 'specialDates.date': 1 });

// 驗證時間順序
teacherAvailabilitySchema.pre('save', function(next) {
    // 檢查常規時間段
    this.regularSchedule.forEach(schedule => {
        schedule.timeSlots.forEach(slot => {
            if (slot.startTime >= slot.endTime) {
                next(new Error('結束時間必須晚於開始時間'));
            }
        });
    });

    // 檢查特殊日期時間段
    this.specialDates.forEach(special => {
        special.timeSlots.forEach(slot => {
            if (slot.startTime && slot.endTime && slot.startTime >= slot.endTime) {
                next(new Error('結束時間必須晚於開始時間'));
            }
        });
    });

    next();
});

export default mongoose.model('TeacherAvailability', teacherAvailabilitySchema); 