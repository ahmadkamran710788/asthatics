// controllers/doctorController.js
const Doctor = require('../model/doctor');
const Appointment = require('../model/appointment');
const Prescription = require('../model/prescription');
const Review = require('../model/review');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const Otp = require('../models/otp');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Doctor Authentication
const signin = async (req, res) => {
  try {
    console.log("signin");
    const { email, password } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ msg: "Invalid email format." });
    }
    
    const existingDoctor = await Doctor.findOne({ email });
    
    if (!existingDoctor) {
      return res.status(400).json({ msg: "Doctor with this email does not exist" });
    }
    
    const isMatch = await bcrypt.compare(password, existingDoctor.password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }
    
    const token = jwt.sign({ id: existingDoctor._id }, "passwordKey");
    res.json({ token, ...existingDoctor._doc });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const validateToken = async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.json(false);
    
    const verified = jwt.verify(token, 'passwordKey');
    if (!verified) return res.json(false);

    const doctor = await Doctor.findById(verified.id);
    if (!doctor) return res.json(false);

    res.json(true);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const getDoctorData = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user);
    res.json({ ...doctor._doc, token: req.token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



// Doctor Profile
const editProfile = async (req, res) => {
  const { id, name, description, phone } = req.body;

  const doctor = await Doctor.findOne({ _id: id });
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  doctor.name = name;
  doctor.description = description;
  doctor.phone = phone;

  await doctor.save();
  return res.status(200).json(doctor);
};

// Availability Management - New slot-based approach
const updateAvailabilitySlots = async (req, res) => {
  try {
    const { doctorId, date, slots } = req.body;
    
    // Validate the data
    if (!doctorId || !date || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    
    // Format date as YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    // Find the doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Validate each slot format (should be "HH:MM-HH:MM" representing 45-minute slots)
    const validSlots = slots.filter(slot => {
      const [start, end] = slot.split('-');
      return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(start) && 
             /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(end);
    });
    
    // Update the availability for the specified date
    doctor.availabilitySlots.set(formattedDate, validSlots);
    await doctor.save();
    
    res.status(200).json({ 
      message: 'Availability updated successfully',
      date: formattedDate,
      slots: validSlots
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAvailabilitySlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required' });
    }
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // If date is provided, return slots for that date
    if (date) {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const slots = doctor.availabilitySlots.get(formattedDate) || [];
      return res.status(200).json({ date: formattedDate, slots });
    }
    
    // Otherwise, return all availability data
    const availabilityData = {};
    for (const [date, slots] of doctor.availabilitySlots.entries()) {
      availabilityData[date] = slots;
    }
    
    res.status(200).json({ availabilityData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Appointment Management
const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required' });
    }

    const appointments = await Appointment.find({ doctorId })
      .populate({
        path: 'patientId',
        select: '_id name email phone'
      });

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching appointments.' });
  }
};

const getUpcomingAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required' });
    }
    
    const upcomingAppointments = await Appointment.find({
      status: 'pending',
      doctorId
    }).populate({
      path: 'patientId',
      select: '_id name email phone'
    });
    
    res.json(upcomingAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getCompletedAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required.' });
    }

    const completedAppointments = await Appointment.find({
      doctorId,
      status: 'completed',
    }).populate({
      path: 'patientId',
      select: '_id name email phone',
    });

    return res.status(200).json(completedAppointments);
  } catch (error) {
    console.error('Error fetching completed appointments:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { status, appointmentId } = req.body;

  try {
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the appointment status.' });
  }
};

// Prescription Management
const addPrescription = async (req, res) => {
  try {
    const { patient, doctor, appointment, prescription } = req.body;
    
    // Create a new Prescription document
    const newPrescription = new Prescription({
      patient,
      doctor,
      appointment,
      prescription,
    });

    // Save the new prescription to the database
    await newPrescription.save();

    // Update the appointment status to 'completed'
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointment,
      { status: 'completed' },
      { new: true }
    );

    res.status(200).json({ message: 'Prescription added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding the prescription' });
  }
};

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

// Reviews
const getAppointmentReview = async (req, res) => {
  try {
    const reviews = await Review.findOne({ appointment: req.params.id });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.id }).exec();
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const calculateAverageRating = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    // Fetch all reviews for the specified doctor
    const reviews = await Review.find({ doctor: doctorId });
    
    if (reviews.length === 0) {
      return res.json({ averageRating: 0 });
    }
    
    // Calculate the average star rating
    const totalStars = reviews.reduce((sum, review) => sum + parseInt(review.stars), 0);
    const averageRating = Math.round(totalStars / reviews.length);
    
    // Update the Doctor model with the calculated average rating
    await Doctor.findByIdAndUpdate(doctorId, { $set: { star: averageRating } });
    
    res.json({ averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  signin,
  validateToken,
  getDoctorData,
  editProfile,
  updateAvailabilitySlots,
  getAvailabilitySlots,
  getDoctorAppointments,
  getUpcomingAppointments,
  getCompletedAppointments,
  updateAppointmentStatus,
  addPrescription,
  getPrescription,
  getAppointmentReview,
  getAllDoctorReviews,
  calculateAverageRating
};