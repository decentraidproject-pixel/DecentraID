const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  verifierName: {
    type: String
  },

  reputationScore: {
    type: Number,
    default: 50
  }

});



module.exports = mongoose.model("user_fulldetails", userSchema);
