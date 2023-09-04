const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Classroom = require("../models/Classroom");

// Signup handler
exports.signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(newUser._id, newUser.role); // Generate token

    res.status(201).json({ token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed" });
  }
};

// Login handler
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role); // Generate token

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Signup handler for mentee registration
exports.signupMentee = async (req, res) => {
  try {
    const { email, password, classroomId } = req.body; // Add classroomId to req.body
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: "mentee",
    });

    // Add the mentee's ID to the classroom's mentees array
    const classroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { $push: { mentees: newUser._id } },
      { new: true }
    );

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({ token });
  } catch (error) {
    console.error("Mentee Signup error:", error);
    res.status(500).json({ message: "Mentee Signup failed" });
  }
};

// Utility function to generate JWT token
function generateToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}
