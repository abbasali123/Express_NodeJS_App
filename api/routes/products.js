const express = require("express");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/[\/\\:]/g, "_") + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  //reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const CheckAuth = require("../middleware/check_auth");

router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id uploadImage")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        products: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
            uploadImage: doc.uploadImage,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + doc._id,
            },
          };
        }),
      };
      console.log(response);
      if (docs) {
        res.status(200).json(response);
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

router.post("/", CheckAuth, upload.single("uploadImage"), (req, res, next) => {
  // const product = {
  //   name: req.body.name,
  //   price: req.body.price,
  // };
  console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    uploadImage: req.file.path,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Created Product Successfully",
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + result._id,
          },
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

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select("name price _id uploadImage")
    .exec()
    .then((doc) => {
      console.log("From Database", doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/",
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
      res.status(500).json({ error: err });
    });
});

router.patch("/:productId", CheckAuth, (req, res, next) => {
  const id = req.params.productId;
  const UpdateOps = {};
  for (const ops of req.body) {
    UpdateOps[ops.propName] = ops.value;
  }
  Product.update({ _id: id }, { $set: UpdateOps })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        product: result,
        request: {
          type: "GET",
          url: "http://localhost:3000/products/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:productId", CheckAuth, (req, res, next) => {
  const id = req.params.productId;

  Product.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Product Deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
