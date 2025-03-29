import mongoose from 'mongoose';

const { Schema } = mongoose;

// 評分細項 Schema
const ratingDetailSchema = new Schema({
    teachingQuality: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
        description: '教學品質評分'
    },
    communication: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
        description: '溝通能力評分'
    },
    punctuality: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
        description: '準時程度評分'
    },
    professionalism: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
        description: '專業程度評分'
    },
    overall: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
        description: '整體評分'
    }
});

// 評價 Schema
const courseReviewSchema = new Schema({
    // 基本資訊
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
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
    appointment: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    
    // 評分
    ratings: {
        type: ratingDetailSchema,
        required: true
    },
    
    // 評價內容
    comment: {
        type: String,
        required: true,
        maxlength: 1000,
        trim: true
    },
    
    // 學習進展
    learningProgress: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'needs_improvement'],
        required: true,
        description: '學習進展評估'
    },
    
    // 優點
    strengths: [{
        type: String,
        trim: true,
        maxlength: 100
    }],
    
    // 需要改進的地方
    improvements: [{
        type: String,
        trim: true,
        maxlength: 100
    }],
    
    // 建議
    suggestions: {
        type: String,
        maxlength: 500,
        trim: true
    },
    
    // 照片/影片
    media: [{
        type: {
            type: String,
            enum: ['image', 'video'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        thumbnail: String,
        description: String
    }],
    
    // 標籤
    tags: [{
        type: String,
        trim: true
    }],
    
    // 評價狀態
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'hidden'],
        default: 'pending'
    },
    
    // 老師回覆
    teacherResponse: {
        content: {
            type: String,
            maxlength: 500,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    
    // 統計資訊
    stats: {
        helpful: {
            type: Number,
            default: 0
        },
        reported: {
            type: Number,
            default: 0
        },
        views: {
            type: Number,
            default: 0
        }
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
courseReviewSchema.index({ course: 1, status: 1 });
courseReviewSchema.index({ teacher: 1, status: 1 });
courseReviewSchema.index({ student: 1 });
courseReviewSchema.index({ appointment: 1 });
courseReviewSchema.index({ createdAt: -1 });

// 計算平均評分的中間件
courseReviewSchema.pre('save', async function(next) {
    if (this.isModified('ratings')) {
        // 計算課程平均評分
        const courseReviews = await this.constructor.find({
            course: this.course,
            status: 'approved'
        });
        
        const courseStats = courseReviews.reduce((acc, review) => {
            acc.total += review.ratings.overall;
            acc.count += 1;
            return acc;
        }, { total: 0, count: 0 });
        
        if (courseStats.count > 0) {
            await mongoose.model('Course').findByIdAndUpdate(this.course, {
                $set: {
                    averageRating: courseStats.total / courseStats.count,
                    totalReviews: courseStats.count
                }
            });
        }
        
        // 計算老師平均評分
        const teacherReviews = await this.constructor.find({
            teacher: this.teacher,
            status: 'approved'
        });
        
        const teacherStats = teacherReviews.reduce((acc, review) => {
            acc.total += review.ratings.overall;
            acc.count += 1;
            return acc;
        }, { total: 0, count: 0 });
        
        if (teacherStats.count > 0) {
            await mongoose.model('User').findByIdAndUpdate(this.teacher, {
                $set: {
                    averageRating: teacherStats.total / teacherStats.count,
                    totalReviews: teacherStats.count
                }
            });
        }
    }
    next();
});

// 更新統計資訊的方法
courseReviewSchema.methods.updateStats = async function(action) {
    switch (action) {
        case 'helpful':
            this.stats.helpful += 1;
            break;
        case 'report':
            this.stats.reported += 1;
            break;
        case 'view':
            this.stats.views += 1;
            break;
    }
    return this.save();
};

// 老師回覆評價的方法
courseReviewSchema.methods.addTeacherResponse = async function(content) {
    this.teacherResponse = {
        content,
        createdAt: new Date()
    };
    return this.save();
};

// 更新評價狀態的方法
courseReviewSchema.methods.updateStatus = async function(status, description) {
    this.status = status;
    this.logs.push({
        action: 'status_update',
        description
    });
    return this.save();
};

export default mongoose.model('CourseReview', courseReviewSchema); 