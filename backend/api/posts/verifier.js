// routes/posts/verifier.js
const express = require("express");
const Post = require("../../models/Post"); // adjust path if needed
const verifyToken = require("../../middleware/verifyToken");

const router = express.Router();

// GET posts assigned to the logged-in verifier
router.get("/", verifyToken, async (req, res) => {
  try {
    const verifierName = req.user.verifierName; // get verifier name from token
    if (!verifierName) {
      return res.status(401).json({ message: "Verifier info missing" });
    }

    // Find posts where this verifier is in the verifiers array
    const posts = await Post.find({ verifiers: verifierName });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching verifier posts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch posts by this user
    const posts = await Post.find({ userId })
      .select("title description verifiers status approvedBy rejectedBy userScore") // pick only needed fields
      .lean(); // converts mongoose documents to plain JS objects

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



router.post("/verify/:postId", verifyToken, async (req, res) => {
  const { postId } = req.params;
  const { decision } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const verifier = req.user.verifierName; // verifier doing the action

    // Only allow if verifier is selected
    if (!post.verifiers.includes(verifier)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove verifier from both approvedBy & rejectedBy first
    post.approvedBy = post.approvedBy.filter(v => v !== verifier);
    post.rejectedBy = post.rejectedBy.filter(v => v !== verifier);

    if (decision === "approved") {
  post.status = "approved";
  post.userScore += 10;
  if (!post.approvedBy.includes(verifier)) post.approvedBy.push(verifier);
  // remove from rejectedBy if exists
  post.rejectedBy = post.rejectedBy.filter(v => v !== verifier);
} else if (decision === "rejected") {
  post.status = "rejected";
  post.userScore -= 5;
  if (!post.rejectedBy.includes(verifier)) post.rejectedBy.push(verifier);
  // remove from approvedBy if exists
  post.approvedBy = post.approvedBy.filter(v => v !== verifier);
}

    await post.save();
    res.status(200).json({ message: `Post ${decision}`, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;