const jwt = require("jsonwebtoken");
const userModel = require("../model/user");

const userAuth = async (req, res, next) => {
  try {
    if (!req.cookies.token) {
      //throw new Error("Invalid token!");
      return res.status(401).json({
        success: false,
        message: "Invalid token!",
      });
    }

    const { token } = req.cookies;

    const cookies = await jwt.verify(token, "Lingaraj@Tech4");
    const { _id } = cookies;

    const userDoc = await userModel.findById(_id);
    if (!userDoc) {
      throw new Error("User not found!");
    }
    req.user = userDoc;
    next();
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  userAuth,
};
