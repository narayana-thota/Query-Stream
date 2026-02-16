import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Route Imports
import authRoutes from './routes/auth.js'; 
import todoRoutes from './routes/todo.js'; 
import pdfRoutes from './routes/pdf.js'; 
import podcastRoutes from './routes/podcast.js';

dotenv.config();

// --- CONFIG FOR ES MODULES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- 1. INDUSTRY STANDARD KEEP-ALIVE (Prevents Cold Starts) ---
// This is the critical fix for "Slow Login". 
// You MUST configure a Cron Job (or GitHub Action) to ping this URL every 10 minutes.
// URL to ping: https://your-backend-app.onrender.com/health
app.get('/health', (req, res) => {
    res.status(200).send('Server is awake and healthy');
});

// --- 2. ROOT ROUTE (Sanity Check) ---
// This ensures that when you visit the main domain, you see something.
app.get('/', (req, res) => {
    res.send('QueryStream API is running...');
});

// --- MIDDLEWARE ---
app.use(cors({
  origin: [
    "http://localhost:5173",                  // Local Development
    "https://query-stream.netlify.app"        // ✅ YOUR DEPLOYED FRONTEND
  ],
  credentials: true // Allows cookies/tokens to be sent if needed
}));

app.use(express.json());
app.use(cookieParser()); 

// --- STATIC FILES ---
// NOTE: On Render (Free Tier), files uploaded here will disappear when the server restarts.
// For a permanent Industry Solution, you would eventually move to AWS S3 or Cloudinary.
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes); 
app.use('/api/pdf', pdfRoutes); 
app.use('/api/podcast', podcastRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected!'); 
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
})
.catch((error) => console.error(error.message));