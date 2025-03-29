import mongoose from 'mongoose';

const { Schema } = mongoose;

// 作業提交 Schema
const submissionSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        text: String,
        files: [{
            url: {
                type: String,
                required: true,
                validate: {
                    validator: function(v) {
                        return /^(http|https):\/\/[^ "]+$/.test(v);
                    },
                    message: '請提供有效的URL'
                }
            },
            type: {
                type: String,
                enum: ['audio', 'video', 'document', 'image'],
                required: true
            },
            description: String
        }]
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'revised'],
        default: 'pending'
    },
    feedback: {
        comment: String,
        rating: {
            type: Number,
            min: 0,
            max: 100
        },
        reviewedAt: Date,
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }
});

// 主要作業 Schema
const homeworkSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
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
    // 作業要求
    requirements: {
        instructions: {
            type: String,
            required: true
        },
        acceptedFileTypes: [{
            type: String,
            enum: ['audio', 'video', 'document', 'image']
        }],
        minDuration: {
            type: Number,
            min: 0,
            description: '最短錄音/影片長度（秒）'
        },
        maxDuration: {
            type: Number,
            min: 0,
            description: '最長錄音/影片長度（秒）'
        }
    },
    // 截止日期設定
    dueDate: {
        type: Date,
        required: true
    },
    // 相關教材
    relatedMaterials: [{
        type: Schema.Types.ObjectId,
        ref: 'Material'
    }],
    // 評分標準
    gradingCriteria: [{
        criterion: String,
        weight: {
            type: Number,
            min: 0,
            max: 100
        },
        description: String
    }],
    // 學生提交
    submissions: [submissionSchema],
    // 狀態
    status: {
        type: String,
        enum: ['draft', 'published', 'closed'],
        default: 'draft'
    },
    // 提醒設定
    reminders: {
        enabled: {
            type: Boolean,
            default: true
        },
        beforeDue: [{
            hours: Number,
            sent: {
                type: Boolean,
                default: false
            }
        }]
    },
    // 統計資訊
    stats: {
        totalSubmissions: {
            type: Number,
            default: 0
        },
        reviewedSubmissions: {
            type: Number,
            default: 0
        },
        averageScore: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// 索引
homeworkSchema.index({ course: 1, dueDate: 1 });
homeworkSchema.index({ teacher: 1 });
homeworkSchema.index({ 'submissions.student': 1 });
homeworkSchema.index({ status: 1 });

// 更新統計資訊
homeworkSchema.methods.updateStats = async function() {
    const submissions = this.submissions || [];
    const reviewedSubmissions = submissions.filter(s => s.status === 'reviewed');
    
    this.stats.totalSubmissions = submissions.length;
    this.stats.reviewedSubmissions = reviewedSubmissions.length;
    
    if (reviewedSubmissions.length > 0) {
        const totalScore = reviewedSubmissions.reduce((sum, s) => sum + (s.feedback.rating || 0), 0);
        this.stats.averageScore = totalScore / reviewedSubmissions.length;
    }
    
    return this.save();
};

// 檢查是否需要發送提醒
homeworkSchema.methods.checkReminders = async function() {
    if (!this.reminders.enabled) return [];
    
    const now = new Date();
    const remindersToSend = [];
    
    this.reminders.beforeDue.forEach(reminder => {
        if (!reminder.sent) {
            const reminderTime = new Date(this.dueDate.getTime() - reminder.hours * 3600000);
            if (now >= reminderTime) {
                reminder.sent = true;
                remindersToSend.push({
                    homework: this._id,
                    hoursBeforeDue: reminder.hours
                });
            }
        }
    });
    
    if (remindersToSend.length > 0) {
        await this.save();
    }
    
    return remindersToSend;
};

export default mongoose.model('Homework', homeworkSchema); 