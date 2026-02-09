const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/database");
const userModel = require("./model/user");
const { validateSignupData } = require("./utils/validator");
const { userAuth } = require("./middlewares/auth");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

//User signup/registration
app.post("/signup", async (req, res) => {
  try {
    validateSignupData(req.body);
    const { firstName, lastName, email, password } = req.body;

    //password hashing
    const hashPassword = await bcrypt.hash(password, 10);

    const userData = {
      firstName,
      lastName,
      email,
      password: hashPassword,
    };
    const userDoc = new userModel(userData);
    await userDoc.save();
    res.json({
      success: true,
      message: "user saved successfully!",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    //check email in DB
    const isUser = await userModel.findOne({ email });
    //console.log(isUser);
    if (!isUser) {
      throw new Error("Invalid credentials!");
    }

    //match password
    const isMatch = await bcrypt.compare(password, isUser.password);
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

    res.send({
      success: true,
      message: "Login successfull!",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

//Get single user data
app.get("/user", async (req, res) => {
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
});

app.post("/profile", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

app.post("/send-connection", userAuth, async (req, res) => {
  try {
    res.send({
      success: true,
      message: `${req.user.firstName} sent a connection request!`,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

//Get all user data
app.get("/feeds", async (req, res) => {
  try {
    const userDoc = await userModel.find({});
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
});

//Delete user by only using useId
/* app.delete("/user", async (req, res) => {
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

//Delete user by using useId or email
app.delete("/user", async (req, res) => {
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
});

/*
Delete Notes: 
1. `findByIdAndDelete` method delete the document only by `id` and `findOneAndDelete` method delete the document by any field.
2. `findByIdAndDelete` method behind the sceen using `findOneAndDelete` to do the delete operation.
*/

//Update the user
app.patch("/user/:userId", async (req, res) => {
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
});

/**
 Update Nodes:
 1. In `findByIdAndUpdate` method the third parameter is an object ({returnDocument: "after"}). And the update method will return the document based on the parameter. Please check running the code
 */

connectDB()
  .then(() => {
    console.log("Database connected successfully!!");
    app.listen(PORT, () => console.log(`App is running on port:${PORT}`));
  })
  .catch((err) => {
    console.error("Database Error: ", err);
  });
