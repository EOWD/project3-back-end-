const mongoose = require('mongoose');

const fileMetadataSchema = new mongoose.Schema({
  gridFsFileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'uploads.files' // Assuming 'uploads' is your GridFS bucket name; adjust if different
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to your User model; adjust the model name as needed
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
  }],
  accessPermissions: [{
    type: String, // Could be roles or specific user IDs, depending on your access control needs
  }],
  // You can add more fields as needed
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt timestamps
});

const FileMetadata = mongoose.model('FileMetadata', fileMetadataSchema);

module.exports = FileMetadata;
