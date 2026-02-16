const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");
const connectionModel = require("../model/connection");
const userModel = require("../model/user");
const {
  validateConnection,
  validateReviewConnection,
} = require("../utils/validator");

router.post("/connection/:status/:userId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.userId;
    const status = req.params.status;

    validateConnection(status, toUserId);

    //check user exist
    const toUserDoc = await userModel.findById(toUserId);
    if (!toUserDoc) {
      throw new Error("User doesn't exist!");
    }

    //check connection exists
    const existingConnection = await connectionModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnection) {
      throw new Error("This connection already exists!");
    }

    const connection = new connectionModel({ fromUserId, toUserId, status });
    const connectionDoc = await connection.save();

    if (connectionDoc) {
      const message =
        status === "interested"
          ? `${req.user.firstName} showing interest to ${toUserDoc.firstName}`
          : `${req.user.firstName} ignored to ${toUserDoc.firstName}`;
      return res.json({
        success: true,
        message,
      });
    } else {
      throw new Error("Connection failed!");
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

router.post(
  "/connection/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const requestId = req.params.requestId;
      const status = req.params.status;

      validateReviewConnection(status, requestId);

      //If a valid request
      const connectionDoc = await connectionModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionDoc) {
        throw new Error("Connection doesn't exist.");
      }

      connectionDoc.status = status;
      const updatedDoc = await connectionDoc.save();

      return res.json({
        success: true,
        message: "Connection accepted!",
        data: updatedDoc,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  },
);

module.exports = router;
