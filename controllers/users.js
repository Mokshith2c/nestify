const User = require("../models/user.js")
const Profile = require("../models/profile.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


module.exports.signup = async (req, res, next) => {
    try{
        let {username, email, password} = req.body;
        const newuser = new User({email, username});
        const registeredUser = await User.register(newuser, password);
        const profile = await Profile.create({ user: registeredUser._id });
        registeredUser.profile = profile._id;
        await registeredUser.save();
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        })
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");

    }
}

module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "Successfully logged out");
        res.redirect("/listings");
    });
}

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to your travel world!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.showProfile = async (req, res) => {
    let {id} = req.params;
    const user = await User.findById(id).populate("profile");
    if(!user){
        req.flash("error", "User not found");
        return res.redirect("/listings");
    }

    const listings = await Listing.find({ owner: id });
    res.render("users/profile.ejs", { user, profile: user.profile, listings});
}

module.exports.renderEditProfile = async (req, res) => {
    let {id} = req.params;
    const user = await User.findById(id).populate("profile");
    if(!user){
        req.flash("error", "User not found");
        return res.redirect("/listings");
    }

    let profile = user.profile;
    if(!profile){
        profile = await Profile.create({ user: user._id });
        user.profile = profile._id;
        await user.save();
    }

    res.render("users/editProfile.ejs", { user, profile });
}

module.exports.updateProfile = async (req, res) => {
    let {id} = req.params;
    const user = await User.findById(id).populate("profile");
    if(!user || !user.profile){
        req.flash("error", "Profile not found");
        return res.redirect(`/users/${id}`);
    }

    const { bio = "", useDefaultAvatar } = req.body.profile || {};
    const defaultAvatarUrl = "https://images.unsplash.com/vector-1758589026240-001260402d98?q=80&w=1267&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    user.profile.bio = bio;

    if(useDefaultAvatar){
        user.profile.avatar = { url: defaultAvatarUrl, filename: "profile-avatar" };
    } else if(req.file){
        user.profile.avatar = { url: req.file.secure_url, filename: req.file.public_id };
    }

    await user.profile.save();
    req.flash("success", "Profile updated");
    res.redirect(`/users/${id}`);
}