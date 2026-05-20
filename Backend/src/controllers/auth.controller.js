import { response } from "express";
import userModal from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModal from "../models/session.model.js";
import sendEmail from "../services/email.service.js";
import { generateOTP, getOtpHtml } from "../utils/utils.js";
import otpModal from "../models/otp.model.js";

export async function register(req, res) {
  const { username, email, password } = req.body;

  const isAlreadyRegistered = await userModal.findOne({
    $or: [{ username }, { email }],
  });

  if (isAlreadyRegistered) {
    return res.status(409).json({
      message: "Username or email already exists",
    });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const user = await userModal.create({
    username,
    email,
    password: hashedPassword,
  });

  const otp = generateOTP();

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const html = getOtpHtml(otp);

  await otpModal.create({
    email,
    user: user._id,
    otpHash,
  });
  await sendEmail(email, "OTP Verification", `Your OTP code is ${otp}`, html);
  res.status(201).json({
    message: "User Registered Successfully!",
    user: {
      username: user.username,
      email: user.email,
      id: user.id,
      verified: user.verified,
      totalSpace: user.totalSpace,
      usedSpace: user.usedSpace,
      // token: accessToken,
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModal.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "invalid email password" });
  }

  if (!user.verified) {
    return res
      .status(401)
      .json({ message: "Please verify your email before logging in" });
  }

  const passwordHash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  console.log("user", user);
  console.log("1", passwordHash);
  console.log("2", user.password);
  const passwordMatched = passwordHash == user.password;
  if (!passwordMatched)
    return res.status(401).json({
      message: "Invalid password",
    });

  const refreshToken = jwt.sign({ id: user.id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModal.create({
    userId: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    {
      id: user._id,
      sessionId: session._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 100,
  });
  res.status(200).json({
    message: "Logged in successfully",
    user: {
      username: user.username,
      email: user.email,
      id: user.id,
      token: accessToken,
    },
  });
}

export async function getme(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Token not found",
    });
  }
  const decoded = jwt.verify(token, config.JWT_SECRET);
  const user = await userModal.findById(decoded.id);
  res.status(200).json({
    message: "User featched",
    user: {
      username: user.username,
      email: user.email,
    },
  });
}

export async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "user not authorised",
    });
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModal.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if (!session) {
    return res.status(401).json({ message: "invalid session token" });
  }

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  const accessToken = jwt.sign(
    {
      id: decoded.id,
    },
    config.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const newRefreshToken = jwt.sign(
    {
      id: decoded.id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 100,
  });
  res.status(200).json({
    message: "Token refreshed successfully",
    accessToken,
  });
}

export async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      message: "refresh token not found",
    });
  }
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModal.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if (!session)
    return res.status(401).json({
      message: "session not found",
    });

  session.revoked = true;
  await session.save();

  res.clearCookie("refreshToken");

  res.status(200).json({
    message: "Logged out successfully!",
  });
}

export async function logoutAll(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken)
    return res.status(401).json({
      message: "Token invalid",
    });

  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
  await sessionModal.updateMany(
    { user: decoded.userId, revoked: false },
    { revoked: true },
  );

  res.clearCookie("refreshToken");
  res.status(201).json({
    message: "Logged from all devices successfully",
  });
}

export async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const otpRecord = await otpModal.findOne({ email, otpHash });

  if (!otpRecord) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const user = await userModal.findByIdAndUpdate(otpRecord.user, {
    verified: true,
  });

  await otpModal.deleteMany({ user: user._id });

  res.status(200).json({
    message: "Email verified successfully",
    user: {
      username: user.username,
      email: user.email,
      id: user.id,
      verified: user.verified,
    },
  });
}
