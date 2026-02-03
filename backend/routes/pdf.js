import express from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';
import authMiddleware from '../middleware/auth.js';
import PDF from '../models/PDF.js';
import dotenv from 'dotenv';
import pdfParse from 'pdf-parse-fork';

dotenv.config();

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// @route   GET /api/pdf
// @desc    Get all PDFs for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pdfs = await PDF.find({ user: req.user.id }).sort({ uploadDate: -1 });
    res.json(pdfs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/pdf/:id  <-- ⚠️ NEW DELETE ROUTE
// @desc    Delete a PDF
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id);

    if (!pdf) {
      return res.status(404).json({ msg: 'PDF not found' });
    }

    // Check user ownership
    if (pdf.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await pdf.deleteOne();

    res.json({ msg: 'PDF removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'PDF not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/pdf/upload
// @desc    Upload, Parse, and Summarize PDF
router.post('/upload', authMiddleware, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    console.log(`Processing: ${req.file.originalname}`);

    // 1. EXTRACT TEXT
    let extractedText = '';
    try {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text;
    } catch (e) {
        return res.status(500).json({ msg: 'PDF Parse Failed', error: e.message });
    }

    if (!extractedText || !extractedText.trim()) {
        return res.status(400).json({ msg: 'Empty PDF text' });
    }

    // 2. GENERATE SUMMARY (Truncated for speed)
    const summaryContext = extractedText.substring(0, 25000); 
    console.log("Generating Summary...");
    
    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a helpful AI assistant. Summarize the document in Markdown."
            },
            {
                role: "user",
                content: `Summarize this text strictly in Markdown format with Executive Summary, Key Insights, and Action Items:\n\n${summaryContext}`
            }
        ],
        model: "llama-3.3-70b-versatile",
    });

    const aiSummary = completion.choices[0]?.message?.content || "No summary generated.";

    // 3. SAVE TO DB
    const newPDF = new PDF({
      user: req.user.id,
      filename: req.file.originalname,
      originalName: req.file.originalname,
      extractedText: extractedText, // ⚠️ SAVING FULL TEXT
      summary: aiSummary
    });

    const pdf = await newPDF.save();
    res.json(pdf);

  } catch (err) {
    console.error("Upload Error:", err.message);
    if (err.status === 429) return res.status(429).json({ msg: 'Groq Rate Limit.' });
    res.status(500).json({ msg: 'Upload Failed', error: err.message });
  }
});

// @route   POST /api/pdf/chat
// @desc    Chat with a specific PDF
router.post('/chat', authMiddleware, async (req, res) => {
    try {
      const { pdfId, question } = req.body;
  
      if (!pdfId || !question) {
        return res.status(400).json({ msg: 'PDF ID and Question are required' });
      }
  
      // 1. Find PDF
      const pdf = await PDF.findById(pdfId);
      if (!pdf) return res.status(404).json({ msg: 'PDF not found' });
      
      // Check ownership
      if (pdf.user.toString() !== req.user.id) {
          return res.status(401).json({ msg: 'User not authorized' });
      }

      // 2. Get Context (Fallback to summary if text missing)
      const context = pdf.extractedText || pdf.summary;
      const limitedContext = context.substring(0, 30000); // Llama limit safety
  
      console.log(`Chat Question: "${question}"`);
  
      // 3. Ask Groq
      const completion = await groq.chat.completions.create({
          messages: [
              {
                  role: "system",
                  content: `You are a helpful AI assistant. Answer the user's question based STRICTLY on the provided document context.
                  
                  --- DOCUMENT CONTEXT ---
                  ${limitedContext}`
              },
              {
                  role: "user",
                  content: question
              }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.5,
      });
  
      const answer = completion.choices[0]?.message?.content;
      res.json({ answer });
  
    } catch (err) {
      console.error("Chat Error:", err.message);
      res.status(500).json({ msg: 'Chat Failed', error: err.message });
    }
  });

export default router;