const jwt = require("jsonwebtoken");

module.exports = function adminAuth(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "adminsecret");

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not admin" });
    }

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
