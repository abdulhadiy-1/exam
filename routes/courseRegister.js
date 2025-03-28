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
 *   description: API для работы с регистрацией на курсы
 */

/**
 * @swagger
 * /courseRegister:
 *   post:
 *     summary: Регистрация пользователя на курс
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
 *         description: Успешная регистрация на курс
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Один из ресурсов не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/", Middleware, async (req, res) => {
  try {
    let userId = req.user.id;
    const { error } = courseRegisterValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let { eduId, sohaId, fanId, fillialId } = req.body;

    let [eduCenter, soha, fan, user, fillial] = await Promise.all([
      EduCenter.findByPk(eduId),
      Soha.findByPk(sohaId),
      Fan.findByPk(fanId),
      User.findByPk(userId),
      Fillial.findByPk(fillialId),
    ]);

    if (!eduCenter || !soha || !fan || !user || !fillial) {
      return res.status(404).json({ message: "One or more resources not found" });
    }

    const course = await CourseRegister.create({ ...req.body, userId });

    res.status(201).json(course);
    logger.info("A new course was added.");
  } catch (error) {
    logger.error(error.message);
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /courseRegister:
 *   get:
 *     summary: Получить список курсов
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
 *         description: Успешный ответ
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/", Middleware, async (req, res) => {
  try {
    let user = req.user;
    let { page, limit, sort, order, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    sort = sort || "id";
    order = order || "ASC";
    const where = search ? { name: { [Op.like]: `%${search}%` } } : {};
    if(user.role !== "admin") {
      where.userId = user.id;
    }

    const { rows, count } = await CourseRegister.findAndCountAll({
      where,
      order: [[sort, order]],
      include: [
        { model: EduCenter, attributes: ["name"] },
        { model: Soha, attributes: ["name"] },
        { model: Fan, attributes: ["name"] },
        { model: User, attributes: ["fullName"] },
        { model: Fillial, attributes: ["name"] },
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
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /courseRegister/{id}:
 *   get:
 *     summary: Получить информацию о курсе
 *     tags: [CourseRegister]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Успешный ответ
 *       404:
 *         description: Курс не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/:id", Middleware, async (req, res) => {
  try {
    let user = req.user
    const course = await CourseRegister.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "course not found." });
    if(user.role !== "admin" && user.id !== course.userId) {
      return res.status(403).json({ message: "No access." });
    }
    res.json(course);
    logger.info("A single course has been fetched.");
  } catch (error) {
    logger.error(error.message);
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /courseRegister/{id}:
 *   patch:
 *     summary: Обновить данные о курсе
 *     tags: [CourseRegister]
 */
router.patch("/:id", Middleware, async (req, res) => {
  try {
    const { error } = courseRegisterValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const course = await CourseRegister.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "course not found." });


    if (req.user.role !== "admin" && req.user.id !== course.userId) {
      return res.status(403).json({ message: "No access." });
    }


    await course.update(req.body);
    res.json(course);
    logger.info("Course updated.");
    logger.info("Course updated.");
  } catch (error) {
    logger.error(error.message);
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /courseRegister/{id}:
 *   delete:
 *     summary: Удалить курс
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
    logger.info("Course deleted.");
 }
   catch (error) {
    logger.error(error.message);
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
