const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  description: String,
  verifiers: [String],
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  userScore: { type: Number, default: 50 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserFullDetails" },
  approvedBy: { type: [String], default: [] }, 
  rejectedBy: { type: [String], default: [] }  // who rejected
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);