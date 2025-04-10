// index.js (main routes file)
const express = require("express");
const router = express.Router();
const contactUsRoutes = require("./contactUs");
const doctorRouter = require("./doctor");
const patientRouter = require("./patient");
const adminRouter = require("./admin");

router.use("/contact-us", contactUsRoutes);
router.use("/doctor", doctorRouter);
router.use("/patient", patientRouter);
router.use("/admin", adminRouter);

module.exports = router;