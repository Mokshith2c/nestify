const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
    .then(() => console.log("connected to DB"))
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async() => {
    await Listing.deleteMany({});
    
    // Create or find a demo user for seeded listings
    let demoUser = await User.findOne({ username: "demo-user" });
    if (!demoUser) {
        const newUser = new User({
            email: "demo@wanderlust.com",
            username: "demo-user"
        });
        demoUser = await User.register(newUser, "demo123");
        console.log("Demo user created");
    }
    
    // Assign the demo user as owner for all seeded listings
    initData.data = initData.data.map((obj) => ({...obj, owner: demoUser._id}));
    await Listing.insertMany(initData.data);
    console.log("data was intialized");
}

initDB();
