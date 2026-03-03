const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const reviewData = require("./reviewsData.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => console.log("connected to DB"))
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initReviews = async() => {
    await Review.deleteMany({});
    
    // Create 6 review users
    const usernames = ["alex_travel", "sarah_nomad", "mike_explorer", "emma_wanderer", "john_tourist", "lisa_adventurer"];
    const users = [];
    
    for (let username of usernames) {
        let user = await User.findOne({ username });
        if (!user) {
            user = await User.register(
                new User({ email: `${username}@example.com`, username }), 
                "password123"
            );
        }
        users.push(user);
    }
    
    const allListings = await Listing.find({});
    
    for (let listing of allListings) {
        // 3-5 reviews per listing
        const numReviews = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < numReviews; i++) {
            const randomReview = reviewData.reviews[Math.floor(Math.random() * reviewData.reviews.length)];
            const randomUser = users[Math.floor(Math.random() * users.length)];
            
            const review = new Review({
                comment: randomReview.comment,
                rating: randomReview.rating,
                author: randomUser._id
            });
            
            await review.save();
            listing.reviews.push(review._id);
        }
        await listing.save();
    }
    
    console.log("Reviews added to all listings");
    mongoose.connection.close();
}

initReviews();
