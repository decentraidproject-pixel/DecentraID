const mongoose = require("mongoose");

const approvedInstitutionSchema = new mongoose.Schema({
  officialName: String,
  organizationType: String,
  fullInstitutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstitutionFull"
  }
}, { timestamps: true });

module.exports = mongoose.model(
  "ApprovedInstitution",
  approvedInstitutionSchema,
  "approved_institutions"
);
