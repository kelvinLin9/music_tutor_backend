import OrderModel from '../models/order.js';
import createHttpError from 'http-errors';

const createOrder = async (req, res) => {
  try {
      const { user, items, totalAmount, paymentMethod, couponUsed, userNotes } = req.body;
      const order = new OrderModel({
          user,
          items,
          totalAmount,
          paymentMethod,
          couponUsed,
          userNotes
      });
      await order.save();
      res.status(201).json({ success: true, data: order });
  } catch (error) {
      res.status(400).json({ success: false, message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
      const orders = await OrderModel.find()
                                .populate({
                                    path: 'items.product',
                                    model: 'Course', // 確保你的課程模型名稱與此相符
                                    select: 'name description price' // 只選擇需要的課程字段
                                })
                                .populate('user', 'name email'); // 同時填充用戶資訊

      res.status(200).json({ success: true, data: orders });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};



const getOrder = async (req, res) => {
  try {
      const order = await OrderModel.findById(req.params.id)
                               .populate({
                                   path: 'items.product',
                                   model: 'Course', // 確保你的課程模型名稱與此相符
                                   select: 'name description price' // 只選擇需要的課程字段
                               })
                               .populate('user', 'name email'); // 同時填充用戶資訊，選擇性填充字段如姓名和郵箱

      if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.status(200).json({ success: true, data: order });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};



const updateOrder = async (req, res) => {
  try {
      const { totalAmount, paymentStatus, paymentMethod, couponUsed, userNotes } = req.body;
      const order = await OrderModel.findByIdAndUpdate(req.params.id, {
          totalAmount, 
          paymentStatus, 
          paymentMethod, 
          couponUsed, 
          userNotes
      }, { new: true, runValidators: true });
      
      if (!order) {
          return res.status(404).json({ success: false, message: 'OrderModel not found' });
      }
      res.status(200).json({ success: true, data: order });
  } catch (error) {
      res.status(400).json({ success: false, message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
      const order = await OrderModel.findByIdAndDelete(req.params.id);
      if (!order) {
          return res.status(404).json({ success: false, message: 'OrderModel not found' });
      }
      res.status(200).json({ success: true, message: 'OrderModel deleted successfully' });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder
}