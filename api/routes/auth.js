const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/auth");

const router = express.Router();

// GET requests
router.get("/user", authController.getUser);
router.get("/checkUserEmail", authController.checkUserEmail);
router.get("/checkJWT", authController.checkJWT);
// POST requests
router.post("/signIn", authController.loginUser);
router.post("/gSignIn", authController.gLoginUser);
router.post("/checkExpTime", authController.checkExpiredToken);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/user", authController.registerUser);

module.exports = router;
