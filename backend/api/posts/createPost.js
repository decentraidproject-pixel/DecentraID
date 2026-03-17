const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");

router.post("/create", async (req, res) => {

  try {

    const { userId, title, description, verifiers } = req.body;

    const newPost = new Post({
      userId,
      title,
      description,
      verifiers
    });

    await newPost.save();

    res.json({ message: "Post saved" });

  } catch (err) {
    res.status(500).json({ message: "Error saving post" });
  }

});

module.exports = router;