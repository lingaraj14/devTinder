const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "User first name is required"],
      minLength: 4,
      mixLength: 50,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: (value) => {
        //Better to use `validator` library
        /* const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!isValid) {
          throw new Error("Email is not valid!");
        } */
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate: (value) => {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is weak!");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate: (value) => {
        if (!["Male", "Female", "Other"].includes(value)) {
          throw new Error("'{VALUE}' - is not a valid gender.");
        }
      },
    },
    photopath: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuh62yCiCeLhbted1GWcHCFaIFQcrXBzp3vuyDTg0BFQ&s",
      validate: (value) => {
        if (!validator.isURL(value)) {
          throw new Error("Invalid photo link!");
        }
      },
    },
    about: {
      type: String,
      default: "This is a default about of the user!",
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true },
);

//JWT token create
userSchema.methods.getJWT = async function () {
  //always use regular function, bcz of `this` used
  const user = this; //here `this` refers to the `userSchema` object

  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  }); //`expiresIn` parameter is optional

  return token;
};

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
