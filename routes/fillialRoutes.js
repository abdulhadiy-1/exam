const { Router } = require("express");
const Fillial = require("../models/fillial");
const { Op } = require("sequelize");
const logger = require("../middlewares/logger");
const joi = require("joi");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");
const EduCenter = require("../models/EduCenter");
const Region = require("../models/region");
const FillialFan = require("../models/fillialFan");
const FillialSoha = require("../models/fillialSoha");
const Fan = require("../models/fan");
const Soha = require("../models/soha");

const route = Router();

/**
 * @swagger
 * tags:
 *   - name: Fillials
 *     description: API для управления филиалами
 */

/**
 * @swagger
 * /fillial:
 *   get:
 *     summary: Получить список филиалов
 *     tags: [Fillials]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество записей на странице
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Фильтр по названию филиала
 *       - in: query
 *         name: eduname
 *         schema:
 *           type: string
 *         description: Фильтр по названию образовательного центра
 *     responses:
 *       200:
 *         description: Список филиалов
 *       404:
 *         description: Филиалы не найдены
 */
route.get("/", async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    let offset = (page - 1) * limit;
    let name = req.query.name;
    let eduname = req.query.eduname;

    let where = {};
    let eduwhere = {};

    if (name) {
      where.name = { [Op.startsWith]: name };
    }
    if (eduname) {
      eduwhere.name = { [Op.startsWith]: eduname };
    }

    let fillials = await Fillial.findAll({
      where,
      include: [
        {
          model: EduCenter,
          attributes: ["id", "name"],
          where: eduwhere
        },
        {
          model: Fan,
          as: "fanlars",
          attributes: ["id", "name"],
          through: { attributes: [] } 
        },
        {
          model: Soha,
          as: "sohalars",
          attributes: ["id", "name"],
          through: { attributes: [] }
        },
        {
          model: Region,
          as: "region",
          attributes: ["id", "name"]
        }
      ],
      attributes: [
        "id",
        "name",
        "phone",
        "location",
      ],
      limit,
      offset,
    });

    res.json(fillials);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});


/**
 * @swagger
 * /fillial/{id}:
 *   get:
 *     summary: Получить филиал по ID
 *     tags: [Fillials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID филиала
 *     responses:
 *       200:
 *         description: Филиал найден
 *       404:
 *         description: Филиал не найден
 */
route.get("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let fillial = await Fillial.findByPk(id, {
      include: [
        {
          model: EduCenter,
          attributes: ["id", "name"]
        },
        {
          model: Fan,
          as: "fanlars",
          attributes: ["id", "name"],
          through: { attributes: [] }
        },
        {
          model: Soha,
          as: "sohalars",
          attributes: ["id", "name"],
          through: { attributes: [] }
        },
        {
          model: Region,
          as: "region",
          attributes: ["id", "name"]
        }
      ],
      attributes: [
        "id",
        "name",
        "phone",
        "location",
      ]
    });

    if (!fillial) return res.status(404).json({ message: "Fillial not found" });

    res.json(fillial);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});


/**
 * @swagger
 * /fillial:
 *   post:
 *     summary: Создать филиал
 *     tags: [Fillials]
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
 *               phone:
 *                 type: string
 *                 minLength: 7
 *               location:
 *                 type: string
 *                 minLength: 2
 *               regionId:
 *                 type: integer
 *               fanlar:
 *                 type: array
 *                 items:
 *                   type: integer
 *               sohalar:
 *                 type: array
 *                 items:
 *                   type: integer
 *               eduId:
 *                 type: integer
 *               image:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       201:
 *         description: Филиал создан
 *       400:
 *         description: Ошибка валидации
 *       403:
 *         description: Нет прав для создания филиала
 */
route.post("/", Middleware, RoleMiddleware(["admin", "CEO"]), async (req, res) => {
  try {
    let userId = req.user.id;
    let { eduId, regionId, fanlar, sohalar, ...rest } = req.body;
    
    let schema = joi.object({
      name: joi.string().min(2).required(),
      phone: joi.string().min(7).required(),
      location: joi.string().min(2).required(),
      regionId: joi.number().integer().required(),
      fanlar: joi.array().items(joi.number()).required(),
      sohalar: joi.array().items(joi.number()).required(),
      eduId: joi.number().integer().required(),
      image: joi.string().min(2).required(),
    });

    let { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    let region = await Region.findByPk(regionId);
    let eduCenter = await EduCenter.findByPk(eduId);

    if (!eduCenter) return res.status(404).json({ message: "eduCenter not found" });
    if (req.user.role == "CEO" && (!eduCenter.userId || eduCenter.userId !== userId))
      return res.status(403).json({ message: "Нет прав на выполнение действия" });
    if (!region) return res.status(404).json({ message: "region not found" });

    let fillial = await Fillial.create({ ...rest, eduId, regionId, fanlar, sohalar });

    await Promise.all(
      fanlar.map(fanId => FillialFan.create({ fanId, fillialId: fillial.id }))
    );
    await Promise.all(
      sohalar.map(sohaId => FillialSoha.create({ sohaId, fillialId: fillial.id }))
    );

    res.status(201).json({ message: "Fillial created", fillial });
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});


/**
 * @swagger
 * /fillial/{id}:
 *   patch:
 *     summary: Обновить филиал по ID
 *     tags: [Fillials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID филиала
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
 *                 type: array
 *                 items:
 *                   type: integer
 *               sohalar:
 *                 type: array
 *                 items:
 *                   type: integer
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Филиал обновлён
 *       400:
 *         description: Ошибка валидации
 */
route.patch("/:id", Middleware, RoleMiddleware(["admin", "CEO", "super-admin"]), async (req, res) => {
  try {
    let { id } = req.params;
    let userId = req.user.id;
    
    let fillial = await Fillial.findByPk(id);
    if (!fillial) return res.status(404).json({ message: "Fillial not found" });

    if (req.user.role === "CEO" && fillial.userId !== userId) {
      return res.status(403).json({ message: "Нет прав на выполнение действия" });
    }

    let schema = joi.object({
      name: joi.string().min(2),
      phone: joi.string().min(7),
      location: joi.string().min(2),
      regionId: joi.number().integer(),
      image: joi.string().min(2),
    });

    let { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    await fillial.update({
      name: req.body.name || fillial.name,
      phone: req.body.phone || fillial.phone,
      location: req.body.location || fillial.location,
      regionId: req.body.regionId || fillial.regionId,
      image: req.body.image || fillial.image,
    });

    res.json({ message: "Fillial updated", fillial});
  } catch (error) {
    res.status(500).json({ message: error.message });
    logger.error(error.message);
  }
});
/**
 * @swagger
 * /fillial/{id}:
 *   delete:
 *     summary: Удалить филиал по ID
 *     tags: [Fillials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID филиала
 *     responses:
 *       200:
 *         description: Филиал успешно удален
 *       403:
 *         description: Нет прав на удаление филиала
 *       404:
 *         description: Филиал не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */



route.delete(
  "/:id",
  Middleware,
  RoleMiddleware(["admin", "CEO"]),
  async (req, res) => {
    try {
      let { id } = req.params;
      let userId = req.user.id;

      let fillial = await Fillial.findByPk(id);
      if (!fillial) 
        return res.status(404).json({ message: "Fillial not found" });

      if (req.user.role === "CEO" && fillial.userId !== userId) {
        return res.status(403).json({ message: "Нет прав на удаление" });
      }

      await fillial.destroy();

      res.status(200).json({ message: "Fillial deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
      logger.error(error.message);
    }
  }
);


module.exports = route;
