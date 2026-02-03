import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';              // <--- NEW: Required for file paths
import { fileURLToPath } from 'url';  // <--- NEW: Required to recreate __dirname

// Route Imports
import authRoutes from './routes/auth.js'; 
import todoRoutes from './routes/todo.js'; 
import pdfRoutes from './routes/pdf.js'; 
import podcastRoutes from './routes/podcast.js'; // <--- NEW: Podcast Route

dotenv.config();

// --- CONFIG FOR ES MODULES ---
// (Because __dirname is not available by default in 'import' syntax)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser()); 

// --- STATIC FILES ---
// This allows the frontend to play audio from: http://localhost:5000/uploads/...
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // <--- NEW

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes); 
app.use('/api/pdf', pdfRoutes); 
app.use('/api/podcast', podcastRoutes); // <--- NEW

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected!'); 
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
})
.catch((error) => console.error(error.message));