import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/UserModel.js'; // Ensure this matches your model filename

const router = express.Router();

// @route   POST /api/auth/login
// @desc    DIAGNOSTIC VERSION - Logs every step
router.post('/login', async (req, res) => {
    console.log("-------------------------------------------------");
    console.log("[DIAGNOSTIC] Login Request Received");

    const { email, password } = req.body;

    // 1. Log Input
    console.log(`[DIAGNOSTIC] Step 1: Input Check`);
    console.log(`   - Email Provided: ${email}`);
    console.log(`   - Password Provided: ${password ? "YES (Hidden)" : "NO"}`);

    try {
        // 2. Find User
        console.log(`[DIAGNOSTIC] Step 2: Querying Database for ${email}...`);
        
        // We explicitly select +password to ensure it's returned even if select: false
        const user = await User.findOne({ email }).select('+password');

        // 3. Inspect User Object
        console.log(`[DIAGNOSTIC] Step 3: Database Result`);
        if (!user) {
            console.log("   - ❌ User NOT FOUND in database.");
            return res.status(400).json({ msg: 'Invalid Credentials (User not found)' });
        }
        
        console.log(`   - ✅ User ID: ${user._id}`);
        console.log(`   - ✅ Email: ${user.email}`);
        
        // CRITICAL CHECK: Is the password field actually there?
        if (typeof user.password === 'undefined') {
            console.error("   - ❌ FATAL ERROR: 'user.password' is UNDEFINED.");
            console.error("   - This means the user exists, but has NO password saved.");
            return res.status(500).json({ msg: 'DIAGNOSTIC FAIL: User has no password.' });
        } else {
            console.log(`   - ✅ Password Hash Found: ${user.password.substring(0, 10)}...`);
        }

        // 4. Compare Password
        console.log(`[DIAGNOSTIC] Step 4: Comparing Passwords...`);
        const isMatch = await bcrypt.compare(password, user.password);
        
        console.log(`   - Password Match Result: ${isMatch}`);

        if (!isMatch) {
            console.log("   - ❌ Password Mismatch");
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 5. Success
        console.log(`[DIAGNOSTIC] Step 5: generating Token...`);
        const payload = { user: { id: user.id } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                console.log(`[DIAGNOSTIC] ✅ Login Successful! Sending response.`);
                res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
            }
        );

    } catch (err) {
        console.error("-------------------------------------------------");
        console.error("[DIAGNOSTIC] ❌ CRASH DETECTED");
        console.error(err); // This prints the full error stack
        console.error("-------------------------------------------------");
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    // Keeping register simple for now to focus on Login
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name, email, password });
        
        // Manual Hashing to ensure it works
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;