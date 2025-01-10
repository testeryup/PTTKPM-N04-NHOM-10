import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../config/jwt.config.js';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers.Authorization?.split(' ')[1];
    if (!token) {
      return res.status(403).json({ 
        message: 'No token provided',
        code: 'TOKEN_MISSING'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      throw err;
    }
  } catch (error) {
    return res.status(401).json({
      message: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    next();
  };
};