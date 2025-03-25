const { Op } = require("sequelize");
const User = require("../models/user");
const { Router } = require("express");
const logger = require("../middlewares/logger");
const Joi = require("joi");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");
const Region = require("../models/region");
const route = Router();

route.get("/", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
  try {
    let limit = Number(req.query.limit) || 10;
    let page = Number(req.query.page) || 1;
    let offset = limit * (page - 1);
    let name = req.query.name || "";
    let email = req.query.email || "";
    let phone = req.query.phone || "";
    let role = req.query.role || "";
    let status = req.query.status || "";
    let sort = ["ASC", "DESC"].includes(req.query.sort?.toUpperCase())
    ? req.query.sort.toUpperCase()
    : "ASC";
    let where = {};
    if (name) where.fullName = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (phone) where.phone = { [Op.like]: `%${phone}%` };
    if (role) where.role = { [Op.like]: `%${role}%` };
    if (status) where.status = { [Op.like]: `%${status}%` };

    const users = await User.findAndCountAll({
      where,
      order: [["fullName", sort]],
      limit: limit,
      offset: offset,
    });
    res.json({ total: users.count, data: users.rows });
    logger.info("Получены все users");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

route.get("/:id", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "user не найден" });
    }
    res.json(user);
    logger.info("Получен user по id");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});


route.patch("/:id", Middleware, async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User не найден" });
    }
    if (req.user.role === "user" && req.user.id !== user.id) {
      return res
        .status(403)
        .json({ message: "У вас нет прав на изменение данного пользователя" });
    }
    const schema = Joi.object({
      fullName: Joi.string().min(2).max(55).optional(),
      email: Joi.string().email().optional(),
      password: Joi.string().min(6).max(55).optional(),
      phone: Joi.string()
        .pattern(/^\+\d{12}$/)
        .optional(),
      role: Joi.string().valid("admin", "user", "super-admin").optional(),
    });
    let { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    if (req.body.regionId) {
      let isValid = await Region.findByPk(req.body.regionId);
      if (!isValid) {
        return res.status(400).json({ message: "Region не найден" });
      }
    }
    if (req.body.email) {
      let isValid = await User.findOne({ where: { email: req.body.email } });
      if (isValid) {
        return res.status(400).json({ message: "Email уже занят" });
      }
    }
    if (req.body.phone) {
      let isValid = await User.findOne({ where: { phone: req.body.phone } });
      if (isValid) {
        return res.status(400).json({ message: "number уже занят" });
      }
    }
    await user.update(req.body);
    res.json(user);
    logger.info("User изменен");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

route.delete("/:id", Middleware, async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User не найден" });
    }
    if (req.user.role !== "admin" && req.user.id !== user.id) {
      return res
        .status(403)
        .json({ message: "У вас нет прав на удаление данного пользователя" });
    }
    await user.destroy();
    res.json({ message: "User удален" });
    logger.info("User удален");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = route;
