// backend/models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true // Removes whitespace from both ends
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true, // Creates the INDEX for O(log n) search speed
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ],
        lowercase: true, // normalization for faster, case-insensitive search
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Performance: Don't return password by default
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook: Hash the password before saving to the database
UserSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) {
        return next();
    }
    
    // Generate salt and hash
    // 10 rounds is the industry standard balance between security and speed
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Industry Standard: Add a method to compare passwords directly on the model
// This keeps the controller clean and ensures async comparison
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);