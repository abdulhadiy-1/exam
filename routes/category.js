const { Op } = require("sequelize");
const Category = require("../models/category");
const { Router } = require("express");
const logger = require("../middlewares/logger");
const Joi = require("joi");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");

const route = Router();

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
    logger.info("Получены все категории");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

route.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Категория не найдена" });

    res.json(category);
    logger.info("Получена категория по id");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

const categoryPostSchema = Joi.object({
  name: Joi.string().min(2).max(55).required(),
  image: Joi.string().min(2).required(),
});

route.post("/", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
  try {
    const { name, image } = req.body;

    if (await Category.findOne({ where: { name } })) {
      return res.status(400).json({ message: "Категория уже существует" });
    }

    const { error } = categoryPostSchema.validate({ name, image });
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const newCategory = await Category.create({ name, image });
    res.json(newCategory);
    logger.info("Категория создана");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

const categoryPatchSchema = Joi.object({
  name: Joi.string().min(2).max(55).optional(),
  image: Joi.string().min(2).optional(),
});

route.patch(
  "/:id",
  Middleware,
  RoleMiddleware(["admin", "super-admin"]),
  async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category)
        return res.status(404).json({ message: "Категория не найдена" });

      const { error } = categoryPatchSchema.validate(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      await category.update(req.body);
      res.json(category);
      logger.info("Категория изменена");
    } catch (error) {
      res.status(600).json({ message: error.message });
      logger.error(error.message);
    }
  }
);

route.delete(
  "/:id",
  Middleware,
  RoleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category)
        return res.status(404).json({ message: "Категория не найдена" });

      await category.destroy();
      res.json({ message: "Категория удалена" });
      logger.info("Категория удалена");
    } catch (error) {
      res.status(600).json({ message: error.message });
      logger.error(error.message);
    }
  }
);

module.exports = route;
