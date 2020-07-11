const jwt = require("jsonwebtoken");
const { Jwt_Key } = require("../Key");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    const decoded = jwt.verify(token, Jwt_Key);
    req.userData = decoded;
  } catch (error) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  next();
};
