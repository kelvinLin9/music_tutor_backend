import mongoose from 'mongoose';
import validator from 'validator';

const { Schema, model } = mongoose;

const courseSchema = new Schema({
  name: {
    type: String,
    required: [true, '課程名稱未填寫'],
  },
  intro: {
    type: String,
    required: [true, '課程簡介未填寫'],
    validate: {
      validator: function(value) {
        return validator.isLength(value, { min: 10 });
      },
      message: '課程簡介至少需要 10 個字元以上'
    }
  },
  // 1. 課程狀態管理
  status: {
    type: String,
    enum: ['active', 'inactive', 'booked', 'draft'],
    default: 'active',
    required: true,
    description: {
      active: '開放預約',
      inactive: '暫時停課',
      booked: '已被預約',
      draft: '未發布'
    }
  },
  // 4. 課程難度和適合對象
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  targetAudience: {
    ageRange: {
      min: Number,
      max: Number
    },
    prerequisites: [String],
    requiredEquipment: [String]
  },
  // 5. 價格結構
  pricing: {
    singleLesson: {
      type: Number,
      required: true,
      min: [0, '課程價格不能為負數']
    },
    packageOptions: [{
      lessons: Number,
      pricePerLesson: Number,
      validityDays: Number
    }]
  },
  // 6. 課程內容大綱
  syllabus: [{
    lessonNumber: Number,
    title: String,
    description: String,
    duration: Number,
    objectives: [String],
    practiceGoals: [String]
  }],
  // 7. 課程標籤和搜索優化
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  searchKeywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  instrument: {
    type: String,
    required: true,
    enum: ['piano', 'guitar', 'violin', 'drums', 'bass', 'vocal', 'ukulele', 'saxophone', 'other']
  },
  // 8. 上課規則
  policies: {
    cancellation: {
      deadline: {
        type: Number,
        default: 24,
        description: '取消預約需提前小時數'
      },
      refundPercentage: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
      }
    },
    makeup: {
      allowed: {
        type: Boolean,
        default: true
      },
      validityDays: {
        type: Number,
        default: 30
      }
    }
  },
  // 9. 課程評價統計
  statistics: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    completedLessons: {
      type: Number,
      default: 0
    }
  },
  // 10. 多媒體資源
  resources: {
    previewVideo: {
      type: String,
      validate: {
        validator: function(value) {
          return validator.isURL(value);
        },
        message: '影片連結格式不正確'
      }
    },
    teachingMaterials: [{
      title: String,
      type: {
        type: String,
        enum: ['pdf', 'audio', 'video', 'link']
      },
      url: String,
      description: String
    }]
  },
  category: {
    type: String,
    required: [true, '課程類別未填寫'],
  },
  place: {
    type: String,
    required: [true, '上課地點未填寫'],
  },
  mode: {
    type: [String],
    required: [true, '上課模式未填寫'],
    enum: {
      values: ['在學生家', '在老師家', '線上'],
      message: '上課模式 {VALUE} 不正確'
    }
  },
  minutes: {
    type: Number,
    required: [true, '上課時間未填寫'],
    min: [0, '上課時間不能為負數']
  },
  img: {
    type: String,
    required: [true, '課程圖片未填寫'],
    validate: {
      validator: function(value) {
        return validator.isURL(value);
      },
      message: '圖片連結格式不正確'
    }
  },
  imgList: {
    type: [String],
    validate: {
      validator: function(value) {
        return value.every(url => validator.isURL(url));
      },
      message: '圖片列表中包含無效的圖片連結'
    },
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '老師ID未填寫']
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'CourseReview'
  }]
}, {
  versionKey: false,
  timestamps: true
});

// 添加索引以提升搜索效能
courseSchema.index({ instrument: 1, status: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ 'statistics.averageRating': -1 });

export default model('Course', courseSchema);
