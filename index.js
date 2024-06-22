require('dotenv').config();
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/api/v1/admin');
const authRouters = require('./routes/api/v1/auth');
const authMiddleware = require('./middlewares/auth');
const rateLimit = require('express-rate-limit');
const { default: mongoose } = require('mongoose');
const clientRoutes = require('./routes/api/v1/Client');

const app = express();
const port = process.env.PORT || 3000;

// Create a rate limiter
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 15, // Limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again later.'
    }
});

const corsOptions = {
    origin: 'http://localhost:9000',
    optionsSuccessStatus: 200,
    credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json()); // Middleware to parse JSON bodies

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use('/api/v1/auth', limiter, authRouters);
app.use('/api/v1/client', clientRoutes);
app.use('/api/v1/admin', authMiddleware, adminRoutes);

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});


app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
});
