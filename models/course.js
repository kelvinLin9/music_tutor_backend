import { Schema, model } from 'mongoose';
import validator from 'validator';

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
    type: String,
    required: [true, '上課模式未填寫'],
    enum: {
      values: ['在學生家', '在老師家', '線上'],
      message: '上課模式不正確'
    }
  },
  time: {
    type: Date,
    required: [true, '開課時間未填寫'],
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
  }
}, {
  versionKey: false,
  timestamps: true
});

export default model('Course', courseSchema);
