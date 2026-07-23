// backend/routes/facultyRoutes.js
const express = require('express');
const router = express.Router();
const { getPublicFaculty, getPublicFacultyProfile, downloadFacultyProfilePDF, downloadFacultyEventsPDF, getAllFaculty, getTotalFaculties, searchFaculty, searchFacultyAdvanced, getMe, updateMe, updateProfile, uploadProfilePicture, getEvents, deleteFaculty, getInactiveFaculty, notifyFaculty, getMyNotifications, getDepartmentStats, generateDepartmentEventSummary, getDepartmentEventsSummary } = require('../controllers/facultyController');
const { protect, adminMiddleware, upload } = require('../middleware/authMiddleware');

// ------------------- Public Routes -------------------

// Get faculty by department (Public)
router.get('/public/:deptCode', getPublicFaculty);

// Get public faculty profile by ID
router.get('/public-profile/:facultyId', getPublicFacultyProfile);

// Download faculty profile as PDF (Public)
router.get('/download-profile/:facultyId', downloadFacultyProfilePDF);

// Download faculty events as PDF (Public)
router.get('/download-events/:facultyId', downloadFacultyEventsPDF);

// ------------------- Admin Routes -------------------

// Get all faculty data (Admin only)
router.get('/', protect, adminMiddleware, getAllFaculty);

// Get total faculties count (Admin only)
router.get('/total-faculties', protect, adminMiddleware, getTotalFaculties);

// Get inactive faculty (Admin only)
router.get('/inactive', protect, adminMiddleware, getInactiveFaculty);

// Notify faculty (Admin only)
router.post('/notify', protect, adminMiddleware, notifyFaculty);

// Search for faculty by ID (Admin only)
router.get('/search/:facultyId', searchFaculty);

// Advanced search for faculty (Admin only)
router.get('/search-advanced', searchFacultyAdvanced);

// ------------------- Faculty Routes -------------------

// Get own details (Faculty only)
router.get('/me', protect, getMe);

// Update data (Faculty only)
router.post('/me/update', protect, updateMe);

// Update profile (Faculty only)
router.put('/profile', protect, updateProfile);

// Upload profile picture (Faculty only)
router.post('/upload-profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);

// Get notifications for the current faculty (Faculty only)
router.get('/notifications', protect, getMyNotifications);

// Get department statistics (Admin only)
router.get('/stats/:deptCode', protect, adminMiddleware, getDepartmentStats);

// Get public department statistics (Public)
router.get('/public-stats/:deptCode', getDepartmentStats);

// Generate department event summary Excel (Admin only)
router.get('/summary/:deptCode/:eventType', generateDepartmentEventSummary);

// Get department events summary (Public)
router.get('/department-events-summary', getDepartmentEventsSummary);

router.get('/events/:facultyId', protect, adminMiddleware, getEvents);

// Delete faculty (Admin only)
router.delete('/:facultyId', protect, adminMiddleware, deleteFaculty);

module.exports = router;
