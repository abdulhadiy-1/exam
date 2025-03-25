const express = require("express");
const multer = require("multer");
const { Op } = require("sequelize");
const Soha = require("../models/soha");
const sohaValidation = require("../validations/sohaValidation");
const logger = require("../middlewares/logger");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/soha"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { error } = sohaValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const newSoha = { ...req.body, image: req.file?.path || null };
    const soha = await Soha.create(newSoha);
    res.status(201).json(soha);
    logger.info("Yangi soha qo'shildi");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.get("/", async (req, res) => {
  try {
    let { page, limit, sort, order, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    sort = sort || "id";
    order = order || "ASC";

    const where = search ? { name: { [Op.like]: `%${search}%` } } : {};
    const { rows, count } = await Soha.findAndCountAll({
      where,
      order: [[sort, order]],
      limit,
      offset: (page - 1) * limit,
    });

    res.json({ total: count, page, limit, data: rows });
    logger.info("Sohalar ro'yxati olindi");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const soha = await Soha.findByPk(req.params.id);
    if (!soha) return res.status(404).json({ message: "Soha topilmadi" });

    res.json(soha);
    logger.info("Bitta soha olindi");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { error } = sohaValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const soha = await Soha.findByPk(req.params.id);
    if (!soha) return res.status(404).json({ message: "Soha topilmadi" });

    const updatedSoha = { ...req.body, image: req.file?.path || soha.image };
    await soha.update(updatedSoha);
    res.json(soha);
    logger.info("Soha o'zgartirildi");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const soha = await Soha.findByPk(req.params.id);
    if (!soha) return res.status(404).json({ message: "Soha topilmadi" });

    await soha.destroy();
    res.json({ message: "Soha o'chirildi" });
    logger.info("Soha o'chirildi");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = router;
