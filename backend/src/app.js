// backend/src/index.js
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import authRouter from './routes/auth.routes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());

// Mount the authentication routes
app.use('/api/auth', authRouter);

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message,
  });
});

// Define the port from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Connect to the database and start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  });
