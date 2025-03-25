const express = require("express");
const { Op } = require("sequelize");
const EduSoha = require("../models/eduSoha");
const edusohaValidation = require("../validations/edusohaValidation");
const logger = require("../middlewares/logger");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { error } = edusohaValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const edusoha = await EduSoha.create(req.body);
    res.status(201).json(edusoha);
    logger.info("Yangi edusoha qo'shildi");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.get("/", async (req, res) => {
  try {
    let { page, limit, sort, order } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    sort = sort || "id";
    order = order || "ASC";

    const { rows, count } = await EduSoha.findAndCountAll({
      order: [[sort, order]],
      limit,
      offset: (page - 1) * limit,
    });

    res.json({ total: count, page, limit, data: rows });
    logger.info("Edusohalar ro'yxati olindi");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const edusoha = await EduSoha.findByPk(req.params.id);
    if (!edusoha) return res.status(404).json({ message: "EduSoha topilmadi" });

    res.json(edusoha);
    logger.info("Bitta edusoha olindi");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const edusoha = await EduSoha.findByPk(req.params.id);
    if (!edusoha) return res.status(404).json({ message: "EduSoha topilmadi" });

    await edusoha.destroy();
    res.json({ message: "EduSoha o'chirildi" });
    logger.info("Edusoha o'chirildi");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = router;
