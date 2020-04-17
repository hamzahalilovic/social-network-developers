const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../../models/User");

// @route GET api/auth
// @desc  test route
// @access public

router.get("/", auth, async (req, res) => {
  try {
    //user model without the password
    const user = await await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

// @route POST api/auth
// @desc  authenticate user and get token
// @access public

router.post(
  "/",
  [
    check("email", "Please insert vaild email adress").isEmail(),
    check("password", "Password required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //deconstructing req.body.---
    const { email, password } = req.body;

    try {
      //see if user exists
      let user = await User.findOne({ email });

      //check if there is not a user
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invaild credentials" }] });
      }

      //check if the password matches
      const isMatch = await bcrypt.compare(password, user.password); //password and encrypted pass

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invaild credentials" }] });
      }

      //return jsonwebtoken
      const payload = {
        user: {
          id: user.id, //mongoose allows not to use _id from MongoDB
        },
      };
      //sign token, secret in default.json, expiration, callback error or token
      //to get the token after user registration
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        //callback
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
