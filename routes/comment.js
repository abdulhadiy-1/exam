const express = require("express");
const { Op } = require("sequelize");
const Comment = require("../models/comment");
const { commentValidation, patchValidation } = require("../validations/commentValidation");
const { Middleware } = require("../middlewares/auth");
const EduCenter = require("../models/EduCenter");
const logger = require("../middlewares/logger");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Comment
 *     description: API для управления комментариями
 */

/**
 * @swagger
 * /comment:
 *   post:
 *     summary: Создать новый комментарий
 *     tags: [Comment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 minLength: 1
 *               eduId:
 *                 type: integer
 *               star:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Комментарий успешно создан
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Образовательный центр не найден
 */
router.post("/", Middleware, async (req, res) => {
  try {
    let userId = req.user.id;
    const { error } = commentValidation.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    let eduCenter = await EduCenter.findByPk(req.body.eduId);
    if (!eduCenter) {
      return res.status(404).json({ message: "eduCenter not found" });
    }
    await eduCenter.update({star: (eduCenter.star + req.body.star) / 2});
    const comment = await Comment.create({ ...req.body, userId });
    res.status(201).json(comment);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /comment:
 *   get:
 *     summary: Получить список комментариев
 *     tags: [Comment]
 *     responses:
 *       200:
 *         description: Список комментариев получен
 */
router.get("/", async (req, res) => {
  try {
    let { page, limit, sort, order, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    sort = sort || "id";
    order = order || "ASC";

    const where = search ? { text: { [Op.like]: `%${search}%` } } : {};

    const { rows, count } = await Comment.findAndCountAll({
      where,
      order: [[sort, order]],
      limit,
      offset: (page - 1) * limit,
    });

    res.json({ total: count, page, limit, data: rows });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     summary: Получить комментарий по ID
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID комментария
 *     responses:
 *       200:
 *         description: Комментарий найден
 *       404:
 *         description: Комментарий не найден
 */
router.get("/:id", async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json(comment);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /comment/{id}:
 *   patch:
 *     summary: Обновить комментарий по ID
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID комментария
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 minLength: 1
 *               star:
 *                 type: integer
 *               eduId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Комментарий обновлен
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Комментарий не найден
 */
router.patch("/:id", Middleware, async (req, res) => {
  try {
    const { error } = patchValidation.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (req.user.role !== "admin" && req.user.id !== comment.userId) {
      return res.status(403).json({ message: "No access" });
    }
    await comment.update(req.body);
    res.json(comment);
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     summary: Удалить комментарий по ID
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID комментария
 *     responses:
 *       200:
 *         description: Комментарий удален
 *       404:
 *         description: Комментарий не найден
 */
router.delete("/:id", Middleware, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (req.user.role !== "admin" && req.user.id !== comment.userId) {
      return res.status(403).json({ message: "No access" });
    }
    await comment.destroy();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
