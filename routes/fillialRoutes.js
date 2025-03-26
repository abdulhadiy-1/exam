const { Router } = require("express");
const Fillial = require("../models/fillial");
const { Op } = require("sequelize");
<<<<<<< HEAD
const joi = require("joi");
=======
const logger = require("../middlewares/logger");
const Joi = require("joi");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");

>>>>>>> f6b507aef6769a34eaeb1c3f98d39d7b6ed6e013

const route = Router();

/**
 * @swagger
 * /fillials:
 *   get:
 *     summary: Get all fillials
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by name
 *     responses:
 *       200:
 *         description: List of fillials
 *       404:
 *         description: No fillials found
 */
route.get("/", async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    let name = req.query.name;
    
    let where = {};
    if (name) {
      where.name = { [Op.startsWith]: name };
    }

    let fillials = await Fillial.findAll({ where, limit, offset });
    if (!fillials.length)
      return res.status(404).json({ message: "No fillials found" });

    res.json(fillials);
  } catch (error) {
    console.log(error);
<<<<<<< HEAD
    res.status(500).json({ message: "Server error" });
=======
    res.status(600).json({ message: error.message });
    logger.error(error.message);
>>>>>>> f6b507aef6769a34eaeb1c3f98d39d7b6ed6e013
  }
});

/**
 * @swagger
 * /fillials/{id}:
 *   get:
 *     summary: Get a fillial by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The fillial ID
 *     responses:
 *       200:
 *         description: Fillial details
 *       404:
 *         description: Fillial not found
 */
route.get("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let fillial = await Fillial.findByPk(id);
    if (!fillial)
      return res.status(404).json({ message: "Fillial not found" });

    res.json(fillial);
  } catch (error) {
    console.log(error);
<<<<<<< HEAD
    res.status(500).json({ message: "Server error" });
=======
    res.status(600).json({ message: error.message });
    logger.error(error.message);
>>>>>>> f6b507aef6769a34eaeb1c3f98d39d7b6ed6e013
  }
});

/**
 * @swagger
 * /fillials:
 *   post:
 *     summary: Create a new fillial
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - location
 *               - regionId
 *               - fanlar
 *               - sohalar
 *               - eduId
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               location:
 *                 type: string
 *               regionId:
 *                 type: integer
 *               fanlar:
 *                 type: string
 *               sohalar:
 *                 type: string
 *               eduId:
 *                 type: integer
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fillial created
 *       400:
 *         description: Validation error
 */
route.post("/", async (req, res) => {
  try {
    let { name, phone, location, regionId, fanlar, sohalar, eduId, image } = req.body;
    let schema = joi.object({
      name: joi.string().min(2).required(),
      phone: joi.string().min(7).required(),
      location: joi.string().min(2).required(),
      regionId: joi.number().integer().required(),
      fanlar: joi.string().min(2).required(),
      sohalar: joi.string().min(2).required(),
      eduId: joi.number().integer().required(),
      image: joi.string().min(2).required(),
    });

    let { error } = schema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    await Fillial.create(req.body);
    res.status(201).json({ message: "Fillial created" });
  } catch (error) {
    console.log(error);
<<<<<<< HEAD
    res.status(500).json({ message: "Server error" });
=======
    res.status(600).json({ message: error.message });
    logger.error(error.message);
>>>>>>> f6b507aef6769a34eaeb1c3f98d39d7b6ed6e013
  }
});

/**
 * @swagger
 * /fillials/{id}:
 *   patch:
 *     summary: Update a fillial
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The fillial ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               location:
 *                 type: string
 *               regionId:
 *                 type: integer
 *               fanlar:
 *                 type: string
 *               sohalar:
 *                 type: string
 *               eduId:
 *                 type: integer
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fillial updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Fillial not found
 */
route.patch("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let fillial = await Fillial.findByPk(id);
    if (!fillial)
      return res.status(404).json({ message: "Fillial not found" });

    let { error } = joi.object({
      name: joi.string().min(2),
      phone: joi.string().min(7),
      location: joi.string().min(2),
      regionId: joi.number().integer(),
      fanlar: joi.string().min(2),
      sohalar: joi.string().min(2),
      eduId: joi.number().integer(),
      image: joi.string().min(2),
    }).validate(req.body);

    if (error) return res.status(400).json({ message: error.details[0].message });

    await fillial.update(req.body);
    res.json({ message: "Fillial updated" });
  } catch (error) {
    console.log(error);
<<<<<<< HEAD
    res.status(500).json({ message: "Server error" });
=======
    res.status(600).json({ message: error.message });
    logger.error(error.message);
>>>>>>> f6b507aef6769a34eaeb1c3f98d39d7b6ed6e013
  }
});

module.exports = route;
