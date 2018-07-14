var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObject = {};

// Middleware isLoggedIn
middlewareObject.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in first");
    res.redirect("/login");
}

// Middleware: if current user owns the comment
middlewareObject.checkCampgroundOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function(error, foundCampground) {
            if (error) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else if (foundCampground.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
        })
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

// Middleware: if current user owns the comment
middlewareObject.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(error, foundComment) {
            if (error) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else if (foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
        })
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

module.exports = middlewareObject;