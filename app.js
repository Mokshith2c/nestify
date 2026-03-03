if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { Session } = require('express-session');

const dbUrl = process.env.ATLASDB_URL;
main()
    .then(() => console.log("connected to DB"))
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}


app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
     crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24*3600
});

store.on('error', (err)=>{
    console.log('ERROR IN MONGO SESSION STORE', err);
})
const sessionOptions = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store : store,
    cookie: {
        //Total ms =  totDays * hrs(per day) * mins(per hr) * secs(per min) * ms(per sec)
        maxAge:  7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true
    }
}


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Those methods are written inside Passport because Passport is in charge of login/session,
// and it must call the User model's methods to know who the user is.
passport.use(new LocalStrategy(User.authenticate()));
// Store only user ID in session
passport.serializeUser(User.serializeUser());
// Find full user from DB using ID
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
})

app.get("/", (req, res) => {
    res.render("home.ejs");
});
app.use("/listings", listingRouter);
app.use("/", userRouter);
app.use("/listings/:id/reviews", reviewRouter);

app.use((req, res, next) => {
    throw new ExpressError(404, "Page not found");
});
app.use((err, req, res, next) =>{
    let {status = 500, message = "something went wrong"} = err;
    res.status(status).render("error.ejs", {message});
})
app.listen(8080, () => {
    console.log("server listening to port 8080");
})