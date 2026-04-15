const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");

const multer = require("multer");   
const upload = multer({ dest: "uploads/" });

router.post("/create", upload.single("file"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {
      title,
      description,
      category,
      tags,
      fromDate,
      toDate,
      duration,
      location,
      city,
      feedback,
      proofLink,
      userId,
      userName,
      userEmail,
      verifiers
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    const finalVerifiers = Array.isArray(verifiers)
      ? verifiers
      : verifiers
      ? [verifiers]
      : [];

    const post = new Post({
      title,
      description,
      category,
      tags,

      fromDate: fromDate || null,
      toDate: toDate || null,
      duration,

      location,
      city,

      feedback,

      proofLink,
      file: req.file ? req.file.path : "",

      userId: new mongoose.Types.ObjectId(userId),

      userName,
      userEmail,

      verifiers: finalVerifiers
    });

    await post.save();

    res.json({ message: "Post created successfully", post });

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
