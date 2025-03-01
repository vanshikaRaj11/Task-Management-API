const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
require("dotenv").config();

const verifyJwt = catchAsync(async (req, res, next) => {
  console.log(req.header("Authorization"));
  console.log(process.env.ACCESS_TOKEN_SECRET);
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

module.exports = verifyJwt;
