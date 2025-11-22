// Routes for orders
const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/ordersController");

// POST /orders - create an order
router.post("/", ordersController.createOrder);

module.exports = router;
