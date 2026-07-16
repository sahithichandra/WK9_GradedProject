import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createAppError } from '../utils/createAppError.js';

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        throw createAppError('No token provided, authorization denied.', 401);
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw createAppError('Token is not valid.', 401);
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
        throw createAppError('User not found.', 401);
    }

    req.user = { id: user._id, isAdmin: user.isAdmin };
    next();
};

export default authenticate;
