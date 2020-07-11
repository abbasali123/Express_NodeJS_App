const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const ProductRoutes = require("./api/routes/products");
const OrderRoute = require("./api/routes/orders");
const UserRoute = require("./api/routes/users");

mongoose.connect(
  "mongodb+srv://abbas12313:abbas12313@cluster0-brocl.mongodb.net/test?retryWrites=true&w=majority"
);
mongoose.Promise = global.Promise;
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT,POST,DELETE,PATCH,GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/products", ProductRoutes);

app.use("/orders", OrderRoute);
app.use("/users", UserRoute);

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
