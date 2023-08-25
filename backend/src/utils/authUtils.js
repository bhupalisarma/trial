const jwt = require("jsonwebtoken");

const registerValidation = (data) => {
	// Validation logic for user registration
	// Implement your validation code here

	// Example validation:
	if (!data.email || !data.password || !data.role) {
		return { error: "Please provide email, password, and role" };
	}

	return { error: null }; // No validation errors
};

const loginValidation = (data) => {
	// Validation logic for user login
	// Implement your validation code here

	// Example validation:
	if (!data.email || !data.password) {
		return { error: "Please provide email and password" };
	}

	return { error: null }; // No validation errors
};

const generateToken = (user) => {
	const payload = {
		_id: user._id,
		email: user.email,
		role: user.role,
	};

	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const verifyToken = (req, res, next) => {
	const token = req.header("auth-token");
	if (!token) return res.status(401).json({ message: "Access denied" });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		res.status(400).json({ message: "Invalid token" });
	}
};

module.exports = {
	registerValidation,
	loginValidation,
	verifyToken,
	generateToken,
};
