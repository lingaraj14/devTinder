const validator = require("validator");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const validateSignupData = (data) => {
  const { firstName, lastName, email, password } = data;
  if (!firstName || !lastName || !email || !password) {
    throw new Error("Required fields are missing!");
  } else if (firstName.length < 4 || firstName.length > 50) {
    throw new Error("First name length should be on length of 4 to 50");
  } else if (!validator.isEmail(email)) {
    throw new Error("Invalide email format!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong!");
  }
};

const validateProfileEditData = (data) => {
  const ALLOWED_UPDATES = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photopath",
    "about",
    "skills",
  ];
  const { firstName } = data;
  if (!Object.keys(data).every((el) => ALLOWED_UPDATES.includes(el))) {
    throw new Error("Update fails due to unexpected data!");
  }

  if (firstName && (firstName.length < 4 || firstName.length > 50)) {
    throw new Error("First name length should be on length of 4 to 50");
  }
  //Here we can add more validation rules
};

const validatePasswordChange = async (req) => {
  const { CurrentPassword, NewPassword } = req.body;
  const loggedInUser = req.user;
  const isValidOldPass = await bcrypt.compare(
    CurrentPassword,
    loggedInUser.password,
  );

  if (!isValidOldPass) {
    throw new Error("Current password is invalid!");
  }

  if (!validator.isStrongPassword(NewPassword)) {
    throw new Error("This is not a strong password!");
  }

  return await bcrypt.hash(NewPassword, 10);
};

const validateConnection = (status, toUserId) => {
  //validate status
  const ALLOWED_STATUS = ["interested", "ignored"];
  if (!ALLOWED_STATUS.includes(status)) {
    throw new Error(`${status} is not a valid status!`);
  }

  if (!mongoose.Types.ObjectId.isValid(toUserId)) {
    throw new Error("The receiver id is not valid.");
  }
};

const validateReviewConnection = (status, requestId) => {
  const ALLOWED_STATUS = ["accepted", "rejected"];
  if (!ALLOWED_STATUS.includes(status)) {
    throw new Error(`${status} is not a valid status!`);
  }
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new Error("The request id is not valid.");
  }
};

module.exports = {
  validateSignupData,
  validateProfileEditData,
  validatePasswordChange,
  validateConnection,
  validateReviewConnection,
};
