// controllers/patientController.js
const Patient = require('../model/patient');
const Doctor = require('../model/doctor');
const Appointment = require('../model/appointment');
const Prescription = require('../model/prescription');
const Review = require('../model/review');
const validator = require('validator');

// Get all doctors
const getDoctors = async (req, res) => {
  console.log("GET doctors");
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Search doctors by name
const searchDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      name: { $regex: req.params.name, $options: "i" },
    });
    res.json(doctors);
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ error: e.message });
  }
};

// Get available slots for a doctor on a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { date, doctorId } = req.params;
    
    if (!date || !doctorId) {
      return res.status(400).json({ error: 'Date and doctorId are required' });
    }

    // Format date as YYYY-MM-DD for consistent key in the Map
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    // Find the doctor
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Get available slots for the date from doctor's availabilitySlots map
    const availableSlots = doctor.availabilitySlots.get(formattedDate) || [];

    // Get already booked appointments for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctorId,
      date: formattedDate,
      status: { $ne: 'cancelled' } // Exclude cancelled appointments
    });

    // Extract booked time slots
    const bookedSlots = bookedAppointments.map(appointment => appointment.slot);
    
    // Filter out booked slots
    const remainingSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

    return res.status(200).json({ availableSlots: remainingSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Book an appointment (replaces signup & creates patient if needed)
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, slot, patientName, patientEmail, patientPhone, medicalHistory } = req.body;
    
    // Validate required fields
    if (!doctorId || !date || !slot || !patientName || !patientEmail || !patientPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email
    if (!validator.isEmail(patientEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Format date as YYYY-MM-DD for consistency
    const formattedDate = new Date(date).toISOString().split('T')[0];

    // Check if the slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: formattedDate,
      slot,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'Slot already booked' });
    }

    // Find or create patient
    let patient = await Patient.findOne({ email: patientEmail });
    
    if (!patient) {
      // Create new patient
      patient = new Patient({
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        medicalHistory: medicalHistory || ''
      });
      await patient.save();
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: patient._id,
      doctorId,
      date: formattedDate,
      slot,
      patientName,
      patientEmail,
      patientPhone,
      medicalHistory: medicalHistory || ''
    });

    await appointment.save();
    return res.status(200).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get patient's upcoming appointments
const getUpcomingAppointments = async (req, res) => {
  try {
    const { patientEmail } = req.body;
    
    // Find patient by email
    const patient = await Patient.findOne({ email: patientEmail });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Find upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patientId: patient._id,
      status: 'pending'
    }).populate({
      path: 'doctorId',
      select: '_id name specialization'
    });
    
    res.json(upcomingAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get patient's completed appointments
const getCompletedAppointments = async (req, res) => {
  try {
    const { patientEmail } = req.body;
    
    // Find patient by email
    const patient = await Patient.findOne({ email: patientEmail });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Find completed appointments
    const completedAppointments = await Appointment.find({
      patientId: patient._id,
      status: 'completed'
    }).populate({
      path: 'doctorId',
      select: '_id name specialization'
    });
    
    res.json(completedAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get prescription for an appointment
const getPrescription = async (req, res) => {
  try {
    const id = req.params.id;
    const prescription = await Prescription.findOne({ appointment: id });
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found for the given appointment ID' });
    }
    
    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a review
const addReview = async (req, res) => {
  const { patient, doctor, appointment, stars, content } = req.body;
  try {
    // Create a new review
    const review = new Review({
      patient,
      doctor,
      appointment,
      stars,
      content,
    });

    // Save the review
    await review.save();

    // Update the appointment's reviewGiven field to true
    await Appointment.findOneAndUpdate(
      { _id: appointment },
      { $set: { reviewGiven: true } }
    );

    res.status(200).json({ message: 'Review posted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while posting the review' });
  }
};

// Get all reviews for a doctor
const getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.id });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDoctors,
  searchDoctors,
  getAvailableSlots,
  bookAppointment,
  getUpcomingAppointments,
  getCompletedAppointments,
  getPrescription,
  addReview,
  getDoctorReviews
};