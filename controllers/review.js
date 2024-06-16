import ReviewModel from '../models/order.js';


const addReview = async (req, res) => {
  try {
      const { course, rating, comment } = req.body;
      const review = new ReviewModel({
          course,
          user: req.user._id, // 假設用戶ID從認證中獲取
          rating,
          comment
      });
      await review.save();
      res.status(201).json({ success: true, data: review });
  } catch (error) {
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
          return res.status(404).json({ success: false, message: 'ReviewModel not found' });
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
          return res.status(404).json({ success: false, message: 'ReviewModel not found' });
      }
      res.status(200).json({ success: true, data: review });
  } catch (error) {
      res.status(400).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
      const review = await Review.findByIdAndDelete(req.params.id);
      if (!review) {
          return res.status(404).json({ success: false, message: 'Review not found' });
      }
      res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  addReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview
};