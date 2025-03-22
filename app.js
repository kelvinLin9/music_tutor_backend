import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';


// import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import courseRouter from './routes/course.js';
import verifyRouter from './routes/verify.js';
import uploadRouter from './routes/upload.js';
import couponRouter from './routes/coupon.js';
import orderRouter from './routes/order.js';
import reviewRouter from './routes/review.js';
import appointmentRouter from './routes/appointment.js';

// admin
import adminUsersRouter from './routes/admin/users.js';

const app = express();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception: ', err);
  // 記錄錯誤後，進行重啟或終止程序，取決於應用程式需求
  process.exit(1); // 退出程序
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 處理邏輯，例如記錄錯誤或發送警報
});


mongoose.connect(`mongodb+srv://kelvin80121:${process.env.DB_CONNECTION_STRING}@data.vgi0fxb.mongodb.net/data`)
  .then(res=> console.log("連線資料成功"))
  .catch(err=> console.log("連線資料失敗"));




app.use(helmet()); // 增加安全的HTTP headers
app.use(cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/courses', courseRouter);
app.use('/users', usersRouter);
app.use('/verify', verifyRouter);
app.use('/upload', uploadRouter);
app.use('/coupons', couponRouter);
app.use('/orders', orderRouter);
app.use('/reviews', reviewRouter);
app.use('/appointments', appointmentRouter);
// admin
app.use('/admin/users', adminUsersRouter);


app.use((err, req, res, next) => {
  console.log('process.env.NODE_ENV', process.env.NODE_ENV)
  const isDevelopment = process.env.NODE_ENV === 'development';
  const statusCode = err.status || 500;

  // 如果是開發環境，返回詳細的錯誤信息
  if (isDevelopment) {
      res.status(statusCode).json({
          success: false,
          error: {
              message: err.message,
              stack: err.stack
          }
      });
  } else {
      // 在生產環境中，隱藏錯誤細節，返回通用錯誤信息
      res.status(statusCode).json({
          success: false,
          message: err.message
      });
  }
});

// 修正404 Not Found中間件
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

export default app;
