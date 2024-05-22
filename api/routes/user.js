const express = require("express");
const { body } = require("express-validator");

const userController = require("../controllers/user");

const router = express.Router();

// GET requests
router.get("/getMessages", userController.getMessages);
router.get("/getGroups", userController.getGroups);

// POST requests
router.post("/createGroupChat", userController.createGroupChat);
module.exports = router;
