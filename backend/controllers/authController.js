import User from '../models/UserModel.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- LOGIN ---
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Log the attempt (To verify new code is running)
        console.log(`[LOGIN ATTEMPT] Email: ${email}`);

        // 2. Validate
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // 3. Find User (Password is now included by default)
        const user = await User.findOne({ email });

        if (!user) {
            console.log("[LOGIN FAIL] User not found");
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 4. Debugging Check (This will show in Render logs)
        if (!user.password) {
            console.error("[CRITICAL] User exists but password is missing!");
            return res.status(500).json({ message: 'Account corrupted. Register again.' });
        }

        // 5. Compare Password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("[LOGIN FAIL] Wrong password");
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 6. Success - REMOVE password before sending response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            ...userResponse,
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
            // Remove password before sending
            const userResponse = user.toObject();
            delete userResponse.password;

            res.status(201).json({
                ...userResponse,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }

    } catch (error) {
        console.error("Register Error:", error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

const generateToken = (id) => {
    // Safety check for JWT_SECRET
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("FATAL: JWT_SECRET is missing");
        return null;
    }
    return jwt.sign({ id }, secret, { expiresIn: '30d' });
};