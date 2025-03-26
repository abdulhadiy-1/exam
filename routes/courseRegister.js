const express = require("express");
const { Op } = require("sequelize");
const CourseRegister = require("../models/courseRegister");
const courseRegisterValidation = require("../validations/courseValidation");
const logger = require("../middlewares/logger");
const EduCenter = require("../models/EduCenter");
const Soha = require("../models/soha");
const Fan = require("../models/fan");
const User = require("../models/user");
const Fillial = require("../models/fillial");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.post("/", Middleware, async (req, res) => {
  try {
    let userId = req.user.id;
    const { error } = courseRegisterValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    let { eduId, sohaId, fanId, fillialId } = req.body;
    let eduCenter = await EduCenter.findByPk(eduId);
    let soha = await Soha.findByPk(sohaId);
    let fan = await Fan.findByPk(fanId);
    let user = await User.findByPk(userId);
    let fillial = await Fillial.findByPk(fillialId);
    if (!eduCenter) {
      return res.status(404).json({ message: "eduCenter not found" });
    }
    if (!soha) {
      return res.status(404).json({ message: "soha not found" });
    }
    if (!fan) {
      return res.status(404).json({ message: "fan not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    if (!fillial) {
      return res.status(404).json({ message: "fillial not found" });
    }
    const course = await CourseRegister.create(...req.body, userId);
    res.status(201).json(course);
    logger.info("A new course was added.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.get("/", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
  try {
    let { page, limit, sort, order, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    sort = sort || "id";
    order = order || "ASC";

    const where = search ? { name: { [Op.like]: `%${search}%` } } : {};

    const { rows, count } = await CourseRegister.findAndCountAll({
      where,
      order: [[sort, order]],
      limit,
      offset: (page - 1) * limit,
    });

    res.json({ total: count, page, limit, data: rows });
    logger.info("The list of courses has been fetched.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.get("/:id", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
  try {
    const course = await CourseRegister.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "course not found." });

    res.json(course);
    logger.info("A single course has been fetched.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.patch("/:id", Middleware, async (req, res) => {
  try {
    const { error } = courseRegisterValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const course = await CourseRegister.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "course not found." });
    if (req.user.role !== "admin" && req.user.id !== comment.userId) {
      return res.status(403).json({ message: "No access." });
    }
    await course.update(req.body);
    res.json(course);
    logger.info("course changed.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

router.delete("/:id", Middleware, async (req, res) => {
  try {
    const course = await CourseRegister.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "course not found." });
    if (req.user.role !== "admin" && req.user.id !== comment.userId) {
      return res.status(403).json({ message: "No access." });
    }
    await course.destroy();
    res.json({ message: "course deleted." });
    logger.info("course deleted.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = router;
