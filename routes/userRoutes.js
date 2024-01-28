const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDocotrsController,
  bookeAppointmnetController,
  bookingAvailabilityController,
  userAppointmentsController,
  updatePasswordController,
  resetPassword,
  requestPasswordReset,
} = require("../controllers/userCtrl");
const forgetpassCtrl = require("../controllers/forgetpassCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

//router onject
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

// update password
router.post("/update-password", authMiddleware, updatePasswordController);

//Auth || POST
router.post("/getUserData", authMiddleware, authController);

//APply Doctor || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);

//Notifiaction  Doctor || POST
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);
//Notifiaction  Doctor || POST
router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);

//GET ALL DOC
router.get("/getAllDoctors", authMiddleware, getAllDocotrsController);

//BOOK APPOINTMENT
router.post("/book-appointment", authMiddleware, bookeAppointmnetController);

//Booking Avliability
router.post(
  "/booking-availbility",
  authMiddleware,
  bookingAvailabilityController
);


//Appointments List
router.get("/user-appointments", authMiddleware, userAppointmentsController);

router.post(
  "/password-recovery",forgetpassCtrl.requestPasswordReset
  
);
router.post(
  "/password-recovery/:token",forgetpassCtrl.resetPassword
);

module.exports = router;
