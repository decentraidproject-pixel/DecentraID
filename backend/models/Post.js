const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  
  title: String,
  description: String,
  category: String,
  tags: String,

  
  fromDate: Date,
  toDate: Date,
  duration: String,

  
  location: String,
  city: String,

  
  feedback: String,

  
  proofLink: String,
  file: String, // uploaded file URL

  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserFullDetails" },
  userName: String,
  userEmail: String,

  
  verifiers: [String],

 
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  approvedBy: { type: [String], default: [] },
  rejectedBy: { type: [String], default: [] },

 
  userScore: { type: Number, default: 50 }

}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
