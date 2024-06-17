import Appointment from '../models/appointment.js';

const createAppointment = async (req, res) => {
  try {
      const { teacher, student, course, startTime, endTime, teacherColor, studentColor, notes } = req.body;
      const appointment = new Appointment({
          teacher,
          student,
          course,
          startTime,
          endTime,
          teacherColor,
          studentColor,
          notes
      });
      await appointment.save();
      res.status(201).json({ success: true, data: appointment });
  } catch (error) {
      res.status(400).json({ success: false, message: error.message });
  }
};
const getAllAppointments = async (req, res) => {
  try {
      const appointments = await Appointment.find().populate('teacher student course');
      res.status(200).json({ success: true, data: appointments });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};
const getAppointmentById = async (req, res) => {
  try {
      const appointment = await Appointment.findById(req.params.id).populate('teacher student course');
      if (!appointment) {
          return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      res.status(200).json({ success: true, data: appointment });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};
const updateAppointment = async (req, res) => {
  try {
      const { startTime, endTime, teacherColor, studentColor, notes } = req.body;
      const appointment = await Appointment.findByIdAndUpdate(req.params.id, {
          startTime,
          endTime,
          teacherColor,
          studentColor,
          notes
      }, { new: true, runValidators: true });

      if (!appointment) {
          return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      res.status(200).json({ success: true, data: appointment });
  } catch (error) {
      res.status(400).json({ success: false, message: error.message });
  }
};
const deleteAppointment = async (req, res) => {
  try {
      const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
      if (!deletedAppointment) {
          return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};

export { createAppointment, getAllAppointments, getAppointmentById, updateAppointment, deleteAppointment };