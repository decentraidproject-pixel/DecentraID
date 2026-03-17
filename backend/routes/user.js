const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "ApprovedInstitution", required: true },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
