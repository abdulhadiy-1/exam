const { Op } = require("sequelize");
const Category = require("../models/category");
const { Router } = require("express");
const logger = require("../middlewares/logger");
const Joi = require("joi");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");

const route = Router();

/**
 * @swagger
 * tags:
 *   - name: Category
 *     description: API для управления категориями
 */

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Получить список категорий
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество категорий на странице
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по названию категории
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Сортировка по названию
 *     responses:
 *       200:
 *         description: Список категорий получен
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

    const categories = await Category.findAndCountAll({
      where: { name: { [Op.like]: `%${search}%` } },
      order: [["name", sort]],
      limit,
      offset,
    });

    res.json({ total: categories.count, data: categories.rows });
    logger.info("All categories retrieved");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /category/{id}:
 *   get:
 *     summary: Получить категорию по ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID категории
 *     responses:
 *       200:
 *         description: Категория найдена
 *       404:
 *         description: Категория не найдена
 */
route.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json(category);
    logger.info("Category retrieved by ID");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

const categoryPostSchema = Joi.object({
  name: Joi.string().min(2).max(55).required(),
  image: Joi.string().min(2).required(),
});

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Создать новую категорию
 *     tags: [Category]
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
 *               image:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       200:
 *         description: Категория успешно создана
 *       400:
 *         description: Категория уже существует или ошибка валидации
 */
route.post("/", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
  try {
    const { name, image } = req.body;

    if (await Category.findOne({ where: { name } })) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const { error } = categoryPostSchema.validate({ name, image });
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const newCategory = await Category.create({ name, image });
    res.json(newCategory);
    logger.info("Category created");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

const categoryPatchSchema = Joi.object({
  name: Joi.string().min(2).max(55).optional(),
  image: Joi.string().min(2).optional(),
});

/**
 * @swagger
 * /category/{id}:
 *   patch:
 *     summary: Обновить категорию по ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID категории
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
 *               image:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       200:
 *         description: Категория успешно обновлена
 *       400:
 *         description: Ошибка валидации данных
 *       404:
 *         description: Категория не найдена
 */
route.patch(
  "/:id",
  Middleware,
  RoleMiddleware(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category)
        return res.status(404).json({ message: "Category not found" });

      const { error } = categoryPatchSchema.validate(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      await category.update(req.body);
      res.json(category);
      logger.info("Category updated");
    } catch (error) {
      res.status(500).json({ message: error.message });
      logger.error(error.message);
    }
  }
);

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Удалить категорию по ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID категории
 *     responses:
 *       200:
 *         description: Категория успешно удалена
 *       404:
 *         description: Категория не найдена
 */
route.delete(
  "/:id",
  Middleware,
  RoleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category)
        return res.status(404).json({ message: "Category not found" });

      await category.destroy();
      res.json({ message: "Category deleted" });
      logger.info("Category deleted");
    } catch (error) {
      res.status(500).json({ message: error.message });
      logger.error(error.message);
    }
  }
);

module.exports = route;
