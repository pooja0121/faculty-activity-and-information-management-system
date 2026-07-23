const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const FacultyData = require('../models/FacultyData');

// Helper function to generate a JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

// Department mapping from codes to full names
const departmentMapping = {
    'CSE': 'Computer Science & Engineering',
    'IT': 'Information Technology',
    'AIDS': 'Artificial Intelligence & Data Science',
    'MECH': 'Mechanical Engineering',
    'CIVIL': 'Civil Engineering',
    'EEE': 'Electrical & Electronics Engineering',
    'ECE': 'Electronics & Communication Engineering'
};

// Function to extract department from email local part
const extractDepartment = (email) => {
    if (!email) return 'Unknown';
    const localPart = email.split('@')[0].toUpperCase(); // Get part before @ and uppercase
    for (const code of Object.keys(departmentMapping)) {
        if (localPart.includes(code)) {
            return departmentMapping[code];
        }
    }
    return 'Unknown'; // Default if no department found
};

// Temporary OTP storage (in-memory, for demo; use Redis in production)
const otpStore = new Map();

async function createTransporter() {
  // Use Gmail with faculty1721@gmail.com
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'faculty1721@gmail.com',
      pass: process.env.EMAIL_PASS,
    },
  });
  const fromEmail = 'faculty1721@gmail.com';
  return { transporter, fromEmail };
}

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Admin Login
const adminLogin = async (req, res) => {
    const { adminId, password } = req.body;
    console.log('Admin login attempt:', adminId);

    if (!adminId || !password) {
        return res.status(400).json({ message: 'Admin ID and password are required' });
    }

    try {
        const user = await User.findOne({ facultyId: adminId, role: 'admin' });
        console.log('Admin user found:', user);

        if (!user) {
            console.log('No admin user found with adminId:', adminId);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        let isMatch;
        if (user.password.length < 60) {
            // Legacy plain text password
            isMatch = user.password === password;
            console.log('Legacy plain password match:', isMatch);
        } else {
            isMatch = await bcrypt.compare(password, user.password);
            console.log('Hashed password match:', isMatch);
        }

        if (!isMatch) {
            console.log('Password mismatch for admin user:', adminId);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = generateToken(user._id, user.role);
        res.status(200).json({ token, role: user.role, name: user.name });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const facultyLogin = async (req, res) => {
    const { facultyId, password } = req.body;
    console.log('Faculty login attempt for facultyId:', facultyId);
    try {
        const user = await User.findOne({ facultyId, role: 'faculty' });
        console.log('User found:', user ? 'yes' : 'no');
        let isMatch = false;
        if (user) {
            if (user.password.length < 60) {
                // Legacy plain text password
                isMatch = user.password === password;
                console.log('Legacy plain password match:', isMatch);
            } else {
                isMatch = await bcrypt.compare(password, user.password);
                console.log('Hashed password match:', isMatch);
            }
        }
        if (user && isMatch) {
            // Update department if not set or 'Unknown'
            if (!user.department || user.department === 'Unknown') {
                const department = extractDepartment(user.email);
                user.department = department;
                await user.save();
            }

            const token = generateToken(user._id, user.role);
            console.log('Generated token for faculty login:', token); // Log the generated token
            console.log('JWT_SECRET used:', process.env.JWT_SECRET ? 'Set' : 'Not set'); // Check if secret is loaded
            res.status(200).json({ token, role: 'faculty', name: user.name });
        } else {
            res.status(401).json({ message: 'Invalid faculty ID or password' });
        }
    } catch (error) {
        console.error('Faculty login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Register
const register = async (req, res) => {
    const { facultyId, password, email } = req.body;
    console.log('Registration attempt for facultyId:', facultyId, 'email:', email);
    if (!facultyId || !password) {
        console.log('Missing fields in registration');
        return res.status(400).json({ message: 'Faculty ID and password are required' });
    }

    // If email not provided, auto-generate
    let userEmail = email;
    if (!userEmail) {
        userEmail = facultyId + '@nec.edu.in';
    }

    if (!userEmail.endsWith('@nec.edu.in')) {
        console.log('Invalid email domain');
        return res.status(400).json({ message: 'Email must end with @nec.edu.in' });
    }

    try {
        // Check if email is already used by another user
        const existingEmailUser = await User.findOne({ email: userEmail, facultyId: { $ne: facultyId } });
        if (existingEmailUser) {
            return res.status(400).json({ message: 'Email already in use by another user' });
        }

        // Extract department from email
        const department = extractDepartment(userEmail);

        // Hash password explicitly
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Use upsert to create or update user (allows registration even if facultyId exists, updates password and department)
        const user = await User.findOneAndUpdate(
            { facultyId },
            {
                $set: {
                    name: facultyId,
                    email: userEmail,
                    department,
                    password: hashedPassword,
                    role: 'faculty'
                },
                $setOnInsert: {
                    joiningDate: new Date() // Only set on insert, not on update
                }
            },
            { upsert: true, new: true }
        );

        console.log('User upserted successfully:', user._id);
        const token = generateToken(user._id, user.role);
        res.status(201).json({ message: 'Registration successful', token, role: user.role, name: user.name });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify OTP and create user
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const stored = otpStore.get(email);
    if (!stored || stored.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP expired (5 minutes)
    if (Date.now() - stored.timestamp > 5 * 60 * 1000) {
        otpStore.delete(email);
        return res.status(400).json({ message: 'OTP expired' });
    }

    try {
        const { facultyId, password } = stored.data;
        // Hash password explicitly
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            facultyId,
            name: facultyId, // Assuming name is facultyId for now
            email,
            password: hashedPassword,
            role: 'faculty',
            joiningDate: new Date(),
        });

        await user.save();
        otpStore.delete(email);

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin Register
const adminRegister = async (req, res) => {
    const { adminId, password, email } = req.body;

    if (!adminId || !password || !email) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!email.endsWith('@nec.edu.in')) {
        return res.status(400).json({ message: 'Email must end with @nec.edu.in' });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ facultyId: adminId }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Admin ID or email already exists' });
        }

        const otp = generateOTP();
        otpStore.set(email, { otp, timestamp: Date.now(), data: { adminId, password, email } });

        // Send OTP email
        try {
            const { transporter, fromEmail } = await createTransporter();
            const mailOptions = {
                from: fromEmail,
                to: email,
                subject: 'OTP for Admin Registration',
                text: `Your OTP for admin registration is: ${otp}. It expires in 5 minutes.`,
            };
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'OTP sent to your email' });
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            otpStore.delete(email); // Clean up
            return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
        }
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify OTP and create admin user
const adminVerifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const stored = otpStore.get(email);
    if (!stored || stored.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP expired (5 minutes)
    if (Date.now() - stored.timestamp > 5 * 60 * 1000) {
        otpStore.delete(email);
        return res.status(400).json({ message: 'OTP expired' });
    }

    try {
        const { adminId, password } = stored.data;
        // Hash password explicitly
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            facultyId: adminId,
            name: adminId, // Assuming name is adminId for now
            email,
            password: hashedPassword,
            role: 'admin',
        });

        await user.save();
        otpStore.delete(email);

        res.status(201).json({ message: 'Admin registration successful' });
    } catch (error) {
        console.error('Admin OTP verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add Faculty (Admin only)
const addFaculty = async (req, res) => {
    const { facultyId, name, email, department, password } = req.body;

    if (!facultyId || !name || !email || !department || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!email.endsWith('@nec.edu.in')) {
        return res.status(400).json({ message: 'Email must end with @nec.edu.in' });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ facultyId }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Faculty ID or email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            facultyId,
            name,
            email,
            department,
            password: hashedPassword,
            role: 'faculty',
            joiningDate: new Date(),
        });

        await user.save();

        // Create FacultyData entry
        const facultyData = new FacultyData({ user: user._id });
        await facultyData.save();

        res.status(201).json({ message: 'Faculty added successfully' });
    } catch (error) {
        console.error('Add faculty error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const forgotPassword = async (req, res) => {
    const { facultyId } = req.body;

    if (!facultyId) {
        return res.status(400).json({ message: 'Faculty ID is required' });
    }

    try {
        const user = await User.findOne({ facultyId, role: 'faculty' });
        if (!user) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Generate a reset token (simple for demo, use JWT in production)
        const resetToken = generateToken(user._id, user.role);

        // Send email to faculty
        try {
            const { transporter, fromEmail } = await createTransporter();
            const mailOptions = {
                from: fromEmail,
                to: user.email,
                subject: 'Password Reset Request',
                text: `You have requested a password reset. Your reset token is: ${resetToken}. Please use this token to reset your password.`,
            };
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);

            // Log preview URL for Ethereal emails
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
            }

            res.status(200).json({ message: 'Password reset link sent to your email' });
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            console.log('Reset token for faculty', facultyId, ':', resetToken);
            // Return success even if email fails, as token is logged
            res.status(200).json({ message: 'Password reset link sent to your email' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserFromToken = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('email name');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const completeGoogleRegistration = async (req, res) => {
    const { facultyId, password } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!facultyId || !password || !token) {
        return res.status(400).json({ message: 'Faculty ID, password, and token are required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || user.facultyId !== null) {
            return res.status(400).json({ message: 'Invalid user or already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.facultyId = facultyId;
        user.password = hashedPassword;
        user.name = facultyId;
        const department = extractDepartment(user.email);
        user.department = department;
        await user.save();

        const facultyData = new FacultyData({ user: user._id });
        await facultyData.save();

        const newToken = generateToken(user._id, user.role);
        res.status(200).json({ message: 'Registration completed', token: newToken, role: user.role, name: user.name });
    } catch (error) {
        console.error('Complete Google registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Only initialize Google strategies if environment variables are set
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {

    // Passport Google Strategy for Faculty
    passport.use('google-faculty', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/api/auth/google/callback/faculty',
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            if (!email.endsWith('@nec.edu.in')) {
                return done(null, false, { message: 'Only nec.edu.in emails are allowed' });
            }

            let user = await User.findOne({ email, role: 'faculty' });
            if (!user) {
                return done(null, false, { message: 'Please register first using the register form.' });
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    // Passport Google Strategy for Admin
    passport.use('google-admin', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/api/auth/google/callback/admin',
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            if (!email.endsWith('@nec.edu.in')) {
                return done(null, false, { message: 'Only nec.edu.in emails are allowed' });
            }

            let user = await User.findOne({ email, role: 'admin' });
            if (!user) {
                // Create new admin user
                user = new User({
                    facultyId: profile.id, // Use Google ID as facultyId
                    name: profile.displayName,
                    email,
                    password: 'oauth-user', // Dummy password for OAuth users
                    role: 'admin',
                });
                await user.save();
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));
}

// Passport serialize and deserialize for session management
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = { adminLogin, facultyLogin, register, verifyOtp, adminRegister, adminVerifyOtp, addFaculty, forgotPassword, getUserFromToken, completeGoogleRegistration, generateToken };
