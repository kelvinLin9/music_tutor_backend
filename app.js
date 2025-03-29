import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';

// 引入路由
import userRouter from './routes/user.js';
import courseRouter from './routes/course.js';
import verifyRouter from './routes/verify.js';
import uploadRouter from './routes/upload.js';
import couponRouter from './routes/coupon.js';
import orderRouter from './routes/order.js';
import courseReviewRouter from './routes/courseReview.js';
import appointmentRouter from './routes/appointment.js';
import homeworkRouter from './routes/homework.js';
import materialRouter from './routes/material.js';
import teacherAvailabilityRouter from './routes/teacherAvailability.js';

// 管理員路由
import adminUserRouter from './routes/admin/user.js';

const app = express();

// 未捕獲的異常處理
process.on('uncaughtException', (err) => {
  console.error('未捕獲的異常:', err);
  process.exit(1);
});

// 未處理的 Promise 拒絕處理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise 拒絕:', promise, '原因:', reason);
});

// 資料庫連接
mongoose.connect(`mongodb+srv://kelvin80121:${process.env.DB_CONNECTION_STRING}@data.vgi0fxb.mongodb.net/data`)
  .then(() => console.log("資料庫連接成功"))
  .catch(err => console.log("資料庫連接失敗:", err));

// 中間件設置
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// API 路由
app.use('/api/users', userRouter);
app.use('/api/courses', courseRouter);
app.use('/api/verify', verifyRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/orders', orderRouter);
app.use('/api/course-reviews', courseReviewRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/homework', homeworkRouter);
app.use('/api/materials', materialRouter);
app.use('/api/teacher-availability', teacherAvailabilityRouter);

// 管理員路由
app.use('/api/admin/users', adminUserRouter);

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.log('process.env.NODE_ENV', process.env.NODE_ENV)
  const isDevelopment = process.env.NODE_ENV === 'development';
  const statusCode = err.status || 500;

  if (isDevelopment) {
    res.status(statusCode).json({
      success: false,
      error: {
        message: err.message,
        stack: err.stack
      }
    });
  } else {
    res.status(statusCode).json({
      success: false,
      message: '系統發生錯誤'
    });
  }
});

// 404 處理中間件
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '找不到該資源'
  });
});

export default app;
