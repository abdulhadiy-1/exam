const express = require("express");
const { Op } = require("sequelize");
const Comment = require("../models/comment");
const {
  commentValidation,
  patchValidation,
} = require("../validations/commentValidation");
const { Middleware } = require("../middlewares/auth");
const EduCenter = require("../models/EduCenter");
const { message } = require("../validations/edusohaValidation");
const logger = require("../middlewares/logger");

const router = express.Router();

router.post("/", Middleware, async (req, res) => {
  try {
    let userId = req.user.id;
    const { error } = commentValidation.validate(req.body);
    if (error) {
      logger.error(error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }
    let eduCenter = await EduCenter.findByPk(req.body.eduId);
    if (!eduCenter) {
      logger.warn("eduCenter not found");
      return res.status(404).json({ message: "eduCenter not found" });
    }
    const comment = await Comment.create(...req.body, userId);
    logger.info("New comment created", { comment });
    res.status(201).json(comment);
  } catch (error) {
    logger.error(error.message);
    res.status(600).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    let { page, limit, sort, order, search } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    sort = sort || "id";
    order = order || "ASC";

    const where = search
      ? {
          text: { [Op.like]: `%${search}%` },
        }
      : {};

    const { rows, count } = await Comment.findAndCountAll({
      where,
      order: [[sort, order]],
      limit,
      offset: (page - 1) * limit,
    });

    logger.info("Fetched comments", { total: count, page, limit });
    res.json({ total: count, page, limit, data: rows });
  } catch (error) {
    logger.error(error.message);
    res.status(600).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      logger.warn("Comment not found", { id: req.params.id });
      return res.status(404).json({ error: "Comment not found" });
    }
    res.json(comment);
  } catch (error) {
    logger.error(error.message);
    res.status(600).json({ error: error.message });
  }
});

router.patch("/:id", Middleware, async (req, res) => {
  try {
    const { error } = patchValidation.validate(req.body);
    if (error) {
      logger.error(error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      logger.warn("Comment not found", { id: req.params.id });
      return res.status(404).json({ error: "Comment not found" });
    }
    if (req.user.role !== "admin" && req.user.id !== comment.userId) {
      logger.warn("No access to update comment", { userId: req.user.id });
      return res.status(403).json({ message: "No access" });
    }
    if (req.body.eduId) {
      let eduCenter = await EduCenter.findByPk(req.body.eduId);
      if (!eduCenter) {
        logger.warn("eduCenter not found", { eduId: req.body.eduId });
        return res.status(404).json({ message: "eduCenter not found" });
      }
    }
    await comment.update(req.body);
    logger.info("Comment updated", { id: req.params.id });
    res.json(comment);
  } catch (error) {
    logger.error(error.message);
    res.status(600).json({ error: error.message });
  }
});

router.delete("/:id", Middleware, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      logger.warn("Comment not found", { id: req.params.id });
      return res.status(404).json({ error: "Comment not found" });
    }
    if (req.user.role !== "admin" && req.user.id !== comment.userId) {
      logger.warn("No access to delete comment", { userId: req.user.id });
      return res.status(403).json({ message: "No access" });
    }
    await comment.destroy();
    logger.info("Comment deleted", { id: req.params.id });
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    logger.error(error.message);
    res.status(600).json({ error: error.message });
  }
});

module.exports = router;
