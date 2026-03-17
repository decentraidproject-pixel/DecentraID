const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", (req, res) => {

  const { username, password } = req.body;

  // simple fixed admin (for your project)
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {

    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET || "adminsecret",
      { expiresIn: "1d" }
    );

    return res.json({ token });
  }

  return res.status(401).json({ message: "Invalid admin credentials" });
});

module.exports = router;
