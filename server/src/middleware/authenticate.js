import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required', 'UNAUTHENTICATED');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User account is inactive or no longer exists', 'UNAUTHENTICATED');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid or expired session token', 'INVALID_TOKEN');
  }
});
