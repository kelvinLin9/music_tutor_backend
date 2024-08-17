import ReviewModel from '../models/review.js';
import CourseModel from '../models/course.js';

const addReview = async (req, res) => {
  try {
      const { course, rating, comment } = req.body;
      const review = new ReviewModel({
          course,
          user: req.user.userId, // 假設用戶ID從認證中獲取
          rating,
          comment
      });

      const savedReview = await review.save();

      
      await CourseModel.findByIdAndUpdate(course, {
          $push: { reviews: savedReview._id } 
      });
      // console.log(course)
      res.status(201).json({ success: true, data: savedReview });
  } catch (error) {
      // console.log(error);
      res.status(400).json({ success: false, message: error.message });
  }
};


const getReviews = async (req, res) => {
  try {
      const reviews = await ReviewModel.find({ course: req.params.courseId }).populate('user', 'name');
      res.status(200).json({ success: true, data: reviews });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};


const getReview = async (req, res) => {
  try {
      const review = await ReviewModel.findById(req.params.id).populate('user', 'name');
      if (!review) {
          return res.status(404).json({ success: false, message: 'Review not found' });
      }
      res.status(200).json({ success: true, data: review });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
      const { rating, comment } = req.body;
      const review = await ReviewModel.findByIdAndUpdate(req.params.id, {
          rating, 
          comment
      }, { new: true, runValidators: true });

      if (!review) {
          return res.status(404).json({ success: false, message: 'Review not found' });
      }
      res.status(200).json({ success: true, data: review });
  } catch (error) {
      res.status(400).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
      const review = await ReviewModel.findByIdAndDelete(req.params.id);
      if (!review) {
          return res.status(404).json({ success: false, message: 'Review not found' });
      }
      res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};

export {
  addReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview
};