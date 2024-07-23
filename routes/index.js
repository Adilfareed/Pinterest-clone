var express = require("express");
var router = express.Router();
var usermodel = require("./users");
const session = require("express-session");
const passport = require("passport");
const upload = require("./multer");
const localStrategy = require("passport-local").Strategy;
const postmodel = require("./posts");
const flash = require("connect-flash");

// Setup flash messages and session
router.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
router.use(flash());
router.use(passport.initialize());
router.use(passport.session());

passport.use(new localStrategy(usermodel.authenticate()));

router.get("/signup", function (req, res) {
  res.render("index");
});

router.get("/login", function (req, res) {
  res.render("login", { error: req.flash("error") });
});

router.get("/feed", async function (req, res, next) {
  try {
    const posts = await postmodel.find();
    res.render("feed", { posts });
  } catch (error) {
    next(error);
  }
});

router.get("/uploads", function (req, res) {
  res.render("uploads");
});

router.post("/upload", isLoggedIn, upload.single("file"), async function (req, res) {
  if (!req.file) {
    return res.status(400).send("No file was uploaded");
  }
  try {
    const user = await usermodel.findOne({ username: req.session.passport.user });

    const post = await postmodel.create({
      title: req.body.title,
      image: req.file.filename,
      description: req.body.description,
      user: user._id,
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/fileupload", isLoggedIn, upload.single("image"), async function (req, res) {
  try {
    const user = await usermodel.findOne({ username: req.session.passport.user });
    user.profileimage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/profile", isLoggedIn, async function (req, res) {
  try {
    const user = await usermodel.findOne({ username: req.session.passport.user }).populate("posts");
    res.render("profile", { user });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/register", function (req, res) {
  var userdata = new usermodel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
  });

  usermodel.register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    })
    .catch(function (error) {
      res.status(500).send(error.message);
    });
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true,
}), function (req, res) {});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/signup");
}

module.exports = router;
