const { Router } = require("express");
const EduCenter = require("../models/EduCenter");
const logger = require("../middlewares/logger");
const { Op } = require("sequelize");
const joi = require("joi");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");
const Fan = require("../models/fan");
const Soha = require("../models/soha");
const EduFan = require("../models/eduFan");
const EduSoha = require("../models/eduSoha");
const Region = require("../models/region");

const route = Router();
/**
 * @swagger
 * tags:
 *   name: EduCenters
 *   description: API for managing educational centers
 */

/**
 * @swagger
 * /edu-center:
 *   get:
 *     summary: Get a list of educational centers
 *     tags: [EduCenters]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page (default is 10)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default is 1)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by name (starts with)
 *     responses:
 *       200:
 *         description: List of educational centers
 *       404:
 *         description: Educational centers not found
 */

route.get("/", async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    let name = req.query.name;

    let where = {};
    if (name) {
      where.name = { [Op.iLike]: '${name}%' }; 
    }

    let { count, rows } = await EduCenter.findAndCountAll({
      where,
      include: [
        {
          model: Fan,
          as: "fans",
          attributes: ["id", "name"],
          through: { attributes: [] }
        },
        {
          model: Soha,
          as: "sohas",
          attributes: ["id", "name"],
          through: { attributes: [] }
        },
        {
          model: Region,
          as: "region",
          attributes: ["id", "name"]
        }
      ],
      limit, 
      offset
    });

    if (!rows.length)
      return res.status(404).json({ message: "No education centers found" });

    res.json({
      total: count,
      page,
      limit,
      data: rows
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});

/**
 * @swagger
 * /edu-center/{id}:
 *   get:
 *     summary: Get an educational center by ID
 *     tags: [EduCenters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the educational center
 *     responses:
 *       200:
 *         description: Information about the educational center
 *       404:
 *         description: Educational center not found
 */
route.get("/:id", async (req, res) => {
  try {
    let { id } = req.params;

    let eduCenter = await EduCenter.findByPk(id, {
      include: [
        {
          model: Fan,
          as: "fans",
          attributes: ["id", "name"],
          through: { attributes: [] }
        },
        {
          model: Soha,
          as: "sohas",
          attributes: ["id", "name"],
          through: { attributes: [] }
        },
        {
          model: Region,
          as: "region",
          attributes: ["id", "name"]
        }
      ]
    });

    if (!eduCenter)
      return res.status(404).json({ message: "Education center not found" });

    res.json(eduCenter);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});
  /**
 * @swagger
 * /edu-center:
 *   post:
 *     summary: Create a new educational center
 *     tags: [EduCenters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 minLength: 2
 *               regionId:
 *                 type: integer
 *                 minimum: 1
 *               location:
 *                 type: string
 *                 minLength: 2
 *               phone:
 *                 type: string
 *                 minLength: 7
 *               name:
 *                 type: string
 *                 minLength: 2
 *               fan:
 *                 type: array
 *                 items:
 *                   type: integer
 *               soha:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       201:
 *         description: Educational center created
 *       400:
 *         description: Data validation error
 *       403:
 *         description: No permission to create a center
 */


route.post(
  "/",
  Middleware,
  RoleMiddleware(["admin", "seo"]),
  async (req, res) => {
    try {
      let userId = req.user.id;
      let { image, regionId, location, phone, name, fan, soha } = req.body;

      let schema = joi.object({
        image: joi.string().min(2).required(),
        regionId: joi.number().min(0).required(),
        location: joi.string().min(2).required(),
        phone: joi.string().min(7).required(),
        name: joi.string().min(2).required(),
        fan: joi.array().items(joi.number()).required(),
        soha: joi.array().items(joi.number()).required(),
      });

      let { error } = schema.validate({
        image,
        regionId,
        location,
        phone,
        name,
        fan,
        soha,
      });

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const foundFans = await Fan.findAll({ where: { id: fan } });
      if (foundFans.length !== fan.length) {
        return res.status(404).json({ message: "One or more fans not found" });
      }

      const foundSohas = await Soha.findAll({ where: { id: soha } });
      if (foundSohas.length !== soha.length) {
        return res.status(404).json({ message: "One or more sohas not found" });
      }

      let eduCenter = await EduCenter.create({
        image,
        regionId,
        userId,
        location,
        phone,
        name,
        fan,
        soha,
      });


await Promise.all(
        fan.map((fanId) => EduFan.create({ fanId, eduId: eduCenter.id }))
      );
      await Promise.all(
        soha.map((sohaId) =>
          EduSoha.create({ sohaId, eduId: eduCenter.id })
        )
      );

      res.json({ message: "Education center created" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
      logger.error(error.message);
    }
  }
  );

/**
 * @swagger
 * /edu-center/{id}:
 *   patch:
 *     summary: Update an educational center by ID
 *     tags: [EduCenters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the educational center
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 minLength: 2
 *               regionId:
 *                 type: integer
 *               licetion:  // Possible typo? Should it be "location"?
 *                 type: string
 *                 minLength: 2
 *               phone:
 *                 type: string
 *                 minLength: 7
 *               name:
 *                 type: string
 *                 minLength: 2
 *               fan:
 *                 type: array
 *                 items:
 *                   type: integer
 *               soha:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       200:
 *         description: Educational center updated
 *       400:
 *         description: Data validation error
 *       403:
 *         description: No permission to update the center
 *       404:
 *         description: Educational center not found
 */


route.patch("/:id", Middleware, RoleMiddleware(["admin", "seo", "super-admin"]),
  async (req, res) => {
    try {
      let userId = req.user.id;
      let { id } = req.params;
      let eduCenter = await EduCenter.findByPk(id);
      if (!eduCenter)
        return res.status(404).json({ message: "Education center not found" });

      if (req.user.role === "seo" && userId != eduCenter.userId) {
        return res
          .status(403)
          .json({ message: "siz bu amaliyotni bajara olmaysiz" });
      }

      let { image, regionId, location, phone, name, fan, soha } = req.body;
      let schema = joi.object({
        image: joi.string().min(2),
        regionId: joi.number().integer(),
        location: joi.string().min(2),
        phone: joi.string().min(7),
        name: joi.string().min(2),
        fan: joi.array().items(joi.number()),
        soha: joi.array().items(joi.number()),
      });

      let { error } = schema.validate({
        image,
        regionId,
        location,
        phone,
        name,
        fan,
        soha,
      });

      if (error)
        return res.status(400).json({ message: error.details[0].message });

      await eduCenter.update({
        image,
        regionId,
        location,
        phone,
        name,
      });

      if (fan) {
        await EduFan.destroy({ where: { eduId: eduCenter.id } });
        await Promise.all(
          fan.map((fanId) => EduFan.create({ fanId, eduId: eduCenter.id }))
        );
      }

      if (soha) {
        await EduSoha.destroy({ where: { eduId: eduCenter.id } });
        await Promise.all(
          soha.map((sohaId) =>
            EduSoha.create({ sohaId, eduId: eduCenter.id })
          )
        );
      }

      res.json({ message: "Education center updated" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
      logger.error(error.message);
    }
  }
);

/**
 * @swagger
 * /edu-center/{id}:
 *   delete:
 *     summary: Delete an educational center by ID
 *     tags: [EduCenters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the educational center
 *     responses:
 *       200:
 *         description: Educational center deleted
 *       403:
 *         description: No permission to delete the center
 *       404:
 *         description: Educational center not found
 */

route.delete("/:id", Middleware, RoleMiddleware(["admin", "seo"]),
  async (req, res) => {
    try {
      let userId = req.user.id;
      let { id } = req.params;
      let eduCenter = await EduCenter.findByPk(id);

      if (!eduCenter) {
        return res.status(404).json({ message: "Education center not found" });
      }

      if (req.user.role === "seo" && userId != eduCenter.userId) {
        return res
          .status(403)
          .json({ message: "siz bu amaliyotni bajara olmaysiz" });
      }

      await EduFan.destroy({ where: { eduId: eduCenter.id } });
      await EduSoha.destroy({ where: { eduId: eduCenter.id } });

      await eduCenter.destroy();

      res.json({ message: "Education center deleted" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
      logger.error(error.message);
    }
  }
);


module.exports = route;
