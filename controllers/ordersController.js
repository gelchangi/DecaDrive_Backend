// Orders controller: validates orders, computes total, and updates lesson spaces atomically
const { ObjectId } = require("mongodb");
const { getDb, getClient } = require("../config/mongo");

// Helper validators
function validName(name) {
  return (
    typeof name === "string" &&
    name.trim().length > 0 &&
    /^[A-Za-z ]+$/.test(name.trim())
  );
}

function validPhone(phone) {
  return typeof phone === "string" && /^[0-9]{6,15}$/.test(phone);
}

async function createOrder(req, res, next) {
  try {
    const db = getDb();
    const client = getClient();
    const { name, phone, items } = req.body;

    // Validate top-level fields
    if (!validName(name))
      return res.status(400).json({ error: "Invalid name" });
    if (!validPhone(phone))
      return res.status(400).json({ error: "Invalid phone" });
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "Items must be a non-empty array" });

    // Normalize items and validate IDs/quantities
    const normalized = [];
    for (const it of items) {
      if (!it || !it.lessonId || it.quantity == null)
        return res.status(400).json({ error: "Invalid item format" });
      if (!ObjectId.isValid(it.lessonId))
        return res.status(400).json({ error: "Invalid lessonId" });
      const qty = parseInt(it.quantity, 10);
      if (!Number.isInteger(qty) || qty < 1)
        return res.status(400).json({ error: "Invalid quantity" });
      normalized.push({ lessonId: new ObjectId(it.lessonId), quantity: qty });
    }

    // Load lessons involved
    const lessonIds = normalized.map((i) => i.lessonId);
    const lessons = await db
      .collection("lessons")
      .find({ _id: { $in: lessonIds } })
      .toArray();

    if (lessons.length !== lessonIds.length)
      return res.status(400).json({ error: "One or more lessons not found" });

    // Check spaces availability
    for (const it of normalized) {
      const lesson = lessons.find((l) => l._id.equals(it.lessonId));
      if (!lesson) return res.status(400).json({ error: "Lesson not found" });
      if (lesson.spaces < it.quantity)
        return res
          .status(400)
          .json({ error: `Insufficient spaces for lesson ${lesson._id}` });
    }

    // Compute total
    let total = 0;
    for (const it of normalized) {
      const lesson = lessons.find((l) => l._id.equals(it.lessonId));
      total += (lesson.price || 0) * it.quantity;
    }

    // Attempt an atomic transaction if supported by the cluster.
    // If transactions are not available (e.g., standalone), fall back to conditional updates with manual rollback.
    const session = client.startSession ? client.startSession() : null;

    if (session) {
      try {
        session.startTransaction();

        // Decrement spaces conditionally for each lesson
        for (const it of normalized) {
          const r = await db
            .collection("lessons")
            .updateOne(
              { _id: it.lessonId, spaces: { $gte: it.quantity } },
              { $inc: { spaces: -it.quantity } },
              { session }
            );
          if (r.matchedCount === 0 || r.modifiedCount === 0) {
            throw new Error("Insufficient spaces during update");
          }
        }

        // Insert order document
        const orderDoc = {
          name: name.trim(),
          phone,
          items: normalized,
          total,
          timestamp: new Date(),
        };
        const ins = await db
          .collection("orders")
          .insertOne(orderDoc, { session });

        await session.commitTransaction();
        session.endSession();
        return res
          .status(201)
          .json({ status: "success", orderId: ins.insertedId, total });
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ error: err.message || "Failed to place order" });
      }
    }

    // Fallback for environments without transactions: perform conditional updates and rollback on failure
    const updatedLessons = [];
    try {
      for (const it of normalized) {
        const r = await db
          .collection("lessons")
          .updateOne(
            { _id: it.lessonId, spaces: { $gte: it.quantity } },
            { $inc: { spaces: -it.quantity } }
          );
        if (r.matchedCount === 0 || r.modifiedCount === 0) {
          throw new Error("Insufficient spaces during update");
        }
        updatedLessons.push({ lessonId: it.lessonId, qty: it.quantity });
      }

      // Insert order
      const orderDoc = {
        name: name.trim(),
        phone,
        items: normalized,
        total,
        timestamp: new Date(),
      };
      const ins = await db.collection("orders").insertOne(orderDoc);
      return res
        .status(201)
        .json({ status: "success", orderId: ins.insertedId, total });
    } catch (err) {
      // Rollback: increment back any updated lessons
      for (const u of updatedLessons) {
        try {
          await db
            .collection("lessons")
            .updateOne({ _id: u.lessonId }, { $inc: { spaces: u.qty } });
        } catch (rollbackErr) {
          console.error("Rollback failed for", u.lessonId, rollbackErr);
        }
      }
      return res
        .status(400)
        .json({ error: err.message || "Failed to place order" });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder };
