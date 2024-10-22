const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    attachment: {
      filename: String,
      path: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
