const express = require("express");
const authController = require("../controllers/authController");
const tableController = require("../controllers/tableController");
const router = express.Router();

router.post("/login", authController.login);
router.get("/tables", tableController.getTables);

module.exports = router;
