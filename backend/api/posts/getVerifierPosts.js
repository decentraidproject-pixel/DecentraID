const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const verifyVerifier = require("../../middleware/verifyVerifier");
const UserFullDetails = require("../../models/UserFullDetails");
const multer = require("multer");   
const upload = multer({ dest: "uploads/" });

const mongoose = require("mongoose"); // ✅ MUST be at top

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

    
    let finalVerifiers = [];
    if (verifiers) {
      finalVerifiers = Array.isArray(verifiers)
        ? verifiers
        : [verifiers];
    }

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

     
      userId: mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : null,

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

router.get("/verifier", verifyVerifier, async (req, res) => {
  try {
    const posts = await Post.find({
      verifiers: req.verifierName
    }).lean(); 

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const posts = await Post.find({ userId }).lean(); 

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify/:postId", verifyVerifier, async (req, res) => {
  const { postId } = req.params;
  const { decision } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const verifier = req.verifierName; 

    
    if (!post.verifiers.includes(verifier))
      return res.status(403).json({ message: "Not authorized" });

    post.approvedBy = post.approvedBy.filter(v => v !== verifier);
    post.rejectedBy = post.rejectedBy.filter(v => v !== verifier);

    if (decision === "approved") {
      post.status = "approved";
      post.userScore += 10;
      if (!post.approvedBy.includes(verifier)) post.approvedBy.push(verifier);
    } else if (decision === "rejected") {
      post.status = "rejected";
      post.userScore -= 5;
      if (!post.rejectedBy.includes(verifier)) post.rejectedBy.push(verifier);
    }

    await post.save();
    res.status(200).json({ message: `Post ${decision}`, post });
  } catch (err) {
    console.error("Error in /verify/:postId", err);
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/userByEmail/:email", async (req, res) => {
  const { email } = req.params;

  try {
    // Use correct field
    const user = await UserFullDetails.findOne({ email: email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ userId: user._id, status: { $ne: "pending" } })
      .select("title description verifiers status approvedBy rejectedBy userScore")
      .lean();

    const totalScore = 50 + posts.reduce((acc, p) => {
      if (p.status === "approved") return acc + 10;
      if (p.status === "rejected") return acc - 5;
      return acc;
    }, 0);

    res.json({
      userName: user.name,
      email: user.email,
      totalScore,
      posts
    });
  } catch (err) {
    console.error("Error in /userByEmail:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
