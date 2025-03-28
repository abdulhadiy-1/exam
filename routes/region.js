const { Op } = require("sequelize");
const Region = require("../models/region");
const { Router } = require("express");
const logger = require("../middlewares/logger");
const Joi = require("joi");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");
const route = Router();

/**
 * @swagger
 * tags:
 *   - name: Region
 *     description: API для управления регионами
 */

/**
 * @swagger
 * /region:
 *   get:
 *     summary: Получить список регионов
 *     tags: [Region]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество регионов на странице
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по названию региона
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Сортировка по названию региона
 *     responses:
 *       200:
 *         description: Список регионов получен
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
    
    const regions = await Region.findAndCountAll({
      where: {
        name: {
          [Op.like]: `%${search}%`,
        },
      },
      order: [["name", sort]],
      limit: limit,
      offset: offset,
    });
    
    res.json({ total: regions.count, data: regions.rows });
    logger.info("All regions retrieved");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /region/{id}:
 *   get:
 *     summary: Получить регион по ID
 *     tags: [Region]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID региона
 *     responses:
 *       200:
 *         description: Регион найден
 *       404:
 *         description: Регион не найден
 */
route.get("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const region = await Region.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    res.json(region);
    logger.info("Region retrieved by ID");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

let regionPostSchema = Joi.object({
  name: Joi.string().min(2).max(55).required(),
});

/**
 * @swagger
 * /region:
 *   post:
 *     summary: Создать новый регион
 *     tags: [Region]
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
 *     responses:
 *       200:
 *         description: Регион успешно создан
 *       400:
 *         description: Регион уже существует или ошибка валидации
 */
route.post("/", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
  try {
    let name = req.body.name;
    const region = await Region.findOne({ where: { name: name } });
    if (region) {
      return res.status(400).json({ message: "Region already exists" });
    }
    let { error } = regionPostSchema.validate({ name });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const newRegion = await Region.create({ name });
    res.json(newRegion);
    logger.info("Region created");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

let regionPatchSchema = Joi.object({
  name: Joi.string().min(2).max(55).optional(),
});

/**
 * @swagger
 * /region/{id}:
 *   patch:
 *     summary: Обновить регион по ID
 *     tags: [Region]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID региона
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
 *     responses:
 *       200:
 *         description: Регион успешно обновлён
 *       400:
 *         description: Ошибка валидации данных
 *       404:
 *         description: Регион не найден
 */
route.patch("/:id", Middleware, RoleMiddleware(["admin", "super-admin"]), async (req, res) => {
  try {
    let id = req.params.id;
    const region = await Region.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    let name = req.body.name;
    let { error } = regionPatchSchema.validate({ name });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    await region.update({ name });
    res.json(region);
    logger.info("Region updated");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /region/{id}:
 *   delete:
 *     summary: Удалить регион по ID
 *     tags: [Region]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID региона
 *     responses:
 *       200:
 *         description: Регион успешно удалён
 *       404:
 *         description: Регион не найден
 */
route.delete("/:id", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
  try {
    let id = req.params.id;
    const region = await Region.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    await region.destroy();
    res.json({ message: "Region deleted" });
    logger.info("Region deleted");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = route;
