const dotenv = require("dotenv");
dotenv.config();

const checkAuthorization = (req, res, next) => {
  const expectedToken = process.env.SENDING_AUTHORIZATION_TOKEN;
  const providedToken = req.headers.authorization;

  if (providedToken === `Bearer ${expectedToken}`) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = checkAuthorization;
