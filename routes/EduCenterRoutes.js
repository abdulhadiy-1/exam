const { Router } = require("express");
const EduCenter = require("../models/EduCenter");
const logger = require("../middlewares/logger");
const { Op } = require("sequelize");
const joi = require("joi");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");

const route = Router();

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

    let eduCenters = await EduCenter.findAll({ where, limit, offset });
    if (!eduCenters.length)
      return res.status(404).json({ message: "No education centers found" });

    res.json(eduCenters);
  } catch (error) {
    console.log(error);
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

route.get("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let eduCenter = await EduCenter.findByPk(id);
    if (!eduCenter)
      return res.status(404).json({ message: "Education center not found" });

    res.json(eduCenter);
  } catch (error) {
    console.log(error);
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

route.post("/",Middleware,RoleMiddleware(['admin','seo']), async (req, res) => {
  try {
    let userId = req.user.id
    let { image, regionId,  licetion, phone, name, fan, soha } =
      req.body;
    let schema = joi.object({
      image: joi.string().min(2).required(),
      regionId: joi.number().min().required(),
      licetion: joi.string().min(2).required(),
      phone: joi.string().min(7).required(),
      name: joi.string().min(2).required(),
      fan: joi.array().items(joi.number()).required(),
      soha: joi.string().min(2).required(),
    });

    let { error } = schema.validate({
      image,
      regionId,
      licetion,
      phone,
      name,
      fan,
      soha,
    });
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    await EduCenter.create({
      image,
      regionId,
      licetion,
      phone,
      name,
      fan,
      soha,
    });
    res.json({ message: "Education center created" });
  } catch (error) {
    console.log(error);
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

route.patch("/:id",Middleware,RoleMiddleware(['admin','seo','super-admin']), async (req, res) => {
  try {
    let userId = req.user.id 
    let { id } = req.params;
    let eduCenter = await EduCenter.findByPk(id);
    if (!eduCenter)
      return res.status(404).json({ message: "Education center not found" });
    if (req.user.role === 'seo' && userId != eduCenter.userId ){
      return res.status(403).json({message: 'siz bu amaliyotni bajara olmaysiz'})
    };

    let { image, regionId,  licetion, phone, name, fan, soha } =
      req.body;
    let schema = joi.object({
      image: joi.string().min(2),
      regionId: joi.number().integer(),
      licetion: joi.string().min(2),
      phone: joi.string().min(7),
      name: joi.string().min(2),
      fan: joi.array().items(joi.number()).required(),
      soha: joi.string().min(2),
    });

    let { error } = schema.validate({
      image,
      regionId,
      licetion,
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
      licetion,
      phone,
      name,
      fan,
      soha,
    });
    res.json({ message: "Education center updated" });
  } catch (error) {
    console.log(error);
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

route.delete("/:id",Middleware,RoleMiddleware(['admin','seo']), async (req, res) => {
  try {
    let userId = req.user.id 
    let { id } = req.params;
    let eduCenter = await EduCenter.findByPk(id);
    if (!eduCenter)
      return res.status(404).json({ message: "Education center not found" });
    if (req.user.role === 'seo' && userId != eduCenter.userId ){
      return res.status(403).json({message: 'siz bu amaliyotni bajara olmaysiz'})};

    await eduCenter.destroy();
    res.json({ message: "Education center deleted" });
  } catch (error) {
    console.log(error);
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = route;
