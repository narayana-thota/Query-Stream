// backend/controllers/authController.js
import User from '../models/UserModel.js'; // ✅ CHANGED to match new filename
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- LOGIN ---
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide an email and password' });
        }

        // 2. Check Config
        if (!process.env.JWT_SECRET) {
            console.error("FATAL: JWT_SECRET is missing.");
            return res.status(500).json({ message: 'Server Configuration Error' });
        }

        // 3. Find User & Get Password
        console.log(`[LOGIN] Attempting login for: ${email}`); // DEBUG LOG
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`[LOGIN] User not found: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 4. CRASH PROTECTION (Fixes "Illegal arguments" error)
        if (!user.password) {
            console.error(`[CRITICAL] User ${email} exists but has NO password. Deleting corrupted account.`);
            await User.deleteOne({ _id: user._id });
            return res.status(400).json({ message: 'Account corrupted. Please Register again.' });
        }

        // 5. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`[LOGIN] Password mismatch for: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 6. Success
        console.log(`[LOGIN] Success for: ${email}`);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- REGISTER ---
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Manual Hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};