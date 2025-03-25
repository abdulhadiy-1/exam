const { Op } = require("sequelize");
const Resurs = require("../models/resurs");
const { Router } = require("express");
const logger = require("../middlewares/logger");
const Joi = require("joi");
const { Middleware } = require("../middlewares/auth");
const User = require("../models/user");
const Category = require("../models/category");

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
    const resurses = await Resurs.findAndCountAll({
      where: {
        name: { [Op.like]: `%${search}%` },
      },
      include: [
        {
          model: User,
          attributes: ["fullName"],
        },
        {
          model: Category,
          attributes: ["name"],
        },
      ],
      order: [["name", sort]],
      limit,
      offset,
    });

    res.json({ total: resurses.count, data: resurses.rows });
    logger.info("Получены все ресурсы");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

route.get("/:id", async (req, res) => {
  try {
    const resurs = await Resurs.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ["fullName"],
        },
        {
          model: Category,
          attributes: ["name"],
        },
      ],
    });
    if (!resurs) return res.status(404).json({ message: "Ресурс не найден" });

    res.json(resurs);
    logger.info("Получен ресурс по id");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

const resursPostSchema = Joi.object({
  name: Joi.string().min(2).max(55).required(),
  media: Joi.string().min(2).required(),
  description: Joi.string().min(2).required(),
  categoryId: Joi.number().required(),
  userId: Joi.number().required(),
});

route.post("/", Middleware, async (req, res) => {
  try {
    const { error } = resursPostSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const userId = req.user.id; 
    const { categoryId, name, media, description } = req.body;

    let category = await Category.findByPk(categoryId);
    let user = await User.findByPk(userId);
    if (!category) return res.status(400).json({ message: "Категория не найдена" });
    if (!user) return res.status(400).json({ message: "Пользователь не найден" });

    const newResurs = await Resurs.create({ name, media, description, categoryId, userId });
    res.json(newResurs);
    logger.info("Ресурс создан");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

const resursPatchSchema = Joi.object({
  name: Joi.string().min(2).max(55).optional(),
  media: Joi.string().min(2).optional(),
  description: Joi.string().min(2).optional(),
}).or("name", "media", "description");

route.patch("/:id", Middleware, async (req, res) => {
  try {
    const resurs = await Resurs.findByPk(req.params.id);
    if (!resurs) return res.status(404).json({ message: "Ресурс не найден" });

    if (req.user.role !== "admin" || req.user.role !== "super-admin" && req.user.id !== resurs.userId) {
      return res.status(403).json({ message: "Нет доступа" });
    }

    const { error } = resursPatchSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    await resurs.update(req.body);
    res.json(resurs);
    logger.info("Ресурс изменен");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

route.delete("/:id", Middleware, async (req, res) => {
  try {
    const resurs = await Resurs.findByPk(req.params.id);
    if (!resurs) return res.status(404).json({ message: "Ресурс не найден" });

    if (req.user.role !== "admin" && req.user.id !== resurs.userId) {
      return res.status(403).json({ message: "Нет доступа" });
    }

    await resurs.destroy();
    res.json({ message: "Ресурс удален" });
    logger.info("Ресурс удален");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = route;
