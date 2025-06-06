const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Enable CORS with specific configuration
app.use(
  cors({
    origin: 'https://kaleidoscopic-liger-192bde.netlify.app', // Your frontend's domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Include credentials if needed
  })
);

// Handle preflight requests
//app.options('*', cors());

// Debug CORS headers (Optional - for testing only)
app.use((req, res, next) => {
  console.log(`Request Origin: ${req.headers.origin}`);
  res.setHeader('Access-Control-Allow-Origin', 'https://kaleidoscopic-liger-192bde.netlify.app');
  next();
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
