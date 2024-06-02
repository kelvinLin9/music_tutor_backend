import { Schema, model } from 'mongoose';
import validator from 'validator';

const userSchema = new Schema({
    name: {
        type: String,
        validate: {
            validator: function(value) {
                return validator.isLength(value, { min: 2 });
            },
            message: 'name 至少需要 2 個字元以上'
        }
    },
    email: {
        type: String,
        required: [true, 'email 未填寫'],
        validate: {
            validator: function(value) {
                return validator.isEmail(value);
            },
            message: 'Email 格式不正確'
        },
        unique: true
    },
    password: {
        type: String,
        required: [true, 'password 未填寫'],
        select: false
    },
    phone: String,
    birthday: Date,
    address: {
        detail: String
    },
    courses: [{
      type: Schema.Types.ObjectId,
      ref: 'Courses'
    }],
    userRole: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
    verificationToken: {
      type: String,
      default: '',
      select: false
    }
}, {
    versionKey: false,
    timestamps: true
});

export default model('User', userSchema);
