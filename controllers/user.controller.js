const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const jwt = require("jsonwebtoken");

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(
      500,
      "Something went wrong while genarting refresh & access token"
    );
  }
};

const register = async (req, res) => {
  // get user details from frontend
  const { username, email, password } = req.body;
  // validation
  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new Error(400, "All fields are required");
  }
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "User already exists with this email or user name");
  }

  const user = await User.create({
    email,
    password,
    username: username.toLowerCase(),
  });
  // remove password & refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // check for user creation
  if (!createdUser) {
    throw new Error(500, "Something went wrong while registering the user");
  }
  // return response
  //   return res
  //     .status(201)
  //         .json(new ApiResponse(200, createdUser, "User registered Successfully"));
  return res.status(200).send({
    data: createdUser,
    code: 200,
    message: "User registered Successfully",
  });
};

const login = async (req, res) => {
  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new Error(400, "username or email is required");
  }
  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new Error(404, "User doesn't exists");
  }
  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new Error(404, "Invalid password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      data: { loggedInUser, accessToken, refreshToken },
      code: 200,
      message: "User log in Successfully",
    });
};

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refrehToken || req.body.refrehToken;
  if (!incomingRefreshToken) {
    throw new Error(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new Error(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        data: { accessToken, refreshToken: newRefreshToken },
        code: 200,
        message: "User log in Successfully",
      });
  } catch (error) {
    throw new Error(402, error?.message || "Invalid refresh token");
  }
};

module.exports = { register, login, refreshAccessToken };
