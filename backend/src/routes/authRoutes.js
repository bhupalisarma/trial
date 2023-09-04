const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../utils/authUtils");
const User = require("../models/User");
const Classroom = require("../models/Classroom");
const sgMail = require("@sendgrid/mail"); // Import SendGrid library

sgMail.setApiKey(
  "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"
); // Set your SendGrid API Key

// Register route
router.post("/register", async (req, res) => {
  // Validate the request body
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    // Check if the email already exists
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists)
      return res.status(400).json({ message: "Email already exists" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
    });

    // Save the user to the database
    const savedUser = await user.save();

    // Create and sign a JWT token
    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);

    // Return the token in the response
    res.header("auth-token", token).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  // Validate the request body
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    // Check if the email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(400)
        .json({ message: "Email or password is incorrect" });

    // Check if the password is correct
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res
        .status(400)
        .json({ message: "Email or password is incorrect" });

    // Determine user role
    let role = "unknown";
    if (user.role === "admin") {
      role = "admin";
    } else if (user.role === "mentor") {
      role = "mentor";
    } else if (user.role === "mentee") {
      role = "mentee";
    }

    // Create and sign a JWT token
    const token = jwt.sign({ _id: user._id, role }, process.env.JWT_SECRET);

    // Return the token and role in the response
    res.header("auth-token", token).json({ token, role, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Mentee Registration route
router.post("/mentee-register", async (req, res) => {
  // Validate the request body
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    // Check if the email already exists
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists)
      return res.status(400).json({ message: "Email already exists" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user with the role fixed as "mentee"
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      role: "mentee", // Fixed role as "mentee"
    });

    // Save the user to the database
    const newUser = await user.save();

    const classroomId = req.body.classroomId;

    // Add the mentee's ID to the classroom's mentees array
    const classroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { $push: { mentees: newUser._id } },
      { new: true }
    );

    // Create and sign a JWT token
    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET);

    // Return the token in the response
    res.header("auth-token", token).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// endpoint to send an invitation email
router.post("/send-email", async (req, res) => {
  const { userEmail, classroomId } = req.body;

  try {
    // Construct the URL
    const url = `http://localhost:3000/signup?classroomId=${classroomId}`;

    // Create an email with SendGrid
    const msg = {
      to: userEmail,
      from: "tushar@mattyoungmedia.com",
      templateId: "d-d77a6a9656ca477abea59a4e070ad6f7",
      dynamicTemplateData: {
        subject: "Invitation to Join Classroom",
        join_url: url,
      },
    };

    // Send the email
    await sgMail.send(msg);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Sengrid HTML Code for invitation
{/* <html>
<head>
  <title>Join Classroom</title>
</head>
<body>
  <div style="font-family: Arial, sans-serif; font-size: 14px; padding: 20px;">
    <h1>Welcome to the Classroom!</h1>
    <p>Click the following link to join the classroom:</p>
    <p><a href="{{{join_url}}}" target="_blank" style="text-decoration: none; background-color: #007BFF; color: #ffffff; padding: 10px 20px; border-radius: 5px; display: inline-block;">Join Classroom</a></p>
  </div>
</body>
</html> */}


module.exports = router;
