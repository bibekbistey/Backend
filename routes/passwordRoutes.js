const express = require("express");
const {
  
  resetPassword,
  requestPasswordReset,
} = require("../controllers/forgetpassCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

//router onject
const router = express.Router();


router.post(
  "/password-recovery",requestPasswordReset
  
);
router.post(
  "/password-recovery/:token",  resetPassword
);

module.exports = router;
