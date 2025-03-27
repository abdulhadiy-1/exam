const express = require("express");
const { Op } = require("sequelize");
const Soha = require("../models/soha");
const sohaValidation = require("../validations/sohaValidation");
const logger = require("../middlewares/logger");
const { Middleware } = require("../middlewares/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Soha
 *   description: API for Industry Management (soha)
 */

/**
 * @swagger
 * /soha:
 *   post:
 *     summary: Create a new industry
 *     tags: [Soha]
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
 *         description: Industry created
 *       400:
 *         description: Data validation error
 *       500:
 *         description: Internal server error
 */

router.post("/", Middleware, async (req, res) => {
  try {
    const { error } = sohaValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const soha = await Soha.create(req.body);
    res.status(201).json(soha);
    logger.info("A new field has been created.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /soha:
 *   get:
 *     summary: Get a list of industries
 *     tags: [Soha]
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
 *         description: Field for sorting (default is id)
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
 *         description: List of industries
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
    const { rows, count } = await Soha.findAndCountAll({
      where,
      order: [[sort, order]],
      limit,
      offset: (page - 1) * limit,
    });

    res.json({ total: count, page, limit, data: rows });
    logger.info("Industry have been retrieved.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});
/**
 * @swagger
 * /soha/{id}:
 *   get:
 *     summary: Get industry by ID
 *     tags: [Soha]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Industry ID
 *     responses:
 *       200:
 *         description: Industry information
 *       404:
 *         description: Industry not found
 *       500:
 *         description: Internal server error
 */

router.get("/:id", Middleware, async (req, res) => {
  try {
    const soha = await Soha.findByPk(req.params.id);
    if (!soha) return res.status(404).json({ message: "Industry not found." });

    res.json(soha);
    logger.info("A field has been fetched.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});
/**
 * @swagger
 * /soha/{id}:
 *   patch:
 *     summary: Update industry by ID
 *     tags: [Soha]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Industry ID
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
 *         description: Industry updated
 *       400:
 *         description: Data validation error
 *       404:
 *         description: Industry not found
 *       500:
 *         description: Internal server error
 */

router.patch("/:id", Middleware, async (req, res) => {
  try {
    const { error } = sohaValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const soha = await Soha.findByPk(req.params.id);
    if (!soha) return res.status(404).json({ message: "Industry not found." });

    const updatedSoha = { ...req.body, image: req.file?.path || soha.image };
    await soha.update(updatedSoha);
    res.json(soha);
    logger.info("Industry changed.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /soha/{id}:
 *   delete:
 *     summary: Delete industry by ID
 *     tags: [Soha]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Industry ID
 *     responses:
 *       200:
 *         description: Industry deleted
 *       404:
 *         description: Industry not found
 *       500:
 *         description: Internal server error
 */

router.delete("/:id", Middleware, async (req, res) => {
  try {
    const soha = await Soha.findByPk(req.params.id);
    if (!soha) return res.status(404).json({ message: "Industry not found." });

    await soha.destroy();
    res.json({ message: "Industry deleted." });
    logger.info("Industry deleted.");
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = router;
