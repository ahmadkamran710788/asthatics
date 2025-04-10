// models/patient.js
const mongoose = require('mongoose');
const validator = require('validator');

const patientSchema = mongoose.Schema({
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
  phone: {
    type: String,
    required: true,
  },
  medicalHistory: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'Patient',
  },
  // Note: Removed password field since patients don't need to sign up
});

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;