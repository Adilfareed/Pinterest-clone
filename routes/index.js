var express = require('express');
var router = express.Router();
var usermodel = require("./users");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(usermodel.authenticate()));

router.get("/", function (req, res) {
  res.render("index");
});
router.get("/login", function (req, res) {
  res.render("login");
});
router.get("/feed", function (req, res) {
  res.render("feed");
});

router.get("/profile", isLoggedIn, function (req, res) {
  res.render("profile");
});
router.post("/register", function (req, res) {
  var userdata = new usermodel({
    username: req.body.username,
    email: req.body.email,
    fullname : req.body.fullname,
   
    
  });
  
  usermodel.register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    });
});
router.post("/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  }),
  function (req, res) {}
);
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {return next(err);}
    res.redirect("/");
  });
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
