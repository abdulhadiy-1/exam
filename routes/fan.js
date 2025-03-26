const express = require("express");
const multer = require("multer");
const { Op } = require("sequelize");
const Fan = require("../models/fan");
const fanValidation = require("../validations/fanValidation");
const logger = require("../middlewares/logger");
const { Middleware } = require("../middlewares/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/fan"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/", Middleware, upload.single("image"), async (req, res) => {
  try {
    const { error } = fanValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const newFan = { ...req.body, image: req.file?.path || null };
    const fan = await Fan.create(newFan);

    res.status(201).json(fan);
    logger.info("A new subject has been created.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.get("/", Middleware, async (req, res) => {
  try {
    let { page, limit, sort, order, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    sort = sort || "id";
    order = order || "ASC";

    const where = search ? { name: { [Op.like]: `%${search}%` } } : {};
    const { rows, count } = await Fan.findAndCountAll({
      where,
      order: [[sort, order]],
      limit,
      offset: (page - 1) * limit,
    });

    res.json({ total: count, page, limit, data: rows });
    logger.info("Subjects have been retrieved.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.get("/:id", Middleware, async (req, res) => {
  try {
    const fan = await Fan.findByPk(req.params.id);
    if (!fan) return res.status(404).json({ message: "Subject not found." });

    res.json(fan);
    logger.info("A subject has been fetched.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.patch("/:id", Middleware, upload.single("image"), async (req, res) => {
  try {
    const { error } = fanValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const fan = await Fan.findByPk(req.params.id);
    if (!fan) return res.status(404).json({ message: "Subject not found." });

    const updatedFan = { ...req.body, image: req.file?.path || fan.image };
    await fan.update(updatedFan);

    res.json(fan);
    logger.info("Subject changed.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.delete("/:id", Middleware, async (req, res) => {
  try {
    const fan = await Fan.findByPk(req.params.id);
    if (!fan) return res.status(404).json({ message: "Subject not found." });

    await fan.destroy();
    res.json({ message: "Subject deleted." });
    logger.info("Subject deleted.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = router;
