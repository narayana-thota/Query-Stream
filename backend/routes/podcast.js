// File: backend/routes/podcast.js
import express from 'express';
import multer from 'multer'; // Import multer for file uploads
import { generatePodcast, deletePodcast, getUserPodcasts } from '../controllers/podcastController.js';
import auth from '../middleware/auth.js'; 

const router = express.Router();

// Configure Multer to store files in memory (RAM) temporarily
const upload = multer({ storage: multer.memoryStorage() });

// @route   POST api/podcast/generate
// @desc    Generate podcast audio from Text OR PDF
// @access  Private
// Middleware Order: 1. Check Auth -> 2. Process File Upload -> 3. Run Controller
router.post('/generate', auth, upload.single('file'), generatePodcast);

// @route   DELETE api/podcast/:id
// @desc    Delete a podcast entry from MongoDB
// @access  Private
router.delete('/:id', auth, deletePodcast);

// @route   GET api/podcast/history
// @desc    Get all podcasts created by the logged-in user
// @access  Private
router.get('/history', auth, getUserPodcasts);

export default router;