const mongoose = require("mongoose");

mongoose
  // connect to database
  .connect("mongodb+srv://neerajmore9:ZBtILKM0tGT5UR57@eventm.6ydue7x.mongodb.net/UserEnquiry")
  .then(() =>
    console.log("connected to mongo db ")
  );
