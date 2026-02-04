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
    const safeText = text ? text.substring(0, 30000) : ""; 

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
        let pdfTextContent = ""; 
        let podcastName = "AI Podcast"; // Default name

        // --- 1. HANDLE PDF UPLOAD ---
        if (req.file) {
            console.log("📄 PDF Uploaded. Parsing...");
            try {
                const pdfData = await pdfParse(req.file.buffer);
                if (!pdfData || !pdfData.text) throw new Error("No text found in PDF.");

                // Clean text
                pdfTextContent = pdfData.text.replace(/\n/g, " ").replace(/\s+/g, " ");
                
                // Use filename as the Podcast Name (Remove .pdf extension)
                podcastName = req.file.originalname.replace(/\.pdf$/i, '');

                // Append to text for generation
                text = (text || '') + "\n" + pdfTextContent;
                console.log(`✅ PDF Parsed. Length: ${pdfTextContent.length} chars.`);

            } catch (pdfErr) {
                console.error("PDF Error:", pdfErr);
                return res.status(400).json({ msg: "Failed to read PDF." });
            }
        } else if (text) {
             // If manual text, create a name from the first few words
             podcastName = text.split(' ').slice(0, 4).join(' ') + '...';
        }

        if (!text || !text.trim()) {
            return res.status(400).json({ msg: "Please provide text or upload a PDF." });
        }

        console.log(`🎙️ Generating: ${voice} | ${tone}`);

        // --- 2. GENERATE SCRIPT ---
        const script = await generateScript(text, tone, length);
        console.log("📝 Script Ready.");

        // --- 3. GENERATE AUDIO (Google TTS) ---
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

        // --- 4. SAVE TO MONGODB ---
        let savedPodcastId = null;

        if (req.user && req.user.id) {
            try {
                const newPodcastEntry = new PodcastData({
                    user: req.user.id,
                    name: podcastName,         // 🔧 FIXED: Saves the PDF filename here
                    transcript: script,
                    audioUrl: audioUrl,
                    duration: length === 'Short' ? '< 2 mins' : length === 'Medium' ? '2-5 mins' : '5+ mins'
                });
                
                const savedPodcast = await newPodcastEntry.save();
                savedPodcastId = savedPodcast._id;
                console.log(`💾 Saved to DB: ${podcastName} (ID: ${savedPodcastId})`);
            } catch (dbErr) {
                console.error("Database Save Error:", dbErr);
            }
        }

        res.json({
            success: true,
            audioUrl: audioUrl,
            transcript: script,
            podcastId: savedPodcastId,
            name: podcastName
        });

    } catch (error) {
        console.error("Generate Error:", error.message);
        res.status(500).json({ msg: "Server Error" });
    }
};

// --- DELETE PODCAST ENTRY ---
export const deletePodcast = async (req, res) => {
    try {
        const { id } = req.params;
        const podcast = await PodcastData.findById(id);

        if (!podcast) return res.status(404).json({ msg: "Podcast entry not found." });
        if (podcast.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized." });

        await PodcastData.findByIdAndDelete(id);
        
        console.log(`🗑️ Deleted podcast: ${podcast.name} (ID: ${id})`);
        
        res.json({ success: true, msg: "Podcast deleted successfully.", id: id });

    } catch (error) {
        console.error("Delete Error:", error.message);
        res.status(500).json({ msg: "Server Error" });
    }
};

// --- GET USER PODCASTS ---
export const getUserPodcasts = async (req, res) => {
    try {
        const podcasts = await PodcastData.find({ user: req.user.id })
            .sort({ createdAt: -1 }) 
            .select('name audioUrl duration createdAt'); // 🔧 FIXED: Ensuring createdAt is sent

        res.json(podcasts); 
    } catch (error) {
        console.error("Fetch Podcasts Error:", error.message);
        res.status(500).json({ msg: "Server Error" });
    }
};