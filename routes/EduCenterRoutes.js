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
const Comment = require("../models/comment");
const User = require("../models/user");

const route = Router();
/**
 * @swagger
 * tags:
 *   name: EduCenters
 *   description: API для управления образовательными центрами
 */

/**
 * @swagger
 * /edu-center:
 *   get:
 *     summary: Получить список образовательных центров
 *     tags: [EduCenters]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество записей на странице (по умолчанию 10)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы (по умолчанию 1)
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Поиск по названию (начинается с)
 *     responses:
 *       200:
 *         description: Список образовательных центров
 *       404:
 *         description: Образовательные центры не найдены
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
        },
        {
          model: Comment,
          as: "comments",
          attributes: ["id", "comment", "star"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "fullName", "email"]
            }
          ]
        }
      ],
      attributes: [
        "id",
        "image",
        "location",
        "phone",
        "name",
        "star",
        "createdAt",
        "updatedAt",

      ],
      limit, 
      offset
    });

    res.json({
      total: count,
      page,
      limit,
      data: rows
    });
  } catch (error) {
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
/**
 * @swagger
 * /edu-center/{id}:
 *   get:
 *     summary: Получить образовательный центр по ID
 *     tags: [EduCenters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID образовательного центра
 *     responses:
 *       200:
 *         description: Информация об образовательном центре
 *       404:
 *         description: Образовательный центр не найден
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
        },
        {
          model: Comment,
          as: "comments",
          attributes: ["id", "comment", "star"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "fullName", "email"]
            }
          ]
        }
      ]
    });

    if (!eduCenter)
      return res.status(404).json({ message: "Education center not found" });

    res.json(eduCenter);
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});


/**
 * @swagger
 * /edu-center:
 *   post:
 *     summary: Создать новый образовательный центр
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
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Образовательный центр создан
 *       400:
 *         description: Ошибка валидации данных
 *       403:
 *         description: Нет прав на создание центра
 */

route.post(
  "/",
  Middleware,
  RoleMiddleware(["admin", "CEO"]),
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
      const region = await Region.findByPk(regionId);
      if (!region) {  
        return res.status(404).json({ message: "Region not found" });
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

      res.json({ message: "Education center created", eduCenter });
    } catch (error) {
      res.status(500).json({ message: error.message });
      logger.error(error.message);
    }
  }
);

/**
 * @swagger
 * /edu-center/{id}:
 *   patch:
 *     summary: Обновить образовательный центр по ID
 *     tags: [EduCenters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID образовательного центра
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
 *               licetion:
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
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Образовательный центр обновлён
 *       400:
 *         description: Ошибка валидации данных
 *       403:
 *         description: Нет прав на обновление центра
 *       404:
 *         description: Образовательный центр не найден
 */

route.patch(
  "/:id",
  Middleware,
  RoleMiddleware(["admin", "CEO", "super-admin"]),
  async (req, res) => {
    try {
      let userId = req.user.id;
      let { id } = req.params;
      let eduCenter = await EduCenter.findByPk(id);
      if (!eduCenter)
        return res.status(404).json({ message: "Education center not found" });

      if (req.user.role === "CEO" && userId != eduCenter.userId) {
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

      res.json({ message: "Education center updated", eduCenter });
    } catch (error) {
      res.status(500).json({ message: error.message });
      logger.error(error.message);
    }
  }
);


/**
 * @swagger
 * /edu-center/{id}:
 *   delete:
 *     summary: Удалить образовательный центр по ID
 *     tags: [EduCenters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID образовательного центра
 *     responses:
 *       200:
 *         description: Образовательный центр удалён
 *       403:
 *         description: Нет прав на удаление центра
 *       404:
 *         description: Образовательный центр не найден
 */
route.delete(
  "/:id",
  Middleware,
  RoleMiddleware(["admin", "CEO"]),
  async (req, res) => {
    try {
      let userId = req.user.id;
      let { id } = req.params;
      let eduCenter = await EduCenter.findByPk(id);

      if (!eduCenter) {
        return res.status(404).json({ message: "Education center not found" });
      }

      if (req.user.role === "CEO" && userId != eduCenter.userId) {
        return res
          .status(403)
          .json({ message: "siz bu amaliyotni bajara olmaysiz" });
      }

      await EduFan.destroy({ where: { eduId: eduCenter.id } });

      await eduCenter.destroy();

      res.json({ message: "Education center deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
      logger.error(error.message);
    }})

module.exports = route;
