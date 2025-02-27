const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJwt = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new Error(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new Error(401, error?.message || "Invalid access token");
  }
};

module.exports = verifyJwt;
