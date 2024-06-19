import ReviewModel from '../models/review.js';


const addReview = async (req, res) => {
  try {
      const { course, rating, comment } = req.body;
      console.log(req)
      const review = new ReviewModel({
          course,
          user: req.user.userId,
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