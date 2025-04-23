const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const verifyToken = require('../middleware/auth');

// Doctor listing routes
router.get('/get-doctors', patientController.getDoctors);
router.get('/doctor/search/:name', patientController.searchDoctors);

// Appointment booking routes
router.get('/get-available-slots/:doctorId/:date', patientController.getAvailableSlots);
router.post('/book-appointment', patientController.bookAppointment);

// Appointment management routes
router.post('/all-appointments', patientController.getAllAppointments);
router.post('/upcoming-appointments', patientController.getUpcomingAppointments);
router.post('/completed-appointments', patientController.getCompletedAppointments);
router.get('/get-prescription/:id', patientController.getPrescription);

// Review routes
router.post('/add-review', patientController.addReview);
router.get('/get-doctor-reviews/:id', patientController.getDoctorReviews);

module.exports = router;
