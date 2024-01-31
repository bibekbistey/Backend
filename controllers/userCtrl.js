const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");


const registerController = async (req, res) => {
  try {
    // Check if required fields are empty
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({ message: "Email and password are required", success: false });
    }

    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({ message: "User Already Exists", success: false });
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Registered Successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};




const loginController = async (req, res) => {
  const MAX_FAILED_LOGIN_ATTEMPTS = 3;
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .json({ message: "User not found", success: false });
    }

    if (user.accountLocked) {
      // Check if it's time to unlock the account
      const lockoutDurationMillis = Date.now() - user.lastFailedLoginAttempt;
      const lockoutDurationMinutes = lockoutDurationMillis / (60 * 1000); // convert to minutes

      // Adjust the lockout duration as needed (e.g., 5 minutes instead of 2)
      const newLockoutDurationMinutes = 2;

      if (lockoutDurationMinutes >= newLockoutDurationMinutes) {
        // Unlock the account
        user.accountLocked = false;
        user.failedLoginAttempts = 0;
        await user.save();
      } else {
        // Account is still locked
        return res.status(200).json({ message: `Account is locked. Please try again after ${newLockoutDurationMinutes} minutes.`,success:false });
      }
    }
    // if (user.accountLocked) {
    //   return res.status(200).json({ message: "Account is locked. Please contact support.", success: false });
    // }


    const isMatch = await bcrypt.compare(req.body.password, user.password);
    // if (!isMatch) {

      
    //   return res
    //     .status(200)
    //     .json({ message: "Invalid Email or Password", success: false,data: req.body });
    // }

    if (!isMatch) {
      // Update failed login attempts and timestamp
      user.failedLoginAttempts += 1;
      user.lastFailedLoginAttempt = new Date();

      // Lock the account if the maximum attempts are reached
      if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        user.accountLocked = true;
      }

      await user.save();

      return res.status(200).json({
        message: "Invalid Email or Password",
        success: false,
        data: req.body,
      });
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lastFailedLoginAttempt = null;
    user.accountLocked = false;
    await user.save();

    // Generate and send JWT token on successful login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    
    res.status(200).json({ message: "Login Success", success: true, token,  });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Error in Login CTRL ${error.message}` });
  }
};





// update passowrd
const updatePasswordController = async (req, res) => {
  console.log("Request Body:", req.body);
  try {
    const { oldPassword, newPassword, userId } = req.body;
    // const userId = req.body.userid;
    console.log("User ID:", userId); // Assuming you have middleware to extract user information from the token

    // Fetch user by ID
    const user = await userModel.findById({_id:userId});

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Check if the provided old password matches the stored password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(200).json({ message: "Old password is incorrect", success: false });
    }

    // Check if the new password is the same as the old password
    if (oldPassword === newPassword) {
      return res.status(200).json({ message: "New password must be different from the old password", success: false });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedNewPassword;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "Password updated successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error in Update Password CTRL: ${error.message}`, success: false });
  }
};



// Get user Info

const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

// APpply DOctor CTRL
const applyDoctorController = async (req, res) => {
  try {
    console.log("Request Body:", req.body); 
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();
    console.log("New Doctor:", newDoctor); 
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notifcation = adminUser.notifcation;
    notifcation.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/docotrs",
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error WHile Applying For Doctotr",
    });
  }
};
// const applyDoctorController = async (req, res) => {
//   try {
//     const newDoctor = await doctorModel({ ...req.body, status: "pending" });
//     await newDoctor.save();
//     const adminUser = await userModel.findOne({ isAdmin: true });
//     const notification = adminUser.notification; // Fix the typo here
//     notification.push({
//       type: "apply-doctor-request",
//       message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
//       data: {
//         doctorId: newDoctor._id,
//         name: newDoctor.firstName + " " + newDoctor.lastName,
//         onClickPath: "/admin/doctors", // Fix the typo in the URL path as well (docotrs -> doctors)
//       },
//     });
//     await userModel.findByIdAndUpdate(adminUser._id,); // Fix the property name here
//     res.status(201).send({
//       success: true,
//       message: "Doctor Account Applied Successfully",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       error,
//       message: "Error While Applying For Doctor",
//     });
//   }
// };


//notification ctrl
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notifcation = user.notifcation;
    seennotification.push(...notifcation);
    user.notifcation = [];
    user.seennotification = notifcation;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

// delete notifications
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notifcation = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete all notifications",
      error,
    });
  }
};

//GET ALL DOC
const getAllDocotrsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Docots Lists Fetched Successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Errro WHile Fetching DOcotr",
    });
  }
};

//BOOK APPOINTMENT
/* istanbul ignore next */
const bookeAppointmnetController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    /* istanbul ignore next */
    const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
    // user.notifcation.push({
    //   type: "New-appointment-request",
    //   message: `A nEw Appointment Request from ${req.body.userInfo.name}`,
    //   onCLickPath: "/user/appointments",
    // });
    // await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Book succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Booking Appointment",
    });
  }
};

// booking bookingAvailabilityController
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not Availibale at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
      });
    }
  } catch (error) {
    /* istanbul ignore next */
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};

const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: appointments,
    });
  } catch (error) {
    // message: "Users Appointments Fetch SUccessfully",
    /* istanbul ignore next */
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
};

module.exports = {
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
};
