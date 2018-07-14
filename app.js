require("dotenv").config();

var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    flash = require("connect-flash"),
    
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user");
    
var campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes = require("./routes/comments"),
    indexRoutes = require("./routes/index");

//###############################
// CONFIGURATION
//###############################

mongoose.connect("mongodb://localhost/yelp_camp");
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.set("view engine", "ejs");

// Passport Configuration
app.use(require("express-session")({
    secret: "Hello darkness my old friend.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// save currentUser to local variable so that all files can access it
app.locals.moment = require("moment");

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", indexRoutes);

//###############################
// Landing page
//###############################
app.get("/", function(req, res) {
    res.render("landing");
});

//###############################
// Start Server
//###############################
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Yelp Camp server starts!");
});