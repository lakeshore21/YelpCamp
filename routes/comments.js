var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// New Route
router.get("/new", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(error, foundCampground) {
        if (error) {
            req.flash("error", "Campground not found");
        } else {
            res.render("comments/new", {campground: foundCampground});
        }
    });
});

// Create Route
router.post("/", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(error, foundCampground) {
        if (error) {
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(error, newComment) {
                if (error) {
                    req.flash("error", error.message);
                } else {
                    // add user id and username to the new comment
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                    // add new comment to current campground
                    foundCampground.comments.push(newComment);
                    foundCampground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + foundCampground._id);
                }
            });
        }
    });
});

// Edit Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(error, foundComment) {
        if (error) {
            req.flash("error", "Comment not found");
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
});

// Update Route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, 
        req.body.comment,
        function(error, updatedComment) {
            if (error) {
                req.flash("error", error.message);
                res.redirect("back");
            } else {
                res.redirect("/campgrounds/" + req.params.id);
            }
    });
});

// Destroy Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(error) {
        if (error) {
            req.flash("error", error.message);
            res.redirect("back");
        } else {
            // delete all references in relevant campgrounds
            Campground.findById(req.params.id, function(error, foundCampground) {
                if (error) {
                    req.flash("error", "Campground not found");
                    res.redirect("back");
                } else {
                    foundCampground.comments.remove(req.params.comment_id);
                    foundCampground.save();
                }
            })
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;