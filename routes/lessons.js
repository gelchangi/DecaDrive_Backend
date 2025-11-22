// Routes for lesson-related endpoints
const express = require("express");
const router = express.Router();
const lessonsController = require("../controllers/lessonsController");

// GET /lessons - list lessons with optional search and sorting
router.get("/", lessonsController.listLessons);

// GET /lessons/:id - get a single lesson
router.get("/:id", lessonsController.getLesson);

// PUT /lessons/:id - update a lesson partially
router.put("/:id", lessonsController.updateLesson);

module.exports = router;
