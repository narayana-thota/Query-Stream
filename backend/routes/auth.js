// backend/routes/auth.js

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js'; 

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user & get token (AND SET COOKIE)
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. Create new user instance
        user = new User({
            name,
            email,
            password
        });

        // 3. Hash password (assuming pre-save middleware exists in User.js)
        // If not, uncomment the bcrypt lines below:
        // const salt = await bcrypt.genSalt(10);
        // user.password = await bcrypt.hash(password, salt);

        await user.save();

        // 4. Create JWT Payload
        const payload = {
            user: {
                id: user.id
            }
        };

        // 5. Sign Token & SET COOKIE
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;

                // ✅ FIX: Set the cookie so the browser saves the session
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,    // Set to FALSE for localhost (True for production)
                    sameSite: 'lax',  // Set to LAX for localhost
                    maxAge: 5 * 24 * 60 * 60 * 1000 // 5 days
                });

                // Send JSON response with user data
                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (AND SET COOKIE)
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. Create Payload
        const payload = {
            user: {
                id: user.id
            }
        };

        // 4. Sign Token & SET COOKIE
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;

                // ✅ FIX: Set the cookie here too!
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,     // FALSE for localhost
                    sameSite: 'lax',   // LAX for localhost
                    maxAge: 5 * 24 * 60 * 60 * 1000 // 5 days
                });

                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;