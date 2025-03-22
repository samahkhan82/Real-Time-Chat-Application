const User = require("../models/User");

exports.getUsers = async (req, res) => {
  // Only allow admins
  if (req.user.role !== "admin") return res.sendStatus(403);
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Additional functions for banning or promoting users can be added here.
