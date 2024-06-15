import Course from '../models/course.js';
import createHttpError from 'http-errors';

export const createCourse = async (req, res, next) => {
  try {
    // 確保請求中包含 instructor ID
    if (!req.body.instructor) {
      throw new Error('Instructor ID is required');
    }

    const course = new Course(req.body);
    await course.save();

    // 可選：更新用戶模型以添加這個課程的參考
    await User.findByIdAndUpdate(req.body.instructor, {
      $push: { courses: course._id }
    });

    res.status(201).json(course);
  } catch (error) {
    next(createHttpError(400, error.message));
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name') // 關聯載入授課教師的姓名
      .exec();

    if (!course) throw createHttpError(404, '課程未找到');
    res.json(course);
  } catch (error) {
    next(error);
  }
};


export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) throw createHttpError(404, '課程未找到');
    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) throw createHttpError(404, '課程未找到');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({})
      .populate('instructor', 'name') // 在每個課程中關聯載入授課教師的姓名
      .exec();

    res.json(courses);
  } catch (error) {
    next(error);
  }
};


// export const getAllCourses = async (req, res, next) => {
//   try {
//     const courses = await Course.find({});
//     res.json(courses);
//   } catch (error) {
//     next(error);
//   }
// };
