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

const router = express.Router();

router.post("/", Middleware, async (req, res) => {
  try {
    let userId = req.user.id;
    const { error } = commentValidation.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    let eduCenter = await EduCenter.findByPk(req.body.eduId);
    if (!eduCenter) {
      return res.status(404).json({ message: "eduCenter not found" });
    }
    const comment = await Comment.create(...req.body, userId);
    res.status(201).json(comment);
  } catch (error) {
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

    res.json({ total: count, page, limit, data: rows });
  } catch (error) {
    res.status(600).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    res.json(comment);
  } catch (error) {
    res.status(600).json({ error: error.message });
  }
});

router.patch("/:id", Middleware, async (req, res) => {
  try {
    const { error } = patchValidation.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (req.user.role !== "admin" && req.user.id !== comment.userId) {
      return res.status(403).json({ message: "нет доступа" });
    }
    if (req.body.eduId) {
      let eduCenter = await EduCenter.findByPk(req.body.eduId);
      if (!eduCenter) {
        return res.status(404).json({ message: "eduCenter not found" });
      }
    }
    await comment.update(req.body);
    res.json(comment);
  } catch (error) {
    res.status(600).json({ error: error.message });
  }
});

router.delete("/:id", Middleware, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (req.user.role !== "admin" && req.user.id !== comment.userId) {
      return res.status(403).json({ message: "нет доступа" });
    }
    await comment.destroy();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(600).json({ error: error.message });
  }
});

module.exports = router;
