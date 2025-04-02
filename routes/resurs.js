const { Op } = require("sequelize");
const Resurs = require("../models/resurs");
const { Router } = require("express");
const logger = require("../middlewares/logger");
const Joi = require("joi");
const { Middleware } = require("../middlewares/auth");
const User = require("../models/user");
const Category = require("../models/category");

const route = Router();
/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: API для управления ресурсами
 */
/**
 * @swagger
 * /resurs:
 *   get:
 *     summary: Получить список ресурсов
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество записей на странице
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по названию ресурса
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Сортировка по названию
 *     responses:
 *       200:
 *         description: Список ресурсов
 *       500:
 *         description: Ошибка сервера
 */
route.get("/", async (req, res) => {
  try {
    let limit = Number(req.query.limit) || 10;
    let page = Number(req.query.page) || 1;
    let offset = limit * (page - 1);
    let search = req.query.search || "";
    let sort = ["ASC", "DESC"].includes(req.query.sort?.toUpperCase())
      ? req.query.sort.toUpperCase()
      : "ASC";

    const resurses = await Resurs.findAndCountAll({
      where: { name: { [Op.like]: `%${search}%` } },
      include: [
        { model: User, attributes: ["fullName"] },
        { model: Category, attributes: ["name"] },
      ],
      order: [["name", sort]],
      limit,
      offset,
    });

    res.json({ total: resurses.count, data: resurses.rows });
    logger.info("All resources retrieved");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});
/**
 * @swagger
 * /resurs/{id}:
 *   get:
 *     summary: Получить ресурс по ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ресурса
 *     responses:
 *       200:
 *         description: Найденный ресурс
 *       404:
 *         description: Ресурс не найден
 *       500:
 *         description: Ошибка сервера
 */
route.get("/:id", async (req, res) => {
  try {
    const resurs = await Resurs.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ["fullName"] },
        { model: Category, attributes: ["name"] },
      ],
    });
    if (!resurs) return res.status(404).json({ message: "Resource not found" });

    res.json(resurs);
    logger.info("Resource retrieved by ID");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

const resursPostSchema = Joi.object({
  name: Joi.string().min(2).max(55).required(),
  media: Joi.string().min(2).required(),
  description: Joi.string().min(2).required(),
  categoryId: Joi.number().required(),
});
/**
 * @swagger
 * /resurs:
 *   post:
 *     summary: Создать ресурс
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, media, description, categoryId]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 55
 *               media:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Ресурс создан
 *       400:
 *         description: Ошибка валидации или категория не найдена
 *       401:
 *         description: Неавторизован
 *       500:
 *         description: Ошибка сервера
 */
route.post("/", Middleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { error } = resursPostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userId = req.user.id;
    const { categoryId, name, media, description } = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    const newResurs = await Resurs.create({ name, media, description, categoryId, userId });

    res.status(201).json(newResurs);
    logger.info("Resource created successfully");
  } catch (error) {
    logger.error(error); 
    res.status(500).json({ message: "Internal Server Error" });
  }
});


const resursPatchSchema = Joi.object({
  name: Joi.string().min(2).max(55).optional(),
  media: Joi.string().min(2).optional(),
  description: Joi.string().min(2).optional(),
}).or("name", "media", "description");
/**
 * @swagger
 * /resurs/{id}:
 *   patch:
 *     summary: Обновить ресурс
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ресурса
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
 *                 maxLength: 55
 *               media:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ресурс обновлён
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Неавторизован
 *       403:
 *         description: Доступ запрещён
 *       404:
 *         description: Ресурс не найден
 *       500:
 *         description: Ошибка сервера
 */
route.patch("/:id", Middleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const resurs = await Resurs.findByPk(req.params.id);
    if (!resurs) return res.status(404).json({ message: "Resource not found" });

    if (!(req.user.role === "admin" || req.user.role === "super-admin" || req.user.id === resurs.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { error } = resursPatchSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    await resurs.update(req.body);
    res.json(resurs);
    logger.info("Resource updated");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});
/**
 * @swagger
 * /resurs/{id}:
 *   delete:
 *     summary: Удалить ресурс
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ресурса
 *     responses:
 *       200:
 *         description: Ресурс удалён
 *       401:
 *         description: Неавторизован
 *       403:
 *         description: Доступ запрещён
 *       404:
 *         description: Ресурс не найден
 *       500:
 *         description: Ошибка сервера
 */
route.delete("/:id", Middleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const resurs = await Resurs.findByPk(req.params.id);
    if (!resurs) return res.status(404).json({ message: "Resource not found" });

    if (!(req.user.role === "admin" || req.user.id === resurs.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await resurs.destroy();
    res.json({ message: "Resource deleted" });
    logger.info("Resource deleted");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = route;
