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
            message: '名稱至少需要 2 個字元以上'
        }
    },
    email: {
        type: String,
        required: [true, 'Email 未填寫'],
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
        required: [true, '密碼未填寫'],
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
    birthday: {
        type: Date
    },
    address: {
        type: String,
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
    },
    photo: {
        type: String,
        validate: {
            validator: function(value) {
                return validator.isURL(value);
            },
            message: '大頭照 URL 格式不正確'
        }
    },
    intro: {
        type: String,
        maxlength: 500,
        default: ''
    },
    facebook: {
        type: String,
        validate: {
            validator: function(value) {
                return validator.isURL(value);
            },
            message: 'Facebook URL 格式不正確'
        }
    },
    instagram: {
        type: String,
        validate: {
            validator: function(value) {
                return validator.isURL(value);
            },
            message: 'Instagram URL 格式不正確'
        }
    },
    discord: {
        type: String,
        validate: {
            validator: function(value) {
                return validator.isURL(value);
            },
            message: 'Discord URL 格式不正確'
        }
    }
}, {
    versionKey: false,
    timestamps: true
});

// 密碼加密和電郵格式化的 pre-save 鉤子
// userSchema.pre('save', async function(next) {
//     if (this.isModified('password')) {
//         this.password = await bcrypt.hash(this.password, 12);
//     }
//     this.email = this.email.toLowerCase().trim();
//     next();
// });

export default model('User', userSchema);
