const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verify = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "Neerajmorestreamvid");
    const user = await User.findOne({
      "tokens.token": token,
      _id: decoded._id,
    });
    if (!user) throw new Error();
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "You are not authenticated!" });
  }
};

module.exports = { verify };
