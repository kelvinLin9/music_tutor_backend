import mongoose from 'mongoose';

const { Schema } = mongoose;

const materialSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['document', 'video', 'audio', 'sheet_music', 'exercise', 'other']
    },
    format: {
        type: String,
        required: true,
        enum: ['pdf', 'doc', 'mp3', 'mp4', 'jpg', 'png', 'midi', 'other']
    },
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
    // 誰上傳的教材
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 關聯的課程
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    // 標籤（例如：難度、樂器類型等）
    tags: [{
        type: String,
        trim: true
    }],
    // 適用程度
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    // 版本控制
    version: {
        type: String,
        default: '1.0.0'
    },
    // 存取權限
    access: {
        type: String,
        enum: ['public', 'private', 'shared'],
        default: 'private'
    },
    // 共享設定
    sharedWith: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        permission: {
            type: String,
            enum: ['view', 'edit'],
            default: 'view'
        }
    }],
    // 使用統計
    stats: {
        views: {
            type: Number,
            default: 0
        },
        downloads: {
            type: Number,
            default: 0
        },
        likes: {
            type: Number,
            default: 0
        }
    },
    // 檔案資訊
    fileInfo: {
        size: {
            type: Number,
            required: true,
            min: 0
        },
        duration: {
            type: Number,
            min: 0,
            description: '音訊/視訊長度（秒）'
        },
        pages: {
            type: Number,
            min: 0,
            description: '文件頁數'
        }
    },
    // 學習目標
    learningObjectives: [{
        type: String,
        trim: true
    }],
    // 相關資源
    relatedMaterials: [{
        type: Schema.Types.ObjectId,
        ref: 'Material'
    }],
    // 使用說明
    instructions: {
        type: String
    },
    // 是否啟用
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// 索引
materialSchema.index({ course: 1, type: 1 });
materialSchema.index({ creator: 1 });
materialSchema.index({ tags: 1 });
materialSchema.index({ 'stats.downloads': -1 });

// 更新統計資料的方法
materialSchema.methods.incrementViews = async function() {
    this.stats.views += 1;
    return this.save();
};

materialSchema.methods.incrementDownloads = async function() {
    this.stats.downloads += 1;
    return this.save();
};

materialSchema.methods.toggleLike = async function(userId) {
    if (this.stats.likes.includes(userId)) {
        this.stats.likes = this.stats.likes.filter(id => id !== userId);
    } else {
        this.stats.likes.push(userId);
    }
    return this.save();
};

export default mongoose.model('Material', materialSchema); 