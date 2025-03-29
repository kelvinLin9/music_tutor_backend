import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const oauthProviderSchema = new Schema({
    provider: {
        type: String,
        enum: ['google', 'facebook', 'line', 'apple', 'github'],
        required: true
    },
    providerId: {
        type: String,
        required: true
    },
    accessToken: {
        type: String,
        select: false
    },
    refreshToken: {
        type: String,
        select: false
    },
    tokenExpiresAt: {
        type: Date,
        select: false
    }
}, { _id: false });

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
        minlength: 8,
        select: false,
        required: function() {
            // 如果沒有 OAuth 認證，則密碼為必填
            return !this.oauthProviders || this.oauthProviders.length === 0;
        }
    },
    oauthProviders: [oauthProviderSchema],
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
        type: { 
            detail: String 
        }
    },
    gender: {
        type: String,
        enum: ['男', '女', '雙性'],
        default: '雙性',
        required: [true, '性別未填寫']
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
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
userSchema.pre('save', async function(next) {
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    this.email = this.email.toLowerCase().trim();
    next();
});

// 新增方法：檢查是否使用特定 OAuth 提供者
userSchema.methods.hasOAuthProvider = function(provider) {
    return this.oauthProviders.some(oauth => oauth.provider === provider);
};

// 新增方法：新增 OAuth 提供者
userSchema.methods.addOAuthProvider = function(provider, providerId, accessToken, refreshToken, tokenExpiresAt) {
    const existingProvider = this.oauthProviders.find(oauth => oauth.provider === provider);
    if (existingProvider) {
        existingProvider.providerId = providerId;
        existingProvider.accessToken = accessToken;
        existingProvider.refreshToken = refreshToken;
        existingProvider.tokenExpiresAt = tokenExpiresAt;
    } else {
        this.oauthProviders.push({
            provider,
            providerId,
            accessToken,
            refreshToken,
            tokenExpiresAt
        });
    }
};

export default model('User', userSchema);
