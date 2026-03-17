const express = require("express");
const router = express.Router();

const ApprovedInstitution = require("../../models/ApprovedInstitution");

router.get("/approved", async (req, res) => {

  try {

    const institutions = await ApprovedInstitution.find();

    res.json(institutions);

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

});

module.exports = router;