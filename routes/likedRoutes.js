const { Router } = require("express");
const Liked = require("../models/liked");
const { Op } = require("sequelize");
const logger = require("../middlewares/logger");
const joi = require("joi");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");
const User = require("../models/user");
const EduCenter = require("../models/EduCenter");

const route = Router();

/**
 * @swagger
 * tags:
 *   name: Liked
 *   description: API for managing liked items
 *
 * /liked:
 *   get:
 *     summary: Get all liked items
 *     tags: [Liked]
 *     tags: [Liked]
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
      where.userId = userId;
      where.userId = userId;
    }

    let likedItems = await Liked.findAll({
      where,
      include: [
        {
          model: EduCenter,
          as: "eduCenter",
          attributes: ["id", "name", "image"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email"],
        },
      ],
      limit,
      offset,
    });

    res.json(likedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /liked/{id}:
 *   get:
 *     summary: Get a liked item by ID
 *     tags: [Liked]
 *     tags: [Liked]
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
    let likedItem = await Liked.findByPk(id, {
      include: [
        {
          model: EduCenter,
          as: "eduCenter",
          attributes: ["id", "name", "image"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    if (!likedItem)
      return res.status(404).json({ message: "Liked item not found" });

    res.json(likedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /liked:
 *   post:
 *     summary: Like an item
 *     tags: [Liked]
 *     tags: [Liked]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eduId
 *             properties:
 *               eduId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Liked successfully
 *       400:
 *         description: Validation error
 */
route.post("/", Middleware, async (req, res) => {
  try {
    let  userId  = req.user.id;
    let { eduId } = req.body;

    let schema = joi.object({
      eduId: joi.number().integer().required(),
    });

    let { error } = schema.validate({ eduId });
    if (error)
      return res.status(400).json({ message: error.details[0].message });    
    let eduCenter = await EduCenter.findByPk(eduId);
    if (!eduCenter) 
      return res.status(404).json({ message: "Education center not found" });

    let [liked, created] = await Liked.findOrCreate({
      where: { userId, eduId },
    });

    if (!created) {
      return res.status(400).json({ message: "Already liked" });
    }

    res.json({ message: "Liked successfully", liked });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /liked/{id}:
 *   delete:
 *     summary: Unlike an item
 *     tags: [Liked]
 *     tags: [Liked]
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
route.delete("/:id", Middleware, async (req, res) => {
  try {
    let  userId  = req.user.id;
    let { eduId } = req.params;

    let likedItem = await Liked.findOne({ where: { userId, eduId } });

    if (!likedItem)
      return res.status(404).json({ message: "Liked item not found" });

    await likedItem.destroy();
    res.json({ message: "Liked item deleted successfully" });
    res.json({ message: "Liked item deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = route;

