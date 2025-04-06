const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const User = require('./user');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

connectDB();

// Routes
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = new User({ email, password });
  await user.save();
  res.json({ message: 'User registered successfully' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token });
});

// Score endpoints
app.post('/submit-score', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { score } = req.body;
    
    const user = await User.findById(decoded.userId);
    if (score > user.highScore) {
      user.highScore = score;
      user.lastPlayed = Date.now();
      await user.save();
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Score submission failed' });
  }
});

app.get('/leaderboard', async (req, res) => {
  try {
    const topPlayers = await User.find()
      .sort({ highScore: -1 })
      .limit(10)
      .select('email highScore lastPlayed');
    
    res.json(topPlayers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get leaderboard' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
