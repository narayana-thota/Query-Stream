import mongoose from 'mongoose';

const PDFSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  extractedText: { // ⚠️ NEW FIELD: Stores the full PDF text
    type: String,
    required: false // Optional, in case some files are empty
  },
  summary: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const PDF = mongoose.model('PDF', PDFSchema);
export default PDF;