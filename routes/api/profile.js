const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");

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

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is requierd").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }
    //response
    //pull everything from the body
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //build profile fields object to insert into database
    //check if it is coming in between we set it
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    //turn into array
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    //build social object, initialize social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.twitter = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    //look for profile by the user
    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //if it is found - update it
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        //send back profile
        return res.json(profile);
      }

      //if not create it
      profile = new Profile(profileFields);

      //save it (profile)
      await profile.save();
      //send back the profile
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

// @route GET api/profile
// @desc  get all profiles
// @access public

router.get("/", async (req, res) => {
  try {
    //get profiles with name and avatar
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    //send profiles
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

// @route GET api/profile/user/:user_id
// @desc  get profile by user id
// @access public

router.get("/user/:user_id", async (req, res) => {
  try {
    //get profile by user id with name and avatar
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    //if no profile
    if (!profile)
      return res.status(400).json({ msg: "Profile for the user is not found" });

    //send profile
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    //check for message (for false valid adress value)
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile for the user is not found" });
    }

    res.status(500).send("server error");
  }
});

// @route DELETE api/profile
// @desc  delete profile, user and posts
// @access private

router.delete("/", auth, async (req, res) => {
  try {
    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User is deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
