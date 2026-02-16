const express = require("express");
const { userAuth } = require("../middlewares/auth");
const connectionModel = require("../model/connection");
const userModel = require("../model/user");
const router = express.Router();

const USER_SAFE_DATA = "firstName lastName photopath age gender about skills";

router.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const requestedDoc = await connectionModel
      .find({
        $and: [{ toUserId: loggedInUser._id, status: "interested" }],
      })
      .populate("fromUserId", USER_SAFE_DATA);
    // .populate("fromUserId", ["firstName","lastName","age","gender","skills"]);
    //const connectionRequests = requestedDoc.map((item) => item.fromUserId);
    res.json({
      success: true,
      data: requestedDoc,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInuser = req.user;
    //console.log(loggedInuser._id);
    const connections = await connectionModel
      .find({
        $and: [
          { status: "accepted" },
          {
            $or: [
              { fromUserId: loggedInuser._id },
              { toUserId: loggedInuser._id },
            ],
          },
        ],
      })
      .populate("fromUserId toUserId", USER_SAFE_DATA);

    const filteredConnectionData = connections.map((item) => {
      if (item.fromUserId._id.toString() === loggedInuser._id.toString()) {
        return item.toUserId;
      }
      if (item.toUserId._id.toString() === loggedInuser._id.toString()) {
        return item.fromUserId;
      }
    });

    res.json({
      success: true,
      data: filteredConnectionData,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/user/feeds", userAuth, async (req, res) => {
  /****
     1. not the loggedInUser
    2. already interested or ignored user
    3. already connected
    *** */

  try {
    //pagination code start
    const page = req.query.page || 1;
    let limit = req.query.limit || 10;
    limit = limit > 50 ? 50 : limit;
    const skipCount = (page - 1) * limit;

    //console.log("page:", page);
    //console.log("limit:", limit);

    //pagination code end
    const loggedInUser = req.user;
    const alreadyLinkedUsers = await connectionModel
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .select("fromUserId toUserId status");
    //.populate("fromUserId toUserId", USER_SAFE_DATA);

    const alreadyLinkedUserdId = new Set();
    alreadyLinkedUserdId.add(loggedInUser._id.toString()); //added the logged in user id
    alreadyLinkedUsers.forEach((item) =>
      alreadyLinkedUserdId
        .add(item.fromUserId.toString())
        .add(item.toUserId.toString()),
    );

    //console.log(alreadyLinkedUserdId);
    //console.log(Array.from(alreadyLinkedUserdId));

    //if loggedin user id not added in `alreadyLinkedUserdId` array.
    /* const feedUsers = await userModel
      .find({
        $and: [
          { _id: { $nin: Array.from(alreadyLinkedUserdId) } },
          { _id: { $ne: loggedInUser._id } },
        ],
      })
      .select(USER_SAFE_DATA); */

    const feedUsers = await userModel
      .find({
        _id: { $nin: Array.from(alreadyLinkedUserdId) },
      })
      .select(USER_SAFE_DATA)
      .skip(skipCount)
      .limit(limit);

    res.json({ success: true, data: feedUsers });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
