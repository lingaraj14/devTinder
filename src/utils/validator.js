const validator = require("validator");

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

module.exports = {
  validateSignupData,
};
