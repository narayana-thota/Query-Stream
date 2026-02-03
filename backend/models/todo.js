// backend/models/Todo.js
import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', 
    required: true
  },
  text: { 
    type: String,
    required: true
  },
  // ✅ NEW FIELD: This allows the database to save High/Medium/Low
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'], // Only allows these 3 values
    default: 'Medium'
  },
  completed: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('todo', TodoSchema);