import dotenv from 'dotenv';
dotenv.config();
import createError from 'http-errors';
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

const app = express();

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

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // As the view engine is not set, the error page rendering is disabled.
  res.status(err.status || 500);
  res.json({ error: err.message }); // Directly return JSON for errors.
});

export default app;
