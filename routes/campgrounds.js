var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware"); // index is special like main, we don't have to include it explicitly in the path

var NodeGeocoder = require("node-geocoder");
 
var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    if (req.query.search) { // if query search string exist
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}, function(error, allCampgrounds){
            if(error){
                req.flash("error", error.message);
            } else {
                res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
            }
        });
    } else {
        Campground.find({}, function(error, allCampgrounds){
            if(error){
                req.flash("error", error.message);
            } else {
                res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
            }
        });
    }
});

// New Route
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

//Create Route - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (error, data) {
        if (error || !data.length) {
            console.log(error);
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = {name: name, image: image, description: desc, author: author, location: location, lat: lat, lng: lng};
        // Create a new campground and save to DB
        Campground.create(newCampground, function(error, newlyCreated){
            if(error){
                console.log(process.env.GEOCODER_API_KEY);
                req.flash("error", error.message);
            } else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                res.redirect("/campgrounds");
            }
        });
    });
});

// Show Route
router.get("/:id", function(req, res) { // get mongodb unique id
    Campground.findById(req.params.id).populate("comments").exec(function(error, foundCampground) {
        if (error) {
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
})

// Edit Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(error, foundCampground) {
        if (error) {
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

// Update Route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (error, data) {
        if (error || !data.length) {
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(error, campground){
            if(error){
                req.flash("error", error.message);
                res.redirect("back");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
            }
        });
    });
});

// Destroy Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(error) {
        if (error) {
            req.flash("error", error.message);
        }
        res.redirect("/campgrounds");
    });
});


// Regex for fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;