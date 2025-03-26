const { Op } = require("sequelize");
const User = require("../models/user");
const { Router } = require("express");
const logger = require("../middlewares/logger");
const Joi = require("joi");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");
const Region = require("../models/region");

const route = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: API для управления пользователями
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получить список пользователей
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество пользователей на странице
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Фильтр по имени
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Фильтр по email
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Фильтр по телефону
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Фильтр по роли
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Фильтр по статусу
 *     responses:
 *       200:
 *         description: Список пользователей получен
 */
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
      limit,
      offset,
    });
    res.json({ total: users.count, data: users.rows });
    logger.info("All users retrieved");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь найден
 *       404:
 *         description: Пользователь не найден
 */
route.get("/:id", Middleware, RoleMiddleware(["admin"]), async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
    logger.info("User retrieved by ID");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Обновить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 55
 *               phone:
 *                 type: string
 *                 pattern: "^\+\d{12}$"
 *               role:
 *                 type: string
 *                 enum: [admin, user, super-admin]
 *     responses:
 *       200:
 *         description: Пользователь успешно обновлён
 *       400:
 *         description: Ошибка валидации данных
 *       403:
 *         description: Нет прав для обновления данного пользователя
 *       404:
 *         description: Пользователь не найден
 */
route.patch("/:id", Middleware, async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.user.role === "user" && req.user.id !== user.id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this user" });
      }
    const schema = Joi.object({
      fullName: Joi.string().min(2).max(55).optional(),
      phone: Joi.string()
        .pattern(/^\+\d{12}$/)
        .optional(),
      role: Joi.string().valid("admin", "user", "super-admin").optional(),
    });
    let { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    await user.update(req.body);
    res.json(user);
    logger.info("User updated");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Удалить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь успешно удалён
 *       403:
 *         description: Нет прав для удаления данного пользователя
 *       404:
 *         description: Пользователь не найден
 */
route.delete("/:id", Middleware, async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (req.user.role !== "admin" && req.user.id !== user.id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this user" });
    }
    await user.destroy();
    res.json({ message: "User deleted" });
    logger.info("User deleted");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = route;
