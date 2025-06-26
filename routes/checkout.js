const express = require("express");
const router = express.Router();
const { processCheckout } = require("../controllers/checkoutController");
const authMiddleware = require("../middleware/authenticateMiddleware");


router.post("/", authMiddleware, processCheckout);

module.exports = router;