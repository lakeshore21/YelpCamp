var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// Show Register Form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

// Handle Register 
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(error, user) {
        if (error) {
            req.flash("error", error.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Welcome to YelpCamp " + newUser.username);
            res.redirect("/campgrounds");
        });
    });
});

//Show Login Form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

// Handle Login Request
router.post("/login", 
    passport.authenticate("local", 
        {
            successRedirect: "/campgrounds",
            failureRedirect: "/login"
        }
    ),
    function(req, res) {}
);

// Logout
router.get("/logout", function(req, res) {
   req.logout(); // passport method
   req.flash("success", "Logged you out");
   res.redirect("/campgrounds");
});

module.exports = router;