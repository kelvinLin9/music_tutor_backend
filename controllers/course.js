import Course from '../models/course.js';
import User from '../models/user.js';
import createHttpError from 'http-errors';

export const createCourse = async (req, res, next) => {
  try {
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

export const getCourseByID = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name')
      .populate('reviews')
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

export const getCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    let filterBy = req.query.filterBy ? JSON.parse(req.query.filterBy) : {};

    // 處理特定作者（instructor）的查詢
    const instructorId = req.query.instructorId;
    if (instructorId) {
      filterBy.instructor = instructorId;
    }

    // 處理課程類別（category）的查詢
    if (req.query.category) {
      filterBy.category = req.query.category;
    }

    // 處理上課地點（place）的查詢
    if (req.query.place) {
      filterBy.place = req.query.place;
    }

    // 處理上課模式（mode）的查詢
    if (req.query.mode) {
      filterBy.mode = req.query.mode;
    }

    // 處理課程名稱（name）的查詢
    if (req.query.name) {
      filterBy.name = { $regex: req.query.name, $options: 'i' }; // 使用正則表達式進行模糊搜索，不區分大小寫
    }

    const skip = (page - 1) * limit;

    // 構建排序對象
    let sortObject = {};
    if (sortBy === '依人氣') {
      sortObject = { 'students.length': sortOrder };
    } else if (sortBy === '依價格') {
      sortObject = { price: sortOrder };
    } else if (sortBy === '依評價') {
      sortObject = { averageRating: sortOrder };
    } else {
      sortObject = { [sortBy]: sortOrder };
    }

    const [courses, totalItems] = await Promise.all([
      Course.find(filterBy)
            .populate('instructor', 'name')
            .sort(sortObject)
            .limit(limit)
            .skip(skip)
            .exec(),
      Course.countDocuments(filterBy)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    // 計算是否有上一頁和下一頁
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    res.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
        hasPrevPage,
        hasNextPage
      }
    });
  } catch (error) {
    next(error);
  }
};


