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
// Ping this URL every 10 mins using a Cron Job (e.g., cron-job.org)
app.get('/health', (req, res) => {
    res.status(200).send('Server is awake and healthy');
});

// --- 2. ROOT ROUTE (Sanity Check) ---
app.get('/', (req, res) => {
    res.send('QueryStream API is running...');
});

// --- MIDDLEWARE (CORS FIXED) ---
app.use(cors({
  origin: [
    "http://localhost:5173",                                          // Local Development
    "https://query-stream.netlify.app",                               // Main Production URL
    "https://699338f5a44cef1e92670e1d--query-stream.netlify.app"      // 🔧 FIX: Your specific Netlify Preview URL
  ],
  credentials: true // Allows cookies/tokens to be sent
}));

app.use(express.json());
app.use(cookieParser()); 

// --- STATIC FILES ---
// NOTE: On Render (Free Tier), files uploaded here will disappear on restart.
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