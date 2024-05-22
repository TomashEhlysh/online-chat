const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");

const router = express.Router();

// get requests
router.get("/getAllPosts", adminController.getAllPosts);
router.get("/getAllUsers", adminController.getAllUsers);


// post requests
router.post("/addAdv", adminController.addAdv);
router.post("/changeAdv", adminController.changeAdv);
router.post("/deleteAdv", adminController.deleteAdv);
router.post("/addInfo", adminController.addInfo);
router.post("/addForumPost", adminController.addForumPost);
router.post("/deleteForumPost", adminController.deleteForumPost);
router.post("/changeUsers", adminController.changeUsers);
router.post("/deleteUser", adminController.deleteUser);

// put requests
router.put("/changeForumPost", adminController.changeForumPost);

module.exports = router;