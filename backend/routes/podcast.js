// File: backend/routes/podcast.js
import express from 'express';
import multer from 'multer';
import { generatePodcast, deletePodcast, getUserPodcasts } from '../controllers/podcastController.js';
import auth from '../middleware/auth.js'; 

const router = express.Router();

// Configure Multer to store files in memory (RAM) temporarily
const upload = multer({ storage: multer.memoryStorage() });

// @route   POST api/podcast/generate
// @desc    Generate podcast audio from Text OR PDF
// @access  Private
router.post('/generate', auth, upload.single('file'), generatePodcast);

// @route   DELETE api/podcast/:id
// @desc    Delete a podcast entry
// @access  Private
router.delete('/:id', auth, deletePodcast);

// @route   GET api/podcast/
// @desc    Get all podcasts (Fixed path to match Dashboard)
// @access  Private
router.get('/', auth, getUserPodcasts);

export default router;