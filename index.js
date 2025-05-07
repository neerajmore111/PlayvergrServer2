const express = require("express");
const app = express();
var cors = require('cors')
// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config("./.env");
// }
require("./src/db/mongoose");

const userRouter = require("./src/routes/user");
const movieRouter = require("./src/routes/movie");
const categoriesMoviesRouter = require("./src/routes/categoriesMovie");
const newsRouter = require("./src/routes/news");

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization"
  );
  next();
});
app.use(express.json());
app.use(cors())
app.use("/api/user", userRouter);
app.use("/api/movie", movieRouter);
app.use("/api/categories-movies", categoriesMoviesRouter);
app.use("/api/news", newsRouter);

app.listen(8800, () => {
  console.log("Serve is running ");
});
