// models/UserRegistration.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); 

const userRegistrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true },
  password: { type: String, required: true },
  selectedType: { type: String, required: true },
  selectedInstitutions: [
    { type: mongoose.Schema.Types.ObjectId, ref: "ApprovedInstitution", required: true }
  ],
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userRegistrationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("UserRegistration", userRegistrationSchema);
