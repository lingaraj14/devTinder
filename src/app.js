const express = require("express");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/database");
const cors = require("cors");

//Router Imports
const authRouter = require("../src/routes/auth");
const profileRouter = require("../src/routes/profile");
const requestRouter = require("./routes/connection");
const userRouter = require("../src/routes/user");

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // Must match your React app's origin
    credentials: true, // Enables cookies to be sent and received cross-origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(express.json());
app.use(cookieParser());

//Router Call
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("Database connected successfully!!");
    app.listen(PORT, () => console.log(`App is running on port:${PORT}`));
  })
  .catch((err) => {
    console.error("Database Error: ", err);
  });
