const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Middleware to protect routes and check role
const protect = (req, res, next) => {
    let token;
    console.log('Incoming request headers:', req.headers); // Log all headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Extracted token:', token); // Log the token (for debugging, remove in production)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('JWT verification successful, decoded:', decoded); // Log decoded payload
            req.user = decoded;
            next();
        } catch (error) {
            console.log('JWT verification failed:', error.message); // Log the error
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.log('No Authorization header or not starting with Bearer');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

module.exports = { protect, adminMiddleware, upload };
