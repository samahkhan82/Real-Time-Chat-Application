const Message = require("../models/Message");

exports.getMessages = async (req, res) => {
  try {
    const room = req.query.room || "global";
    const messages = await Message.find({ room }).populate(
      "sender",
      "username"
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
