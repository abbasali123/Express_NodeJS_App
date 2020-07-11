const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const CheckAuth = require("../middleware/check_auth");

router.get("/", CheckAuth, (req, res, next) => {
  Order.find()
    .select("product quantity _id")
    .populate("product", "name")
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        count: result.length,
        Orders: result.map((doc) => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + doc._id,
            },
          };
        }),
      });
    })
    .catch();
});

router.post("/", CheckAuth, (req, res, next) => {
  Product.findById(req.body.productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: "Product Not Found",
        });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      });
      return order.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Order stored",
        createdOrder: {
          _id: result._id,
          quantity: result.quantity,
          product: result.product,
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/" + result._id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:ordersId", CheckAuth, (req, res, next) => {
  Order.findById(req.params.ordersId)
    .populate("product")
    .exec()
    .then((order) => {
      if (order) {
        res.status(200).json({
          order: order,
          request: {
            type: "GET",
            url: "http://localhost:3000/orders",
          },
        });
      } else {
        res
          .status(404)
          .json({ message: "No Valid Entry Found For Provided Id" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/:ordersId", CheckAuth, (req, res, next) => {
  const id = req.params.ordersId;

  Order.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Order Deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
module.exports = router;
