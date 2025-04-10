// models/doctor.js
const mongoose = require('mongoose');
const validator = require('validator');

const doctorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "Please enter a valid email address",
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        return value.length >= 6;
      },
      message: "Enter a longer password (at least 6 characters)",
    },
  },
  description: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  specialization: {
    type: String,
    required: true,
  },
  medicalliecensenumber: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  // Availability slots by date - using Map type to store date-specific availability
  availabilitySlots: {
    type: Map,
    of: [String], // Array of time slots in "HH:MM" format for each date
    default: new Map()
  },
  star: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    default: 'Doctor',
  },
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;