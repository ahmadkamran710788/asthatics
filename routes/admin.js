const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const adminController = require("../controllers/adminController");

// Admin Authentication Routes
router.post("/signup", adminController.signup);
router.post("/signin", adminController.signin);
router.post("/tokenIsValid", adminController.validateToken);
router.get("/", verifyToken, adminController.getAdminData);

// Doctor Management Routes
router.post("/add-doctor", adminMiddleware, adminController.addDoctor);
router.delete("/delete-doctor/:id", adminMiddleware, adminController.deleteDoctor);
router.get("/get-doctors", adminMiddleware, adminController.getDoctors);

// Patient Management Routes
router.post("/delete-patient", adminMiddleware, adminController.deletePatient);
router.get("/get-patients", adminMiddleware, adminController.getPatients);

// Password Reset Routes
// router.post("/forget-password", adminController.forgetPassword);
// router.post("/otp", adminController.verifyOtp);
// router.put("/reset-password", adminController.resetPassword);

module.exports = router;