// controllers/adminController.js
const Admin = require("../model/admin");
const Doctor = require("../model/doctor");
const Patient = require("../model/patient");
// const Otp = require("../models/otp");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Admin Authentication
const signup = async (req, res) => {
  try {
    console.log("signup");
    const { name, email, password } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ msg: "Invalid email format." });
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res
        .status(400)
        .json({ msg: "Admin with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    let newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    const savedAdmin = await newAdmin.save();

    res.json(savedAdmin);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const signin = async (req, res) => {
  try {
    console.log("signin");
    const { email, password } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ msg: "Invalid email format." });
    }
    const existingAdmin = await Admin.findOne({ email });

    if (!existingAdmin) {
      return res
        .status(400)
        .json({ msg: "Admin with is email doesnot exist " });
    }
    const isMatch = await bcrypt.compare(password, existingAdmin.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }
    const token = jwt.sign({ id: existingAdmin._id }, "passwordKey");
    res.json({ token, ...existingAdmin._doc });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const validateToken = async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, "passwordKey");
    if (!verified) return res.json(false);

    const admin = await Admin.findById(verified.id);
    if (!admin) return res.json(false);

    res.json(true);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const getAdminData = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user);

    res.json({ ...admin._doc, token: req.token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Doctor Management
const addDoctor = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      description,
      phone,
      specialization,
      medicalliecensenumber,
      gender,
    } = req.body;
    console.log("add doctor");

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ msg: "Invalid email format." });
    }

    const existingDoctor = await Doctor.findOne({ email });

    if (existingDoctor) {
      return res
        .status(400)
        .json({ msg: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    let doctor = new Doctor({
      email,
      password: hashedPassword,
      name,
      description,
      phone,
      specialization,
      medicalliecensenumber,
      gender,
    });
    doctor = await doctor.save();
    res.json(doctor);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found." });
    }

    res.json({ msg: "Doctor deleted successfully", doctor });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getDoctors = async (req, res) => {
  console.log("GET doctor");
  try {
    const doctors = await Doctor.find({});

    res.json(doctors);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Patient Management
const deletePatient = async (req, res) => {
  try {
    const { id } = req.body;
    let patient = await Patient.findByIdAndDelete(id);

    res.json(patient);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getPatients = async (req, res) => {
  console.log("GET patient");
  try {
    const patient = await Patient.find({});
    console.log(2);
    res.json(patient);
    console.log(3);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};




module.exports = {
  signup,
  signin,
  validateToken,
  getAdminData,
  addDoctor,
  deleteDoctor,
  getDoctors,
  deletePatient,
  getPatients,

};