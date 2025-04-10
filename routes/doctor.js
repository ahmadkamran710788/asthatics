const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const verifyToken = require('../middleware/auth');

// Authentication routes
router.post('/signin', doctorController.signin);
router.post('/tokenIsValid', doctorController.validateToken);
router.get('/', verifyToken, doctorController.getDoctorData);

// Profile management
router.put('/edit-profile',verifyToken, doctorController.editProfile);

// Availability management
router.post('/update-availability',verifyToken, doctorController.updateAvailabilitySlots);
router.get('/get-availability',verifyToken, doctorController.getAvailabilitySlots);

// Appointment management

router.get('/get-appointments/:doctorId', verifyToken, doctorController.getDoctorAppointments);

router.get('/get-upcoming-appointments/:doctorId',verifyToken, doctorController.getUpcomingAppointments);
router.get('/get-completed-appointments/:doctorId', verifyToken, doctorController.getCompletedAppointments);
router.put('/update-appointment-status',verifyToken, doctorController.updateAppointmentStatus);

// Prescription management
router.post('/add-prescription',verifyToken, doctorController.addPrescription);
router.get('/get-prescription/:id',verifyToken, doctorController.getPrescription);

// Review management
router.get('/get-appointment-review/:id',verifyToken, doctorController.getAppointmentReview);
router.get('/all-reviews/:id',verifyToken, doctorController.getAllDoctorReviews);
router.get('/:doctorId/average-rating',verifyToken, doctorController.calculateAverageRating);

module.exports = router;
