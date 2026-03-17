const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String },
  approvedInstitution: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "ApprovedInstitution", required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
