const express = require("express");
const router = express.Router();
const { getMessages } = require("../controllers/messageController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getMessages);

module.exports = router;
