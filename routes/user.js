const express = require("express");
const router = express.Router();
const User = require("../models/user.js")
const passport = require("passport")
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl, isLoggedIn, isProfileOwner } = require("../middleware.js");
const userController = require("../controllers/users.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({storage})

router.route("/signup")
.get(userController.renderSignup)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLogin)
.post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true}), wrapAsync(userController.login));

router.get("/logout", userController.logout);

router.get("/users/:id", wrapAsync(userController.showProfile));
router.get("/users/:id/edit", isLoggedIn, isProfileOwner, wrapAsync(userController.renderEditProfile));
router.put(
	"/users/:id",
	isLoggedIn,
	isProfileOwner,
	upload.single('profile[avatar]'),
	wrapAsync(userController.updateProfile)
);


module.exports = router;
