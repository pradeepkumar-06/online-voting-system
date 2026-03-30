require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Candidate = require('./models/Candidate');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));


const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};


const seedDatabase = async () => {
    try {
        const count = await Candidate.countDocuments();
        if (count === 0) {
            await Candidate.insertMany([
                { name: 'Alice Smith', description: 'Experienced Leader' },
                { name: 'Bob Johnson', description: 'Innovative Thinker' },
                { name: 'Charlie Davis', description: 'Community Advocate' }
            ]);
            console.log('Seeded database with initial candidates');
        }

        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            await Settings.create({ votingActive: true, resultsPublished: false });
            console.log('Seeded default settings');
        }

        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const admin = new User({ username: 'admin', password: 'admin123', role: 'admin' });
            await admin.save();
            console.log('Seeded default admin user');
        }
    } catch (error) {
        console.error('Seeding error:', error);
    }
}
seedDatabase();


app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        user = new User({ username, password });
        await user.save();
        
        const token = jwt.sign({ _id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, hasVoted: user.hasVoted, username: user.username, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        } else {
            const validPass = await user.comparePassword(password);
            if (!validPass) return res.status(400).json({ error: 'Invalid Password' });
        }
        
        const token = jwt.sign({ _id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, hasVoted: user.hasVoted, username: user.username, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/candidates', authMiddleware, async (req, res) => {
    try {
        const settings = await Settings.findOne() || { votingActive: true, resultsPublished: false };
        const candidates = await Candidate.find().sort({ votes: -1 });
        const user = await User.findById(req.user._id);
        
        let returnCandidates = candidates;
        if (!settings.resultsPublished && user.role !== 'admin') {
            returnCandidates = candidates.map(c => ({
                _id: c._id,
                name: c.name,
                description: c.description
            }));
        }
        
        res.json({ 
            candidates: returnCandidates, 
            hasVoted: user?.hasVoted, 
            votingActive: settings.votingActive, 
            resultsPublished: settings.resultsPublished 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

app.post('/api/vote', authMiddleware, async (req, res) => {
    try {
        const settings = await Settings.findOne() || { votingActive: true, resultsPublished: false };
        if (!settings.votingActive) {
            return res.status(400).json({ error: 'Voting has ended' });
        }

        const user = await User.findById(req.user._id);
        if (user.hasVoted) {
            return res.status(400).json({ error: 'User has already voted' });
        }

        const candidateId = req.body.candidateId;
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
             return res.status(404).json({ error: 'Candidate not found' });
        }

        candidate.votes += 1;
        await candidate.save();

        user.hasVoted = true;
        await user.save();

        res.json({ message: 'Vote submitted successfully', hasVoted: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/end-voting', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();
        
        settings.votingActive = false;
        settings.resultsPublished = true;
        await settings.save();
        res.json({ message: 'Voting ended and results published', votingActive: false, resultsPublished: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/reset-voting', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // Reset all candidate votes to 0
        await Candidate.updateMany({}, { votes: 0 });
        
        // Reset all user voting status to false
        await User.updateMany({}, { hasVoted: false });
        
        // Reset settings
        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();
        
        settings.votingActive = true;
        settings.resultsPublished = false;
        await settings.save();
        
        res.json({ message: 'Voting has been reset', votingActive: true, resultsPublished: false });
    } catch (err) {
        console.error('Reset voting error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
