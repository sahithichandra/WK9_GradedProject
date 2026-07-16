import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import all the models.
import Question from "./models/Question.js";
import Answer from "./models/Answer.js";
import User from "./models/User.js";
import Tag from "./models/Tag.js";

import router from './routes/index.js';
import errorhandler from './middleware/errorHandler.js';

const app = express();

// Security middlewares
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-8', // RFC 6585 combined RateLimit header (v8.x API)
    legacyHeaders: false,
});
app.use(limiter);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ 
    limit: '10mb', 
    extended: true 
}));

// Use router
app.use('/api', router);

// Error handling middleware
app.use(errorhandler);

export default app;