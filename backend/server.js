// backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./db-mysql');
const authRoutes = require('./routes/auth');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Initialize database connection and tables
db.init().then(() => {
  console.log('? Database initialized.');
}).catch(err => {
  console.error('? Database init error:', err);
});

app.use('/api/auth', authRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
