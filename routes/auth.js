const User = require("../models/user");
const { Router } = require("express");
const logger = require("../middlewares/logger");
const Joi = require("joi");
const route = Router();
const bcrypt = require("bcrypt");
const { totp } = require("otplib");
const nodemailer = require("nodemailer");
const Region = require("../models/region");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/genToken");
const { ReMiddleware } = require("../middlewares/auth");

totp.options = {
  step: 300,
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hadiyhadiy2008@gmail.com",
    pass: "cbzk bmns kqyz xsqn",
  },
});

async function sendMail(email, otp) {
  try {
    await transporter.sendMail({
      to: email,
      subject: "Your one-time password",
      text: `Your one-time password: ${otp}`,
    });

    logger.info("OTP sent to email!");
  } catch (error) {
    logger.error(error.message);
  }
}

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User management APIs
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User info retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Invalid or expired token
 */
route.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, "soz");
    } catch (error) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "fullName", "email", "phone", "role", "status"],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
    logger.info("User info sent!");
  } catch (error) {
    res.status(401).json({ message: "Problem with token.", error: error.message });
    logger.error(error.message);
  }
});
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - phone
 *               - regionId
 *               - year
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               regionId:
 *                 type: integer
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User created, OTP sent to email
 *       400:
 *         description: Validation error
 *       600:
 *         description: Internal server error
 */
route.post("/register", async (req, res) => {
  let newYear = new Date().getFullYear();
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(55).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(55).required(),
    phone: Joi.string()
      .pattern(/^\+\d{12}$/)
      .required(),
    role: Joi.string().valid("admin", "user", "super-admin", "seo").optional(),
    regionId: Joi.number().required(),
    year: Joi.number()
      .min(newYear - 149)
      .max(newYear)
      .required(),
  });

  let role = req.body.role || "user";
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  if (req.body.year > newYear - 18) {
    return res.status(400).json({ message: "You must be at least 18 years old" });
  }
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    let region = await Region.findByPk(req.body.regionId);
    if (!region) {
      return res.status(400).json({ message: "Region not found" });
    }
    let hash = await bcrypt.hash(password, 10);
    let otp = totp.generate(email + "soz");
    const newUser = await User.create({
      ...req.body,
      password: hash,
      role,
      status: "pending",
    });
    await sendMail(email, otp);
    res.json({ newUser, message: `User created, OTP sent to ${email}!` });
    logger.info("User created!");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 */
route.post("/send-otp", async (req, res) => {
  try {
    let { email } = req.body;
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User with this email not found" });
    }
    let otp = totp.generate(email + "soz");
    await sendMail(email, otp);
    res.json({ message: `OTP sent to ${email}!` });
    logger.info("OTP sent!");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify user with OTP
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: User verified successfully
 *       400:
 *         description: Invalid OTP
 */
route.post("/verify", async (req, res) => {
  try {
    let { email, otp } = req.body;
    let isValid = totp.check(otp, email + "soz");
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User with this email not found" });
    }
    await user.update({ status: "active" });
    res.json({ message: "User verified!" });
    logger.info("User verified!");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Incorrect password or user not verified
 */
route.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User with this email not found" });
    }
    let isActive = user.status === "active";
    if (!isActive) {
      return res.status(400).json({ message: "User is not verified" });
    }
    let isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    let AccessToken = generateAccessToken(user);
    let RefreshToken = generateRefreshToken(user);
    res.json({ message: "You are logged in", AccessToken, RefreshToken });
    logger.info("User logged in!");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Incorrect password
 */
route.post("/change-password", async (req, res) => {
  try {
    let { email, password, newPassword } = req.body;
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User with this email not found" });
    }
    let isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    let hash = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hash });
    res.json({ message: "Password changed!" });
    logger.info("Password changed!");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = route;
