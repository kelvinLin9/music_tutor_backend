import mongoose from 'mongoose';

const { Schema } = mongoose;

const reviewSchema = new Schema({
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: false,
        maxlength: 500
    }
}, {
    timestamps: true // 自動添加 createdAt 和 updatedAt 時間戳
});

export default mongoose.model('Review', reviewSchema);
