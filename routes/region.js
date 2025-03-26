const { Op } = require("sequelize");
const Region = require("../models/region");
const { Router } = require("express");
const logger = require("../middlewares/logger");
const Joi = require("joi");
const route = Router();

route.get("/", async (req, res) => {
  try {
    let limit = Number(req.query.limit) || 10;
    let page = Number(req.query.page) || 1;
    let offset = limit * (page - 1);
    let search = req.query.search || "";
    let sort = ["ASC", "DESC"].includes(req.query.sort?.toUpperCase())
      ? req.query.sort.toUpperCase()
      : "ASC";
    
    const regions = await Region.findAndCountAll({
      where: {
        name: {
          [Op.like]: `%${search}%`,
        },
      },
      order: [["name", sort]],
      limit: limit,
      offset: offset,
    });
    
    res.json({ total: regions.count, data: regions.rows });
    logger.info("All regions retrieved");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

route.get("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const region = await Region.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    res.json(region);
    logger.info("Region retrieved by ID");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

let regionPostSchema = Joi.object({
  name: Joi.string().min(2).max(55).required(),
});

route.post("/", async (req, res) => {
  try {
    let name = req.body.name;
    const region = await Region.findOne({ where: { name: name } });
    if (region) {
      return res.status(400).json({ message: "Region already exists" });
    }
    let { error } = regionPostSchema.validate({ name });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const newRegion = await Region.create({ name });
    res.json(newRegion);
    logger.info("Region created");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

let regionPatchSchema = Joi.object({
  name: Joi.string().min(2).max(55).optional(),
});

route.patch("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const region = await Region.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    let name = req.body.name;
    let { error } = regionPatchSchema.validate({ name });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    await region.update({ name });
    res.json(region);
    logger.info("Region updated");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

route.delete("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const region = await Region.findByPk(id);
    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    await region.destroy();
    res.json({ message: "Region deleted" });
    logger.info("Region deleted");
  } catch (error) {
    res.status(600).json({ message: error.message });
    logger.error(error.message);
  }
});

module.exports = route;
