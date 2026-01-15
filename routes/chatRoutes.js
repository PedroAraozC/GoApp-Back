const express = require("express");
const router = express.Router();
const chat = require("../controllers/chatController");

router.get("/:idViaje", chat.getMessages);

module.exports = router;