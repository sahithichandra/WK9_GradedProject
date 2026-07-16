import express from 'express';
import { login, register } from '../controllers/authController.js';


const router = express.Router();
// Route for user registration
router.post('/register', register);
// Route for user login
router.post('/login', login);


export default router;