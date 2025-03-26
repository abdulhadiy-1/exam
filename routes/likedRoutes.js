const { Router } = require("express");
const Liked = require("../models/liked");
const { Op } = require("sequelize");
const logger = require("../middlewares/logger");
const Joi = require("joi");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");

const route = Router();

/**
 * @swagger
 * /liked:
 *   get:
 *     summary: Get all liked items
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: List of liked items
 *       404:
 *         description: No liked items found
 */
route.get("/", async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    let userId = req.query.userId;

    let where = {};
    if (userId) {
      where.userId = { [Op.eq]: userId };
    }

    let likedItems = await Liked.findAll({ where, limit, offset });
    if (!likedItems.length)
      return res.status(404).json({ message: "No liked items found" });

    res.json(likedItems);
  } catch (error) {
    console.log(error);
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /liked/{id}:
 *   get:
 *     summary: Get a liked item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A liked item
 *       404:
 *         description: Liked item not found
 */
route.get("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let likedItem = await Liked.findByPk(id);
    if (!likedItem)
      return res.status(404).json({ message: "Liked item not found" });

    res.json(likedItem);
  } catch (error) {
    console.log(error);
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /liked:
 *   post:
 *     summary: Like an item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - eduId
 *             properties:
 *               userId:
 *                 type: integer
 *               eduId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Liked successfully
 *       400:
 *         description: Validation error
 */
route.post("/", async (req, res) => {
  try {
    let { userId, eduId } = req.body;
    let schema = joi.object({
      userId: joi.number().integer().required(),
      eduId: joi.number().integer().required(),
    });

    let { error } = schema.validate({ userId, eduId });
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    await Liked.create({ userId, eduId });
    res.json({ message: "Liked successfully" });
  } catch (error) {
    console.log(error);
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /liked/{id}:
 *   delete:
 *     summary: Unlike an item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liked item deleted
 *       404:
 *         description: Liked item not found
 */
route.delete("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let likedItem = await Liked.findByPk(id);
    if (!likedItem)
      return res.status(404).json({ message: "Liked item not found" });

    await likedItem.destroy();
    res.json({ message: "Liked item deleted" });
  } catch (error) {
    console.log(error);
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = route;
