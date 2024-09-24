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
  price: {
    type: Number,
    required: [true, '課程價格未填寫'],
    min: [0, '課程價格不能為負數']
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
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, {
  versionKey: false,
  timestamps: true
});

export default model('Course', courseSchema);
