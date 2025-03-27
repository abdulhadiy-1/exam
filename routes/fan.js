const express = require("express");
const { Op } = require("sequelize");
const Fan = require("../models/fan");
const fanValidation = require("../validations/fanValidation");
const logger = require("../middlewares/logger");
const { Middleware } = require("../middlewares/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Fan
 *   description: API for managing subjects (fan)
 */

/**
 * @swagger
 * /fan:
 *   post:
 *     summary: Create a new subject
 *     tags: [Fan]
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
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subject created
 *       400:
 *         description: Data validation error
 *       500:
 *         description: Internal server error
 */

router.post("/", Middleware, async (req, res) => {
  try {
    const { error } = fanValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const fan = await Fan.create(req.body);

    res.status(201).json(fan);
    logger.info("A new subject has been created.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /fan:
 *   get:
 *     summary: Get a list of subjects
 *     tags: [Fan]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page (default is 10)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field to sort by (default is id)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sorting order (default is ASC)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *     responses:
 *       200:
 *         description: List of subjects
 *       500:
 *         description: Internal server error
 */

router.get("/", Middleware, async (req, res) => {
  try {
    let { page, limit, sort, order, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    sort = sort || "id";
    order = order || "ASC";

    const where = search ? { name: { [Op.like]: `%${search}%` } } : {};
    const { rows, count } = await Fan.findAndCountAll({
      where,
      order: [[sort, order]],
      limit,
      offset: (page - 1) * limit,
    });

    res.json({ total: count, page, limit, data: rows });
    logger.info("Subjects have been retrieved.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /fan/{id}:
 *   get:
 *     summary: Get a subject by ID
 *     tags: [Fan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject information
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */

router.get("/:id", Middleware, async (req, res) => {
  try {
    const fan = await Fan.findByPk(req.params.id);
    if (!fan) return res.status(404).json({ message: "Subject not found." });

    res.json(fan);
    logger.info("A subject has been fetched.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});
/**
 * @swagger
 * /fan/{id}:
 *   patch:
 *     summary: Update a subject by ID
 *     tags: [Fan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Subject updated
 *       400:
 *         description: Data validation error
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */

router.patch("/:id", Middleware, async (req, res) => {
  try {
    const { error } = fanValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const fan = await Fan.findByPk(req.params.id);
    if (!fan) return res.status(404).json({ message: "Subject not found." });

    const updatedFan = { ...req.body, image: req.file?.path || fan.image };
    await fan.update(updatedFan);

    res.json(fan);
    logger.info("Subject changed.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});
/**
 * @swagger
 * /fan/{id}:
 *   delete:
 *     summary: Delete a subject by ID
 *     tags: [Fan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */

router.delete("/:id", Middleware, async (req, res) => {
  try {
    const fan = await Fan.findByPk(req.params.id);
    if (!fan) return res.status(404).json({ message: "Subject not found." });

    await fan.destroy();
    res.json({ message: "Subject deleted." });
    logger.info("Subject deleted.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = router;
