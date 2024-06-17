import { Router } from 'express';
import { createAppointment, getAllAppointments, getAppointmentById, updateAppointment, deleteAppointment } from '../controllers/appointment.js';

const router = Router();


router.post('/appointments', createAppointment);
router.get('/appointments', getAllAppointments);
router.get('/appointments/:id', getAppointmentById);
router.put('/appointments/:id', updateAppointment);
router.delete('/appointments/:id', deleteAppointment);

export default router;