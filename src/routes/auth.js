const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../model/user");
const { validateSignupData } = require("../utils/validator");
const router = express.Router();

//User signup/registration
router.post("/signup", async (req, res) => {
  try {
    validateSignupData(req.body);
    const { firstName, lastName, email } = req.body;

    //password hashing
    const hashPassword = await bcrypt.hash(req.body.password, 10);

    const userData = {
      firstName,
      lastName,
      email,
      password: hashPassword,
    };
    const userDoc = new userModel(userData);
    const savedUser = await userDoc.save();

    const token = await savedUser.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1 * 3600000), // cookie will be removed after 1 hours
    });

    const { password, ...response } = savedUser.toObject();
    res.json(response);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    //check email in DB
    const isUser = await userModel.findOne({ email });
    //console.log(isUser);
    if (!isUser) {
      throw new Error("Invalid credentials!");
    }

    //match password
    const isMatch = await bcrypt.compare(req.body.password, isUser.password);
    if (!isMatch) {
      throw new Error("Invalid credentials!");
    }

    //Token generate
    //Instead of getnerating the token code here, we can write this is Schema label and call here(it would be more readable and good)
    /* const token = await jwt.sign({ _id: isUser._id }, "Lingaraj@Tech4", {
      expiresIn: "1h",
    }); //`expiresIn` parameter is optional */

    const token = await isUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 1 * 3600000), // cookie will be removed after 1 hours
    });

    const { password, ...response } = isUser.toObject();

    res.json(response);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/logout", (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .send("Logout successfully!!");
});

//Get single user data. This is not used now, keep for reference purposes
/* router.get("/user", async (req, res) => {
  try {
    const userDoc = await userModel.find({ email: req.body.email }); //it will return array
    //const userDoc = await userModel.findOne({ email: req.body.email });  //it will return object
    console.log(userDoc);
    if (userDoc.length > 0) {
      res.send(userDoc);
    } else {
      res.send({ success: false, message: "No user found!" });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}); */

//Delete user by only using useId. This is not used now, keep for reference purposes
/* router.delete("/user", async (req, res) => {
  try {
    const userId = req.body.userId;
    await userModel.findByIdAndDelete(userId);
    res.send({ success: true, message: "User deleted successfully!" });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}); */

//Delete user by using useId or email. This is not used now, keep for reference purposes
/* router.delete("/user", async (req, res) => {
  try {
    const deletedDoc = await userModel.findOneAndDelete({ _id: req.body.id });
    if (deletedDoc) {
      //if record delete it will return the deleted document object, else return null
      res.send({ success: true, message: "User deleted successfully!" });
    } else {
      res.status(400).json({
        success: false,
        message: "Delete fails!",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}); */

/*
Delete Notes: 
1. `findByIdAndDelete` method delete the document only by `id` and `findOneAndDelete` method delete the document by any field.
2. `findByIdAndDelete` method behind the sceen using `findOneAndDelete` to do the delete operation.
*/

//Update the user. This is not used now, keep for reference purposes
/* router.patch("/user/:userId", async (req, res) => {
  try {
    const userId = req.params?.userId;
    const data = req.body;
    const ALLOWED_UPDATES = [
      "firstName",
      "lastName",
      "password",
      "age",
      "gender",
      "photopath",
      "skills",
    ];
    if (!Object.keys(data).every((el) => ALLOWED_UPDATES.includes(el))) {
      throw new Error("Update fails due to unexpected data!");
    }
    const updatedDoc = await userModel.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true,
    });
    console.log(updatedDoc);
    if (updatedDoc) {
      res.send({
        success: true,
        message: "Data updated successfully!",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Update fails!",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}); */

/**
 Update Nodes:
 1. In `findByIdAndUpdate` method the third parameter is an object ({returnDocument: "after"}). And the update method will return the document based on the parameter. Please check running the code
 */

module.exports = router;
