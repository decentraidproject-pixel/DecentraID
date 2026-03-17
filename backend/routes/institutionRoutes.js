const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const InstitutionFull = require("../models/InstitutionFull");
const InstitutionBasic = require("../models/InstitutionBasic");
const ApprovedInstitution = require("../models/ApprovedInstitution");
const UserRegistration = require("../models/UserRegistration");
const adminAuth = require("../middleware/adminAuth");

const Post = require("../models/Post"); // your Post model
const verifyTokenMiddleware = require("../middleware/verifyToken");


router.get("/verifier", verifyTokenMiddleware, async (req, res) => {
  try {
    const verifierName = req.user.verifierName;
    if (!verifierName) {
      return res.status(401).json({ message: "Verifier info missing" });
    }

    // Fetch posts where the verifier is assigned
    const posts = await Post.find({ selectedVerifiers: verifierName });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts for verifier:", err);
    res.status(500).json({ message: "Server Error" });
  }
});



router.post("/login", async (req, res) => {
   try {
    const { email, password } = req.body;

    // Find verifier by email
    const institution = await InstitutionFull.findOne({ email });

    if (!institution) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, institution.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // Check if account approved
    if (institution.status !== "APPROVED") {
      return res.status(403).json({
        message: "Account not approved by admin"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: institution._id, verifierName: institution.officialName }, 
      process.env.JWT_SECRET1 || "mysecretkey123",
      { expiresIn: "1d" }
    );

    // Send response
    res.status(200).json({
      message: "Login Successful",
      token,
      name: institution.officialName,
      institutionId: institution._id,
      status: institution.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/verifierlogin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find verifier by email
    const institution = await InstitutionFull.findOne({ email });

    if (!institution) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, institution.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // Check if account approved
    if (institution.status !== "APPROVED") {
      return res.status(403).json({
        message: "Account not approved by admin"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: institution._id,
        verifierName: institution.officialName
      },
      process.env.JWT_SECRET1 || "mysecretkey123", // must match verifyToken
      { expiresIn: "1d" }
    );

    // Send response
    res.status(200).json({
      message: "Login Successful",
      token, // frontend must save this in localStorage
      name: institution.officialName,
      institutionId: institution._id,
      status: institution.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});





router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  
  if (username !== "admin" || password !== "admin123") {
    return res.status(401).json({ message: "Invalid admin" });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET || "adminsecret",
    { expiresIn: "1d" }
  );

  res.json({ token });
});

router.get("/user/approved", async (req, res) => {
  try {
    const approved = await ApprovedInstitution.find().lean();
    res.json(approved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


router.post("/user/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserRegistration.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { role: "user", id: user._id },
    process.env.JWT_SECRET || "usersecret",
    { expiresIn: "1d" }
  );

  res.json({ token });
});



router.get("/status", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "usersecret");
    const user = await InstitutionFull.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ status: user.status }); // APPROVED / PENDING / REJECTED
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




router.get("/user/status", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET || "usersecret");
  const user = await UserRegistration.findById(decoded.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ status: user.status });
});


router.post("/register", async (req, res) => {
  try {
    const {
      officialName,
      organizationType,
      yearOfEstablishment,
      registrationNumber,
      affiliatedBody,
      officialEmail,
      officialContact,
      website,
      address,
      city,
      state,
      country,
      postalCode,
      authorizedPersonName,
      designation,
      authorizedEmail,
      authorizedContact,
      natureOfServices,
      totalStaff,
      totalStudents,
      specialization,
      workingHours,
      govtCertificateNo,
      gstNumber,
      panNumber,
      accreditationDetails,
      password,
      confirmPassword
    } = req.body;

    if (!password || !confirmPassword)
      return res.status(400).json({ message: "Password fields required" });
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const fullData = await InstitutionFull.create({
      officialName,
      organizationType,
      yearOfEstablishment,
      registrationNumber,
      affiliatedBody,
      email: officialEmail,
      contactNumber: officialContact,
      website,
      address,
      city,
      state,
      country,
      postalCode,
      authorizedPersonName,
      designation,
      authorizedEmail,
      authorizedContact,
      services: natureOfServices,
      totalStaff,
      totalMembers: totalStudents,
      specialization,
      workingHours,
      govCertificateNumber: govtCertificateNo,
      gstNumber,
      panNumber,
      accreditation: accreditationDetails,
      password: hashedPassword,
      status: "PENDING"
    });

    await InstitutionBasic.create({
      officialName,
      organizationType,
      fullInstitutionId: fullData._id
    });

    // ✅ Correct JWT using fullData
    const token = jwt.sign(
      { id: fullData._id, verifierName: fullData.officialName },
      process.env.JWT_SECRET1 || "mysecretkey123",
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Registration Successful",
      token,
      name: fullData.officialName,
      institutionId: fullData._id,
      status: fullData.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const institution = await InstitutionFull.findOne({ email });

    if (!institution) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    const isMatch = await bcrypt.compare(password, institution.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    if (institution.status !== "APPROVED") {
      return res.status(403).json({
        message: "Account not approved by admin"
      });
    }

    res.status(200).json({
      message: "Login Successful",
      institutionId: institution._id,
      name: institution.officialName,
      status: institution.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
});



// ================= ADMIN LIST =================
router.get("/admin/type/:type", adminAuth, async (req, res) => {
  try {
    const type = req.params.type;
    const institutions = await InstitutionBasic.find({ organizationType: type })
      .select("officialName fullInstitutionId")
      .lean(); // returns plain JS objects

    // convert ObjectId to string to avoid issues
    const data = institutions.map(inst => ({
      _id: inst._id,
      officialName: inst.officialName,
      fullInstitutionId: inst.fullInstitutionId?.toString() // ensure it exists
    }));

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ================= ADMIN FULL LIST =================
router.get("/admin/fulltype/:type", adminAuth, async (req, res) => {
  try {
    const type = req.params.type;
    // fetch full details directly from InstitutionFull
    const institutions = await InstitutionFull.find({ organizationType: type }).lean();
    res.json(institutions); // send full institution objects
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ================= ADMIN DETAILS =================
router.get("/admin/details/:id", adminAuth, async (req, res) => {
  try {
    const id = req.params.id;

    // Try to find by fullInstitutionId first
    let institution = await InstitutionFull.findById(id);

    if (!institution) {
      // fallback: maybe id is from InstitutionBasic
      const basic = await InstitutionBasic.findById(id);
      if (basic) {
        institution = await InstitutionFull.findById(basic.fullInstitutionId);
      }
    }

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    res.json(institution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= APPROVE =================
router.post("/admin/approve/:id", adminAuth, async (req, res) => {
  try {
    const institution = await InstitutionFull.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    institution.status = "APPROVED";
    await institution.save();

    const already = await ApprovedInstitution.findOne({ fullInstitutionId: institution._id });
    if (!already) {
      await ApprovedInstitution.create({
        fullInstitutionId: institution._id,
        officialName: institution.officialName,
        organizationType: institution.organizationType
      });
    }

    res.json({ message: "Institution Approved Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= REJECT =================
router.post("/admin/reject/:id", adminAuth, async (req, res) => {
  try {
    await InstitutionFull.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED" }
    );
    res.json({ message: "Institution Rejected" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// ================= USER REGISTRATION =================
router.post("/user/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      contactNumber,
      password,
      confirmPassword,
      selectedType,
      selectedInstitutions,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !contactNumber ||
      !password ||
      !confirmPassword ||
      !selectedType ||
      !selectedInstitutions ||
      selectedInstitutions.length === 0
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await UserRegistration.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Validate selected institutions
    const validInstitutions = await ApprovedInstitution.find({
      _id: { $in: selectedInstitutions },
    });
    if (validInstitutions.length !== selectedInstitutions.length) {
      return res.status(400).json({ message: "Some institutions are invalid" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserRegistration.create({
      fullName,
      email,
      contactNumber,
      password: hashedPassword,
      selectedType,
      selectedInstitutions,
      status: "ACTIVE",
    });

    res.status(201).json({ message: "User Registered Successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});




module.exports = router;
