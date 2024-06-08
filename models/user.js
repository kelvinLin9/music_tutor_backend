import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

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
        unique: true,
        index: true,
        validate: {
            validator: function(value) {
                return validator.isEmail(value);
            },
            message: 'Email 格式不正確'
        }
    },
    password: {
        type: String,
        required: [true, 'password 未填寫'],
        minlength: 8,
        select: false
    },
    phone: {
      type: String,
      validate: {
          validator: function(value) {
              return validator.isMobilePhone(value, 'any', { strictMode: false });
          },
          message: '手機號碼格式不正確'
      }
    },
    birthday: Date,
    address: {
        detail: String
    },
    gender: {
        type: String,
        enum: ['男', '女', '雙性'],
        default: '雙性',
        required: [true, '性別未填寫']
    },
    courses: [{
      type: Schema.Types.ObjectId,
      ref: 'Courses'
    }],
    role: {
      type: String,
      enum: ['admin', 'user', 'superuser'],
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

// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 12);
//     this.email = this.email.toLowerCase().trim();
//     next();
// });

export default model('User', userSchema);
