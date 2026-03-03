const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {isLoggedIn, validateReview, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

//Reviews 
//Post Review Route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.addReview))

//Delete Reveiw Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview))

module.exports = router;