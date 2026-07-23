const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/admin-login', authController.adminLogin);
router.post('/faculty-login', authController.facultyLogin);
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/admin-register', authController.adminRegister);
router.post('/admin-verify-otp', authController.adminVerifyOtp);
router.post('/forgot-password', authController.forgotPassword);
// Google OAuth routes
router.get('/google/faculty', passport.authenticate('google-faculty', { scope: ['profile', 'email'] }));
router.get('/google/admin', passport.authenticate('google-admin', { scope: ['profile', 'email'] }));

router.get('/google/callback/faculty', passport.authenticate('google-faculty', { failureRedirect: 'http://localhost:5173/faculty-login?error=Please register first using the register form.' }), (req, res) => {
    const token = authController.generateToken(req.user._id, req.user.role);
    res.redirect(`http://localhost:5173/faculty-dashboard?token=${token}&role=${req.user.role}&name=${encodeURIComponent(req.user.name)}`);
});

router.get('/google/callback/admin', passport.authenticate('google-admin', { failureRedirect: 'http://localhost:5173/admin-login' }), (req, res) => {
    const token = authController.generateToken(req.user._id, req.user.role);
    res.redirect(`http://localhost:5173/admin-dashboard?token=${token}&role=${req.user.role}&name=${encodeURIComponent(req.user.name)}`);
});

router.post('/add-faculty', protect, adminMiddleware, authController.addFaculty);
router.get('/user', protect, authController.getUserFromToken);
router.post('/complete-google-registration', authController.completeGoogleRegistration);

module.exports = router;
