const express = require("express");
const { Op } = require("sequelize");
const Soha = require("../models/soha");
const sohaValidation = require("../validations/sohaValidation");
const logger = require("../middlewares/logger");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Soha
 *   description: API для управления отраслями (soha)
 */

/**
 * @swagger
 * /soha:
 *   post:
 *     summary: Создать новую отрасль
 *     tags: [Soha]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Отрасль создана
 *       400:
 *         description: Ошибка валидации данных
 *       500:
 *         description: Внутренняя ошибка сервера
 */

router.post("/", Middleware,  RoleMiddleware(["admin"]),async (req, res) => {
  try {
    const { error } = sohaValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const soha = await Soha.create(req.body);
    res.status(201).json(soha);
    logger.info("A new field has been created.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /soha:
 *   get:
 *     summary: Получить список отраслей
 *     tags: [Soha]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы (по умолчанию 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество записей на странице (по умолчанию 10)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Поле для сортировки (по умолчанию id)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Порядок сортировки (по умолчанию ASC)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по названию
 *     responses:
 *       200:
 *         description: Список отраслей
 *       500:
 *         description: Внутренняя ошибка сервера
 */
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
    logger.info("Industry have been retrieved.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});
/**
 * @swagger
 * /soha/{id}:
 *   get:
 *     summary: Получить отрасль по ID
 *     tags: [Soha]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID отрасли
 *     responses:
 *       200:
 *         description: Информация об отрасли
 *       404:
 *         description: Отрасль не найдена
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/:id", async (req, res) => {
  try {
    const soha = await Soha.findByPk(req.params.id);
    if (!soha) return res.status(404).json({ message: "Industry not found." });

    res.json(soha);
    logger.info("A field has been fetched.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});
/**
 * @swagger
 * /soha/{id}:
 *   patch:
 *     summary: Обновить отрасль по ID
 *     tags: [Soha]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID отрасли
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       200:
 *         description: Отрасль обновлена
 *       400:
 *         description: Ошибка валидации данных
 *       404:
 *         description: Отрасль не найдена
 *       500:
 *         description: Внутренняя ошибка сервера
 */

router.patch("/:id", Middleware, RoleMiddleware(["admin", "super-admin"]), async (req, res) => {
  try {
    const { error } = sohaValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const soha = await Soha.findByPk(req.params.id);
    if (!soha) return res.status(404).json({ message: "Industry not found." });

    const updatedSoha = { ...req.body, image: req.file?.path || soha.image };
    await soha.update(updatedSoha);
    res.json(soha);
    logger.info("Industry changed.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /soha/{id}:
 *   delete:
 *     summary: Удалить отрасль по ID
 *     tags: [Soha]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID отрасли
 *     responses:
 *       200:
 *         description: Отрасль удалена
 *       404:
 *         description: Отрасль не найдена
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.delete("/:id", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
  try {
    const soha = await Soha.findByPk(req.params.id);
    if (!soha) return res.status(404).json({ message: "Industry not found." });

    await soha.destroy();
    res.json({ message: "Industry deleted." });
    logger.info("Industry deleted.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = router;
