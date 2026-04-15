require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());




const adminAuthRoutes = require("./routes/adminAuth.routes");
app.use("/api/admin", adminAuthRoutes);

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

const userLoginRoute = require ("./api/users/login.js");

app.use("/api/users", userLoginRoute);

const userRegisterRoute = require ("./api/users/register.js");

app.use("/api/users", userRegisterRoute);


const createPost = require("./api/posts/createPost");
const getUserPosts = require("./api/posts/getUserPosts");

app.use("/api/posts", createPost);
app.use("/api/posts", getUserPosts);


const approvedInstitutions = require("./api/institutions/getApprovedInstitutions");

app.use("/api/institutions", approvedInstitutions);


const verifierPosts = require("./api/posts/getVerifierPosts");

app.use("/api/posts", verifierPosts);

const verifierPostsRouter = require("./api/posts/verifier");
app.use("/api/posts/verifier", verifierPostsRouter);



const institutionRoutes = require("./routes/institutionRoutes");
app.use("/api/institution", institutionRoutes);

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Server is working!");
});

app.listen(8000, () => {
  console.log(`Server running on port ${PORT}`);
});
