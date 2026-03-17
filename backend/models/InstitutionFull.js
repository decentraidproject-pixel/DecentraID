const mongoose = require("mongoose");

const institutionFullSchema = new mongoose.Schema({
  officialName: { type: String, required: true },
  organizationType: { type: String, required: true },

  yearOfEstablishment: String,
  registrationNumber: String,
  affiliatedBody: String,

  email: String,
  contactNumber: String,
  website: String,
  address: String,
  city: String,
  state: String,
  country: String,
  postalCode: String,

  authorizedPersonName: String,
  designation: String,
  authorizedEmail: String,
  authorizedContact: String,

  services: String,
  totalStaff: Number,
  totalMembers: Number,
  specialization: String,
  workingHours: String,

  govCertificateNumber: String,
  gstNumber: String,
  panNumber: String,
  accreditation: String,

  password: String,   

  status: {
    type: String,
    default: "PENDING"
  }

}, { timestamps: true });

module.exports = mongoose.model(
  "InstitutionFull",
  institutionFullSchema,
  "institutions_fulldetails"
);