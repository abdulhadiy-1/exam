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

/**
 * @swagger
 * tags:
 *   name: CourseRegister
 *   description: API for course registration
 */

/**
 * @swagger
 * /api/courseRegister:
 *   post:
 *     summary: Register a user for a course
 *     tags: [CourseRegister]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eduId:
 *                 type: integer
 *               sohaId:
 *                 type: integer
 *               fanId:
 *                 type: integer
 *               fillialId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Successfully registered for the course
 *       400:
 *         description: Validation error
 *       404:
 *         description: One of the resources was not found
 *       500:
 *         description: Internal server error
 */

router.post("/", Middleware, async (req, res) => {
  try {
    let userId = req.user.id;
    const { error } = courseRegisterValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    let { eduId, sohaId, fanId, fillialId } = req.body;

    let [eduCenter, soha, fan, user, fillial] = await Promise.all([
      EduCenter.findByPk(eduId),
      Soha.findByPk(sohaId),
      Fan.findByPk(fanId),
      User.findByPk(userId),
      Fillial.findByPk(fillialId),
    ]);

    if ((!eduCenter, !soha, !fan, !user, !fillial)) {
      return res
        .status(404)
        .json({ message: "One or more resources not found" });
    }

    const course = await CourseRegister.create({ ...req.body, userId });
    res.status(201).json(course);
    logger.info("A new course was added.");
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/courseRegister:
 *   get:
 *     summary: Get a list of courses
 *     tags: [CourseRegister]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Internal server error
 */

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
      include: [
        { model: EduCenter, attributes: ["name"] },
        { model: Soha, attributes: ["name"] },
        { model: Fan, attributes: ["name"] },
        { model: User, attributes: ["fullName"] },
        { model: Fillial, attributes: ["name"] },
      ],
      limit,
      offset: (page - 1) * limit,
    });

    res.json({ total: count, page, limit, data: rows });
    logger.info("The list of courses has been fetched.");
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/courseRegister/{id}:
 *   get:
 *     summary: Get course information
 *     tags: [CourseRegister]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */

router.get("/:id", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
  try {
    const course = await CourseRegister.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "course not found." });

    res.json(course);
    logger.info("A single course has been fetched.");
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/courseRegister/{id}:
 *   patch:
 *     summary: Update course information
 *     tags: [CourseRegister]
 */

router.patch("/:id", Middleware, async (req, res) => {
  try {
    const { error } = courseRegisterValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const course = await CourseRegister.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "course not found." });

    if (req.user.role !== "admin" && req.user.id !== course.userId) {
      return res.status(403).json({ message: "No access." });
    }

    await course.update(req.body);
    res.json(course);
    logger.info("Course updated.");
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/courseRegister/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [CourseRegister]
 */

router.delete("/:id", Middleware, async (req, res) => {
  try {
    const course = await CourseRegister.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "course not found." });

    if (req.user.role !== "admin" && req.user.id !== course.userId) {
      return res.status(403).json({ message: "No access." });
    }

    await course.destroy();
    res.json({ message: "course deleted." });
    logger.info("Course deleted.");
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
