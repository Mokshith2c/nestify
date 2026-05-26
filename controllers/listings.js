const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const mongoose = require("mongoose");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings: allListings});
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    // Calculate average rating using aggregate pipeline
    const stats = await Listing.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup: {
                from: "reviews",
                localField: "reviews",
                foreignField: "_id",
                as: "reviewDocs"
            }
        },
        {
            $project: {
                averageScore: {
                    $avg: "$reviewDocs.rating"
                }
            }
        }
    ]);

    let avgRating = (stats.length > 0 && stats[0].averageScore !== null) 
        ? stats[0].averageScore.toFixed(1) 
        : "No reviews";

    let isInWishlist = false;
    if(req.user){
        const user = await User.findById(req.user._id).select("wishlist");
        if(user){
            isInWishlist = user.wishlist.some((listingId) => listingId.equals(listing._id));
        }
    }

    res.render("listings/show.ejs", {listing, mapToken: process.env.MAP_TOKEN, isInWishlist, avgRating});
}

module.exports.createListing = async(req, res, next) => {
    try {
        
        if(!req.file) {
            req.flash("error", "Please upload an image!");
            return res.redirect("/listings/new");
        }

        if(!req.body.listing?.location || !req.body.listing.location.trim()) {
            req.flash("error", "Please enter a location.");
            return res.redirect("/listings/new");
        }
        
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        }).send();

        if(!response.body.features || response.body.features.length === 0) {
            req.flash("error", "Location not found. Please check the spelling and try again.");
            return res.redirect("/listings/new");
        }
        
        let url = req.file.secure_url;
        let filename = req.file.public_id;
        
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url, filename}
        newListing.geometry = response.body.features[0].geometry;
        await newListing.save();

        req.flash("success", "New Listing Created");
        res.redirect("/listings");
    } catch(err) {
        console.error("Error creating listing:", err);
        next(err);
    }
}

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalImgUrl = listing.image.url;
    // Apply appropriate transformation based on image source
    if(originalImgUrl.includes("cloudinary")){
        originalImgUrl = originalImgUrl.replace("/upload", "/upload/w_250");
    } else if(originalImgUrl.includes("unsplash")){
        originalImgUrl = originalImgUrl.replace("&w=966", "&w=250");
    }

    res.render("listings/edit.ejs", {listing, originalImgUrl});
}

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url = req.file.secure_url;
        let filename = req.file.public_id;
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
}

module.exports.searchListings = async (req, res) => {
    const { q } = req.query;
    if(!q) {
        req.flash("error", "Please enter a search query!");
        return res.redirect("/listings");
    }
    // const q = req.query.q;
    const regex = new RegExp(q, 'i');
    const searchResults = await Listing.find({
        $or: [{ location: regex },{ title: regex },{ country: regex }]
    });
    res.render("listings/search.ejs", { searchResults, query: q });
}