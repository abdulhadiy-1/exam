const { Router } = require("express");
const EduCenter = require("../models/EduCenter");
<<<<<<< HEAD
const { Op } = require("sequelize");
const joi = require("joi");
=======
const logger = require("../middlewares/logger");
const { Op } = require("sequelize");
const joi = require("joi");
const { Middleware, RoleMiddleware } = require("../middlewares/auth");
>>>>>>> f6b507aef6769a34eaeb1c3f98d39d7b6ed6e013

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
<<<<<<< HEAD
    res.status(500).json({ message: "Server error" });
=======
    res.status(600).json({ message: error.message });
    logger.error(error.message);
>>>>>>> f6b507aef6769a34eaeb1c3f98d39d7b6ed6e013
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
<<<<<<< HEAD
    res.status(500).json({ message: "Server error" });
=======
    res.status(600).json({ message: error.message });
    logger.error(error.message);
>>>>>>> f6b507aef6769a34eaeb1c3f98d39d7b6ed6e013
  }
});


route.post("/", async (req, res) => {
  try {
    let { image, regionId, userId, licetion, phone, name, fan, soha } = req.body;
    let schema = joi.object({
      image: joi.string().min(2).required(),
      regionId: joi.number().integer().required(),
      userId: joi.number().integer().required(),
      licetion: joi.string().min(2).required(),
      phone: joi.string().min(7).required(),
      name: joi.string().min(2).required(),
      fan: joi.string().min(2).required(),
      soha: joi.string().min(2).required(),
    });

    let { error } = schema.validate({ image, regionId, userId, licetion, phone, name, fan, soha });
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    await EduCenter.create({ image, regionId, userId, licetion, phone, name, fan, soha });
    res.json({ message: "Education center created" });
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

route.patch("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let eduCenter = await EduCenter.findByPk(id);
    if (!eduCenter)
      return res.status(404).json({ message: "Education center not found" });

    let { image, regionId, userId, licetion, phone, name, fan, soha } = req.body;
    let schema = joi.object({
      image: joi.string().min(2),
      regionId: joi.number().integer(),
      userId: joi.number().integer(),
      licetion: joi.string().min(2),
      phone: joi.string().min(7),
      name: joi.string().min(2),
      fan: joi.string().min(2),
      soha: joi.string().min(2),
    });

    let { error } = schema.validate({ image, regionId, userId, licetion, phone, name, fan, soha });
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    await eduCenter.update({ image, regionId, userId, licetion, phone, name, fan, soha });
    res.json({ message: "Education center updated" });
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

route.delete("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let eduCenter = await EduCenter.findByPk(id);
    if (!eduCenter)
      return res.status(404).json({ message: "Education center not found" });

    await eduCenter.destroy();
    res.json({ message: "Education center deleted" });
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
