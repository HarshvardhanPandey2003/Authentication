// 2.) backend/src/middleware/auth.middleware.js
// Checks for a JWT token in cookies.
// Verifies the token using jwt.verify().
// Fetches the user from the database and attaches it to req.user.
// Blocks unauthorized access with errors (e.g., throw new ApiError).
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js'; 

export const protect = asyncHandler(async (req, res, next) => {
  // Look for the JWT in a cookie named 'jwt'
  const token = req.cookies?.jwt;
  
  if (!token) {
    // For WebSocket context
    if (typeof res.status !== 'function') {
      return next(new Error('WS_AUTH_REQUIRED'));
    }
    // For regular HTTP context
    throw new ApiError(401, 'Authentication required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      const error = new ApiError(401, 'User not found');
      return typeof res.status === 'function' 
        ? next(error) 
        : next(new Error('WS_INVALID_USER'));
    }

    req.user = user;
    next();
  } catch (err) {
    if (typeof res.status !== 'function') {
      return next(new Error('WS_INVALID_TOKEN'));
    }
    next(new ApiError(401, 'Invalid or expired token'));
  }
});
