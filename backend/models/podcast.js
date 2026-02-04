// File: backend/models/podcast.js
import mongoose from 'mongoose';

const PodcastSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  transcript: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '2:00'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PodcastData = mongoose.model('Podcast', PodcastSchema);
export default PodcastData;