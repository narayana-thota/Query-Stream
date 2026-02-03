// File: backend/controllers/podcastController.js

import * as googleTTS from 'google-tts-api';
import Groq from 'groq-sdk';
import { createRequire } from 'module';
import PodcastData from '../models/podcast.js'; // Import the new Model

// --- PDF PARSER SETUP ---
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse-new'); 
// ------------------------

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateScript = async (text, tone, length) => {
    const wordCount = length === 'Short' ? 120 : length === 'Medium' ? 250 : 450;
    const safeText = text.substring(0, 30000); 

    const prompt = `
    You are a podcast host from India. Convert the source text into a script.
    STYLE GUIDELINES:
    1. Language: Indian English phrasing (warm, professional).
    2. Format: Single narrator. No labels.
    3. Tone: ${tone}.
    4. Length: Under ${wordCount} words.
    5. Output: Just the raw spoken text. No Markdown.
    SOURCE: "${safeText}"
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });
        
        let script = completion.choices[0]?.message?.content || "Could not generate script.";
        return script.replace(/[\*#]/g, '').replace(/\s+/g, ' ').trim();
    } catch (err) {
        console.error("Groq AI Error:", err);
        throw new Error("Failed to generate script.");
    }
};

export const generatePodcast = async (req, res) => {
    try {
        let { text, voice, tone, length } = req.body;
        let pdfTextContent = ""; // To store extracted text for DB
        let originalFilename = "Manual Entry"; // Default name if typed manually
        let savedPodcastId = null; // To return the ID to frontend

        // --- 1. HANDLE PDF UPLOAD ---
        if (req.file) {
            console.log("📄 PDF Uploaded. Parsing...");
            try {
                const pdfData = await pdfParse(req.file.buffer);
                if (!pdfData || !pdfData.text) throw new Error("No text found in PDF.");

                // Clean text
                pdfTextContent = pdfData.text.replace(/\n/g, " ").replace(/\s+/g, " ");
                originalFilename = req.file.originalname;

                // Append to text for generation
                text = (text || '') + "\n" + pdfTextContent;
                console.log(`✅ PDF Parsed. Length: ${pdfTextContent.length} chars.`);

            } catch (pdfErr) {
                console.error("PDF Error:", pdfErr);
                return res.status(400).json({ msg: "Failed to read PDF." });
            }
        } else if (text) {
             // If user just typed text, we save that too
             pdfTextContent = text;
        }

        if (!text || !text.trim()) {
            return res.status(400).json({ msg: "Please provide text or upload a PDF." });
        }

        console.log(`🎙️ Generating: ${voice} | ${tone}`);

        // --- 2. GENERATE SCRIPT ---
        const script = await generateScript(text, tone, length);
        console.log("📝 Script Ready.");

        // --- 3. SAVE TO MONGODB (Collection: podcasts) ---
        // We do this AFTER script generation so we can save the result too
        if (req.user && req.user.id) {
            try {
                const newPodcastEntry = new PodcastData({
                    user: req.user.id,
                    filename: originalFilename,
                    sourceText: pdfTextContent,  // The raw PDF data
                    generatedScript: script      // The AI result
                });
                
                const savedPodcast = await newPodcastEntry.save();
                savedPodcastId = savedPodcast._id; // Store the MongoDB ID
                console.log(`💾 Saved to 'podcasts' collection: ${originalFilename} (ID: ${savedPodcastId})`);
            } catch (dbErr) {
                console.error("Database Save Error:", dbErr);
                // We don't stop the response if DB save fails, just log it
            }
        }

        // --- 4. GENERATE AUDIO (Google TTS) ---
        const lang = (voice === 'Neerja' || voice === 'Prabhat') ? 'hi' : 'en';
        
        const results = await googleTTS.getAllAudioBase64(script, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
            timeout: 60000,
            splitPunct: '.!?' 
        });

        const combinedBase64 = results.map(r => r.base64).join('');
        const audioUrl = `data:audio/mp3;base64,${combinedBase64}`;

        res.json({
            success: true,
            audioUrl: audioUrl,
            transcript: script,
            podcastId: savedPodcastId, // Return the ID so frontend can delete it
            filename: originalFilename
        });

    } catch (error) {
        console.error("Generate Error:", error.message);
        res.status(500).json({ msg: "Server Error" });
    }
};

// --- NEW: DELETE PODCAST ENTRY ---
export const deletePodcast = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the podcast entry
        const podcast = await PodcastData.findById(id);

        if (!podcast) {
            return res.status(404).json({ msg: "Podcast entry not found." });
        }

        // Verify the podcast belongs to the requesting user
        if (podcast.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "Not authorized to delete this podcast." });
        }

        await PodcastData.findByIdAndDelete(id);
        
        console.log(`🗑️ Deleted podcast: ${podcast.filename} (ID: ${id})`);
        
        res.json({ 
            success: true, 
            msg: "Podcast deleted successfully.",
            filename: podcast.filename
        });

    } catch (error) {
        console.error("Delete Error:", error.message);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: "Invalid podcast ID." });
        }
        
        res.status(500).json({ msg: "Server Error" });
    }
};

// --- NEW: GET ALL USER'S PODCASTS ---
export const getUserPodcasts = async (req, res) => {
    try {
        const podcasts = await PodcastData.find({ user: req.user.id })
            .sort({ createdAt: -1 }) // Most recent first
            .select('-sourceText -generatedScript'); // Don't send full text, just metadata

        res.json({
            success: true,
            count: podcasts.length,
            podcasts: podcasts
        });

    } catch (error) {
        console.error("Fetch Podcasts Error:", error.message);
        res.status(500).json({ msg: "Server Error" });
    }
};
