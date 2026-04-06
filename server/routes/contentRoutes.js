const express = require("express");
const { getContentByType } = require("../controllers/contentController");

const router = express.Router();

router.get("/:type", getContentByType);

module.exports = router;
