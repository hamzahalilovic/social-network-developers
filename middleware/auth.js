const jwt = require("jsonwebtoken");
const config = require("config");

//exporting middleware function
module.exports = function (req, res, next) {
  //get the token from header
  const token = req.header("x-auth-token"); //key to get token

  //check if there is no token
  if (!token) {
    return res.status(401).json({ msg: "no token/authorization" });
  }

  //verify token (if there is token)
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.user = decoded.user; //use req.user in routes
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
