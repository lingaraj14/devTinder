const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");
const {
  validateProfileEditData,
  validatePasswordChange,
} = require("../utils/validator");
const userModel = require("../model/user");

router.post("/profile/view", userAuth, async (req, res) => {
  try {
    const { password, ...response } = req.user.toObject();
    res.json(response);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

router.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateProfileEditData(req.body);
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((el) => (loggedInUser[el] = req.body[el]));
    const updatedDoc = await loggedInUser.save();

    //Remove password filed while sending response to user
    const { password, ...responseUser } = updatedDoc.toObject();

    res.json({
      success: true,
      message: "Profile updated successfully!",
      data: responseUser,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

router.patch("/profile/change-password", userAuth, async (req, res) => {
  try {
    const passwordHash = await validatePasswordChange(req);
    const updatedDoc = await userModel.findByIdAndUpdate(req.user._id, {
      password: passwordHash,
    });
    if (!updatedDoc) {
      throw new Error("Password change failed!");
    }
    res.json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
