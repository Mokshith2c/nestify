const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        // Only save redirect URL for GET requests (safe to revisit)
        // For POST/PUT/DELETE, don't save the URL as they can't be replayed safely
        if(req.method === "GET"){
            req.session.redirectUrl = req.originalUrl;
        }
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl; // Clear after saving to prevent stale redirects
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currentUser._id)){
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.validateListing = (req, res, next) => {
    // let result = listingSchema.validate(req.body);
    let {error} =  listingSchema.validate(req.body);
    if(error){
        // console.log(result.error.details);
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error", "You don't have permission to do that!")
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isProfileOwner = (req, res, next) => {
    let {id} = req.params;
    if(!res.locals.currentUser || !res.locals.currentUser._id.equals(id)){
        req.flash("error", "You don't have permission to do that!");
        return res.redirect(`/users/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    // let result = listingSchema.validate(req.body);
    let {error} =  reviewSchema.validate(req.body);
    if(error){
        // console.log(result.error.details);
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}
