// Controller for lessons: list, get, update
const { ObjectId } = require("mongodb");
const { getDb } = require("../config/mongo");

// Helper to validate numeric fields for updates
function isNumberLike(v) {
  return typeof v === "number" && Number.isFinite(v);
}

// GET /lessons
// Supports: q (case-insensitive search on subject and location), sortBy and order
async function listLessons(req, res, next) {
  try {
    const db = getDb();
    const { q, sortBy, order } = req.query;
    const filter = {};
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ subject: regex }, { location: regex }];
    }

    const sort = {};
    if (sortBy) {
      const direction = order === "desc" ? -1 : 1;
      // Only allow specific sort fields
      const allowed = ["subject", "location", "price", "spaces"];
      if (allowed.includes(sortBy)) sort[sortBy] = direction;
    }

    const lessons = await db
      .collection("lessons")
      .find(filter)
      .sort(sort)
      .toArray();
    res.json(lessons);
    console.log(`Listed ${lessons.length} lessons`);
  } catch (err) {
    next(err);
  }
}

// GET /lessons/:id
async function getLesson(req, res, next) {
  try {
    const db = getDb();
    const id = req.params.id;
    if (!ObjectId.isValid(id))
      return res.status(404).json({ error: "Not found" });
    const lesson = await db
      .collection("lessons")
      .findOne({ _id: new ObjectId(id) });
    if (!lesson) return res.status(404).json({ error: "Not found" });
    res.json(lesson);
  } catch (err) {
    next(err);
  }
}

// PUT /lessons/:id - partial update
async function updateLesson(req, res, next) {
  try {
    const db = getDb();
    const id = req.params.id;
    if (!ObjectId.isValid(id))
      return res.status(404).json({ error: "Not found" });

    const allowed = [
      "subject",
      "location",
      "price",
      "spaces",
      "description",
      "image",
    ];
    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    // Validate numeric fields
    if (updates.price !== undefined && !isNumberLike(updates.price)) {
      return res.status(400).json({ error: "Invalid price" });
    }
    if (updates.spaces !== undefined && !Number.isInteger(updates.spaces)) {
      return res.status(400).json({ error: "Invalid spaces" });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const result = await db
      .collection("lessons")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result.value) return res.status(404).json({ error: "Not found" });
    res.json(result.value);
  } catch (err) {
    next(err);
  }
}

module.exports = { listLessons, getLesson, updateLesson };
