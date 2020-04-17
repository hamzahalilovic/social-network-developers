const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator/check");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route GET api/profile/me
// @desc  get current user's profile
// @access private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    //check to see if there is no profile
    if (!profile) {
      return res
        .status(400)
        .json({ msg: "there is no profile for this user " });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server errro");
  }
});

// @route POST api/profile
// @desc  create or update user profile
// @access private

module.exports = router;
