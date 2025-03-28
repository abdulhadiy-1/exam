const express = require("express");
const { Op } = require("sequelize");
const Fan = require("../models/fan");
const fanValidation = require("../validations/fanValidation");
const logger = require("../middlewares/logger");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Fan
 *   description: API для управления предметами (fan)
 */

/**
 * @swagger
 * /fan:
 *   post:
 *     summary: Создать новый предмет
 *     tags: [Fan]   
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Мой предмет"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Предмет создан
 *       400:
 *         description: Ошибка валидации данных
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
  try {
    const { error } = fanValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const fan = await Fan.create(req.body);
    res.status(201).json(fan);
    logger.info("A new subject has been created.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /fan:
 *   get:
 *     summary: Получить список предметов
 *     tags: [Fan]   
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по названию
 *     responses:
 *       200:
 *         description: Список предметов
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/", async (req, res) => {
  try {
    let { page, limit, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const where = search ? { name: { [Op.like]: `%${search}%` } } : {};
    const { rows, count } = await Fan.findAndCountAll({
      where,
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

/**
 * @swagger
 * /fan/{id}:
 *   get:
 *     summary: Получить предмет по ID
 *     tags: [Fan]   
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID предмета
 *     responses:
 *       200:
 *         description: Информация о предмете
 *       404:
 *         description: Предмет не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/:id", async (req, res) => {
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

/**
 * @swagger
 * /fan/{id}:
 *   patch:
 *     summary: Обновить предмет по ID
 *     tags: [Fan]   
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID предмета
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Новое название"
 *               image:
 *                 type: string
 *                 example: "https://example.com/new-image.jpg"
 *     responses:
 *       200:
 *         description: Предмет обновлён
 *       400:
 *         description: Ошибка валидации данных
 *       404:
 *         description: Предмет не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.patch("/:id", Middleware, RoleMiddleware(["admin", "super-admin"]), async (req, res) => {
  try {
    const { error } = fanValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const fan = await Fan.findByPk(req.params.id);
    if (!fan) return res.status(404).json({ message: "Subject not found." });

    const updatedFan = { ...req.body };
    await fan.update(updatedFan);

    res.json(fan);
    logger.info("Subject changed.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /fan/{id}:
 *   delete:
 *     summary: Удалить предмет по ID
 *     tags: [Fan]   
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID предмета
 *     responses:
 *       200:
 *         description: Предмет удалён
 *       404:
 *         description: Предмет не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.delete("/:id", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
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
