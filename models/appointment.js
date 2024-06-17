import mongoose from 'mongoose';

const { Schema } = mongoose;

const appointmentSchema = new Schema({
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User', // 假定 User 模型用於老師和學生
        required: true
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course', // 參考你的課程模型
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    teacherColor: {
        primary: { type: String, default: '#0000FF' }, // 主色
        secondary: { type: String, default: '#00FFFF' } // 次要色
    },
    studentColor: {
        primary: { type: String, default: '#FF0000' }, // 主色
        secondary: { type: String, default: '#FFC0CB' } // 次要色
    },
    notes: {
        type: String,
        maxlength: 500 // 允許老師或學生添加備註
    }
}, {
    timestamps: true // 自動添加創建和更新的時間戳
});

export default mongoose.model('Appointment', appointmentSchema);

