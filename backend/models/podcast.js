// File: backend/models/Podcast.js
import mongoose from 'mongoose';

const PodcastSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links to your User collection
    required: true
  },
  filename: {
    type: String,
    required: true // e.g., "History_Notes.pdf"
  },
  sourceText: {
    type: String, 
    required: true // The text extracted from the PDF
  },
  generatedScript: {
    type: String // We will also save the AI script here for history
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'podcasts' }); // ⚠️ FORCE COLLECTION NAME TO 'podcasts'

export default mongoose.model('PodcastData', PodcastSchema);