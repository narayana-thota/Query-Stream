// backend/routes/todo.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import Todo from '../models/todo.js';

const router = express.Router();

// @route   GET /api/todos
// @desc    Get all todos for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ date: -1 });
    res.json(todos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/todos
// @desc    Create a new Todo (FIXED PRIORITY)
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  // ⚠️ FIX: Now extracting 'priority' from the request
  const { text, completed, priority } = req.body; 

  try {
    const newTodo = new Todo({
      text,
      completed,
      priority, // ⚠️ FIX: Passing priority to the database
      user: req.user.id
    });

    const todo = await newTodo.save();
    res.json(todo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/todos/:id
// @desc    Delete a todo
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ msg: 'Todo not found' });
    }

    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await todo.deleteOne();
    res.json({ msg: 'Todo removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/todos/:id
// @desc    Update a todo (Check/Uncheck)
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  const { text, completed, priority } = req.body;

  try {
    let todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ msg: 'Todo not found' });

    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (text) todo.text = text;
    if (completed !== undefined) todo.completed = completed;
    if (priority) todo.priority = priority; // Allow updating priority later too

    await todo.save();
    res.json(todo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/todos/completed
// @desc    Clear completed tasks
// @access  Private
router.delete('/completed', authMiddleware, async (req, res) => {
    try {
        await Todo.deleteMany({ user: req.user.id, completed: true });
        res.json({ msg: 'Completed todos removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;