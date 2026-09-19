import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email address already exists', 'DUPLICATE_EMAIL');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: password, // Pre-save hook hashes it
  });

  const token = generateToken(user._id);

  res.cookie('accessToken', token, COOKIE_OPTIONS);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      'Registration successful'
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const token = generateToken(user._id);

  res.cookie('accessToken', token, COOKIE_OPTIONS);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      'Login successful'
    )
  );
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('accessToken', COOKIE_OPTIONS);
  return res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
});

export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      },
      'User profile retrieved'
    )
  );
});
