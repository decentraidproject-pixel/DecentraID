const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");

router.get("/user/:id", async (req, res) => {

  const posts = await Post.find({ userId: req.params.id });

  res.json(posts);

});

module.exports = router;