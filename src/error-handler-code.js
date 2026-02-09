//For testing, need to place it into app.js and test

//Middlewares / error handle practice
app.get("/user/getUserData", (req, res) => {
  try {
    console.log("getUserData call===");
    throw new Error("Something went wrong!");
    res.send("Here is the user all data.");
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      handler: "try catch block",
    });
  }
});

//Handle 404 error
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not fount!",
  });
});

//Error handle(always need to place in last, after all rout handler)
app.use("/", (err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});
