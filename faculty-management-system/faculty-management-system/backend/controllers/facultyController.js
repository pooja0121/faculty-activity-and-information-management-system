const FacultyData = require('../models/FacultyData');
const User = require('../models/User');
const { jsPDF } = require('jspdf');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Get inactive faculty (Admin only)
const getInactiveFaculty = async (req, res) => {
    try {
        const facultyData = await FacultyData.find().populate('user', 'name facultyId email department');

        const inactiveFaculty = [];

        for (const data of facultyData) {
            const allActivities = [
                ...data.facultyDevelopmentPrograms,
                ...data.workshops,
                ...data.seminars,
                ...data.industryKnowHow,
                ...data.fellowships,
                ...data.guestLectures,
                ...data.publications,
                ...data.patents,
                ...data.projectProposals,
                ...data.fundingReceived,
                ...data.phdDegrees,
            ];

            // If no activities at all
            if (allActivities.length === 0) {
                inactiveFaculty.push({
                    facultyId: data.user.facultyId,
                    name: data.user.name,
                    email: data.user.email,
                    department: data.user.department,
                    lastActivity: 'Never',
                });
            }
        }

        res.status(200).json(inactiveFaculty);
    } catch (error) {
        console.error('Error fetching inactive faculty:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Notify faculty (Admin only)
const notifyFaculty = async (req, res) => {
    try {
        const { facultyIds, message } = req.body;

        // For now, just log the notification. In a real app, you'd send emails or in-app notifications
        console.log('Notification sent to faculty:', facultyIds, 'Message:', message);

        // Here you could integrate with an email service like Nodemailer
        // or save notifications to a database

        res.status(200).json({ message: 'Notifications sent successfully' });
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get faculty by department (Public)
const getPublicFaculty = async (req, res) => {
    try {
        const { deptCode } = req.params;
        const departmentMap = {
            CSE: 'Computer Science & Engineering',
            IT: 'Information Technology',
            AIDS: 'Artificial Intelligence & Data Science',
            MECH: 'Mechanical Engineering',
            CIVIL: 'Civil Engineering',
            EEE: 'Electrical & Electronics Engineering',
            ECE: 'Electronics & Communication Engineering',
        };
        const fullDeptName = departmentMap[deptCode.toUpperCase()] || deptCode;
        const normalizedFull = fullDeptName.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
        const normalizedCode = deptCode.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
        const facultyData = await FacultyData.find().populate('user', 'name facultyId email department designation phone address qualification experience joiningDate specialization bio profilePicture');
        const filtered = facultyData.filter(facultyItem => {
            const dept = facultyItem.user?.department || '';
            const normalizedDept = dept.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
            return normalizedDept === normalizedFull || normalizedDept === normalizedCode;
        });
        res.status(200).json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get public faculty profile by ID
const getPublicFacultyProfile = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const user = await User.findOne({ facultyId, role: 'faculty' });
        if (!user) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        const facultyData = await FacultyData.findOne({ user: user._id }).populate('user', 'name facultyId email phone address department designation qualification experience joiningDate specialization bio profilePicture');
        if (!facultyData) {
            return res.status(404).json({ message: 'Faculty data not found' });
        }
        res.status(200).json(facultyData);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllFaculty = async (req, res) => {
    try {
        const facultyData = await FacultyData.find().populate('user', 'name facultyId email department designation phone address qualification experience joiningDate specialization bio profilePicture');
        res.status(200).json(facultyData);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get total faculties count (Admin only)
const getTotalFaculties = async (req, res) => {
    try {
        const totalFaculties = await User.countDocuments({ role: 'faculty' });
        res.status(200).json({ totalFaculties });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get total publications count (Admin only)
const getTotalPublications = async (req, res) => {
    try {
        const facultyData = await FacultyData.find();
        let totalPublications = 0;
        facultyData.forEach(data => {
            totalPublications += data.publications ? data.publications.length : 0;
        });
        res.status(200).json({ totalPublications });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Search for faculty by ID (Admin only)
const searchFaculty = async (req, res) => {
    try {
        const user = await User.findOne({ facultyId: req.params.facultyId, role: 'faculty' });
        if (!user) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        const facultyData = await FacultyData.findOne({ user: user._id }).populate('user', 'name facultyId email');
        res.status(200).json(facultyData);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Advanced search for faculty (Admin only)
const searchFacultyAdvanced = async (req, res) => {
    try {
        const { facultyId, specialization, qualification, experience } = req.query;
        const query = { role: 'faculty' };

        if (facultyId) {
            query.facultyId = { $regex: facultyId, $options: 'i' };
        }
        if (specialization) {
            query.specialization = { $regex: specialization, $options: 'i' };
        }
        if (qualification) {
            query.qualification = { $regex: qualification, $options: 'i' };
        }
        if (experience) {
            query.experience = { $regex: experience, $options: 'i' };
        }

        const users = await User.find(query).select('name facultyId email department designation specialization qualification experience joiningDate');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching faculty:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get own details (Faculty only)
const getMe = async (req, res) => {
    try {
        const facultyData = await FacultyData.findOne({ user: req.user.id }).populate('user', 'name facultyId email phone address department designation qualification experience joiningDate specialization bio profilePicture');
        if (!facultyData) {
            // Create a new data entry for the faculty if it doesn't exist
            const newFacultyData = new FacultyData({ user: req.user.id });
            await newFacultyData.save();
            return res.status(201).json(newFacultyData);
        }
        res.status(200).json(facultyData);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update data (Faculty only)
const updateMe = async (req, res) => {
    try {
        const { field, data } = req.body;
        console.log('Update request received:', { field, data, userId: req.user.id }); // Added logging
        const facultyData = await FacultyData.findOne({ user: req.user.id });
        if (!facultyData) {
            console.log('Faculty data not found for user:', req.user.id);
            return res.status(404).json({ message: 'Faculty data not found' });
        }

        // Add new data to the correct array based on the 'field'
        if (Array.isArray(facultyData[field])) {
            facultyData[field].push(data);
        } else {
            console.log('Invalid data field:', field);
            return res.status(400).json({ message: 'Invalid data field' });
        }

        await facultyData.save();
        console.log('Data saved successfully for user:', req.user.id);
        res.status(200).json({ message: 'Data updated successfully' });
    } catch (error) {
        console.error('Error updating faculty data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update profile (Faculty only)
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user profile fields
        const updateFields = ['name', 'email', 'phone', 'address', 'department', 'designation', 'qualification', 'experience', 'joiningDate', 'specialization', 'bio', 'profilePicture'];
        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        await user.save();

        // Get updated faculty data
        const facultyData = await FacultyData.findOne({ user: req.user.id }).populate('user', 'name facultyId email phone address department designation qualification experience joiningDate specialization bio profilePicture');

        res.status(200).json(facultyData);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

// Upload profile picture (Faculty only)
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's profile picture path
        user.profilePicture = `/uploads/${req.file.filename}`;
        await user.save();

        // Get updated faculty data
        const facultyData = await FacultyData.findOne({ user: req.user.id }).populate('user', 'name facultyId email phone address department designation qualification experience joiningDate specialization bio profilePicture');

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            profilePicture: user.profilePicture,
            facultyData
        });
    } catch (error) {
        console.error('Profile picture upload error:', error);
        res.status(500).json({ message: 'Failed to upload profile picture' });
    }
};

const getEvents = async (req, res) => {
    try {
        const user = await User.findOne({ facultyId: req.params.facultyId, role: 'faculty' });
        if (!user) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        const facultyData = await FacultyData.findOne({ user: user._id });
        if (!facultyData) {
            return res.status(404).json({ message: 'Faculty data not found' });
        }

        // Aggregate all event arrays into a single list with full details and type info
        const events = [];

        const addEvents = (arr, type) => {
            if (Array.isArray(arr)) {
                arr.forEach(item => {
                    // Clone the item to avoid mutating original and remove MongoDB internals
                    const event = { ...JSON.parse(JSON.stringify(item)), type };
                    // Ensure date is formatted if present
                    if (event.date) {
                        event.date = new Date(event.date).toISOString().split('T')[0];
                    }
                    if (event.vivaDate) {
                        event.vivaDate = new Date(event.vivaDate).toISOString().split('T')[0];
                    }
                    events.push(event);
                });
            }
        };

        addEvents(facultyData.facultyDevelopmentPrograms, 'Faculty Development Program');
        addEvents(facultyData.workshops, 'Workshop');
        addEvents(facultyData.seminars, 'Seminar');
        addEvents(facultyData.industryKnowHow, 'Industry Know How');
        addEvents(facultyData.fellowships, 'Fellowship');
        addEvents(facultyData.guestLectures, 'Guest Lecture');
        addEvents(facultyData.publications, 'Publication');
        addEvents(facultyData.patents, 'Patent');
        addEvents(facultyData.projectProposals, 'Project Proposal');
        addEvents(facultyData.fundingReceived, 'Funding Received');
        addEvents(facultyData.phdDegrees, 'PhD Degree');

        res.status(200).json({
            facultyName: user.name,
            events
        });
    } catch (error) {
        console.error('Error fetching faculty events:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get notifications for the current faculty (Faculty only)
const getMyNotifications = async (req, res) => {
    try {
        const facultyData = await FacultyData.findOne({ user: req.user.id }).populate('user', 'joiningDate');
        if (!facultyData) {
            return res.status(200).json([]); // No data, no notifications
        }

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        // Check if faculty joined within the last 3 months - give grace period
        const joiningDate = facultyData.user?.joiningDate ? new Date(facultyData.user.joiningDate) : null;
        if (joiningDate && joiningDate > threeMonthsAgo) {
            return res.status(200).json([]); // New faculty, no notifications yet
        }

        const allActivities = [
            ...facultyData.facultyDevelopmentPrograms,
            ...facultyData.workshops,
            ...facultyData.seminars,
            ...facultyData.industryKnowHow,
            ...facultyData.fellowships,
            ...facultyData.guestLectures,
            ...facultyData.publications,
            ...facultyData.patents,
            ...facultyData.projectProposals,
            ...facultyData.fundingReceived,
            ...facultyData.phdDegrees,
        ];

        // Find the latest activity date
        let latestDate = null;
        for (const activity of allActivities) {
            const activityDate = activity.date || activity.appliedDate || activity.vivaDate;
            if (activityDate && (!latestDate || new Date(activityDate) > latestDate)) {
                latestDate = new Date(activityDate);
            }
        }

        const notifications = [];
        // If no activities or latest activity is more than 3 months ago
        if (!latestDate || latestDate < threeMonthsAgo) {
            notifications.push({
                type: 'inactivity',
                message: 'You have been inactive for more than 3 months. Please update your academic activities.',
                date: new Date().toISOString(),
            });
        }

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete faculty (Admin only)
const deleteFaculty = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const user = await User.findOne({ facultyId, role: 'faculty' });
        if (!user) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        // Delete associated FacultyData
        await FacultyData.findOneAndDelete({ user: user._id });
        // Delete User
        await User.findByIdAndDelete(user._id);
        res.status(200).json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Download faculty profile as PDF (Public)
const downloadFacultyProfilePDF = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const user = await User.findOne({ facultyId, role: 'faculty' });
        if (!user) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        const facultyData = await FacultyData.findOne({ user: user._id }).populate('user', 'name facultyId email phone address department designation qualification experience joiningDate specialization bio profilePicture');
        if (!facultyData) {
            return res.status(404).json({ message: 'Faculty data not found' });
        }

        // Create PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Faculty Profile', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;

        // Profile Picture (if available)
        if (user.profilePicture) {
            try {
                const imagePath = path.join(__dirname, '../uploads', path.basename(user.profilePicture));
                if (fs.existsSync(imagePath)) {
                    const imageBuffer = fs.readFileSync(imagePath);
                    const imageBase64 = imageBuffer.toString('base64');
                    doc.addImage(`data:image/jpeg;base64,${imageBase64}`, 'JPEG', 20, yPosition, 50, 50);
                    yPosition += 60;
                } else {
                    doc.setFontSize(12);
                    doc.text('Profile Picture: Not found', 20, yPosition);
                    yPosition += 10;
                }
            } catch (error) {
                console.error('Error adding profile picture:', error);
                doc.setFontSize(12);
                doc.text('Profile Picture: Error loading', 20, yPosition);
                yPosition += 10;
            }
        }

        // Basic Information
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Basic Information', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const formatDate = (date) => {
            if (!date) return 'N/A';
            const d = new Date(date);
            if (isNaN(d.getTime())) return 'N/A';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const basicInfo = [
            { label: 'Name:', value: user.name },
            { label: 'Faculty ID:', value: user.facultyId },
            { label: 'Designation:', value: user.designation || 'N/A' },
            { label: 'Email:', value: user.email || 'N/A' },
            { label: 'Phone:', value: user.phone || 'N/A' },
            { label: 'Department:', value: user.department || 'N/A' },
            { label: 'Qualification:', value: user.qualification || 'N/A' },
            { label: 'Experience:', value: user.experience || 'N/A' },
            { label: 'Joining Date:', value: formatDate(user.joiningDate) },
            { label: 'Specialization:', value: user.specialization || 'N/A' },
            { label: 'Bio:', value: user.bio || 'N/A' }
        ];

        basicInfo.forEach(info => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.text(info.label, 20, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(info.value, 80, yPosition);
            yPosition += 10;
        });

        yPosition += 10;

        // Helper function to format item for PDF (deep clone and remove internals)
        const formatItemForPDF = (item) => {
            const formatted = JSON.parse(JSON.stringify(item)); // Deep clone to remove Mongoose internals

            const removeAndFormat = (obj) => {
                if (typeof obj !== 'object' || obj === null) return obj;
                if (Array.isArray(obj)) {
                    return obj.map(removeAndFormat);
                }
                const newObj = {};
                for (const key in obj) {
                    if (!key.startsWith('$') && !key.startsWith('__') && key !== '_id' && key !== '__v' && key !== 'user') {
                        let value = obj[key];
                        if (typeof value === 'object' && value !== null) {
                            value = removeAndFormat(value);
                        } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                            // Format ISO date strings
                            const date = new Date(value);
                            if (!isNaN(date.getTime())) {
                                const day = String(date.getDate()).padStart(2, '0');
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const year = date.getFullYear();
                                value = `${day}/${month}/${year}`;
                            }
                        }
                        newObj[key] = value;
                    }
                }
                return newObj;
            };
            return removeAndFormat(formatted);
        };

        // Helper function to render value for PDF (simple, no deep nesting to match frontend)
        const renderValueForPDF = (value) => {
            if (value === null || value === undefined) return 'N/A';
            if (typeof value === 'object') {
                if (Array.isArray(value)) {
                    return value.length === 0 ? 'None' : value.join('; ');
                }
                // For objects, render as key: value pairs
                const entries = Object.entries(value).filter(([key]) => !key.startsWith('$') && !key.startsWith('__') && key !== '_id' && key !== '__v');
                if (entries.length === 0) return 'N/A';
                return entries.map(([key, val]) => `${key}: ${renderValueForPDF(val)}`).join(', ');
            }
            return String(value);
        };

        // Helper function to add sections
        const addSection = (title, items) => {
            if (items && items.length > 0) {
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(title, 20, yPosition);
                yPosition += 12;

                doc.setFontSize(10);
                items.forEach((item, index) => {
                    if (yPosition > pageHeight - 40) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    const formattedItem = formatItemForPDF(item);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${index + 1}.`, 20, yPosition);
                    yPosition += 10;

                    doc.setFont('helvetica', 'normal');
                    Object.keys(formattedItem).forEach(key => {
                        const value = formattedItem[key];
                        if (yPosition > pageHeight - 20) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        doc.setFont('helvetica', 'bold');
                        doc.text(`${key}:`, 30, yPosition);
                        doc.setFont('helvetica', 'normal');
                        const valueText = renderValueForPDF(value);
                        const lines = doc.splitTextToSize(valueText, pageWidth - 80);
                        lines.forEach(line => {
                            if (yPosition > pageHeight - 20) {
                                doc.addPage();
                                yPosition = 20;
                            }
                            doc.text(line, 80, yPosition);
                            yPosition += 8;
                        });
                    });
                    yPosition += 10;
                });
                yPosition += 10;
            }
        };

        // Add sections for each activity type
        addSection('Faculty Development Programs', facultyData.facultyDevelopmentPrograms);
        addSection('Workshops', facultyData.workshops);
        addSection('Seminars', facultyData.seminars);
        addSection('Industry Know How', facultyData.industryKnowHow);
        addSection('Fellowships', facultyData.fellowships);
        addSection('Guest Lectures', facultyData.guestLectures);
        addSection('Publications', facultyData.publications);
        addSection('Patents', facultyData.patents);
        addSection('Project Proposals', facultyData.projectProposals);
        addSection('Funding Received', facultyData.fundingReceived);
        addSection('PhD Degrees', facultyData.phdDegrees);

        // Set response headers
        const filename = `${user.name.replace(/\s+/g, '_')}_Profile.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Send PDF
        res.send(Buffer.from(doc.output('arraybuffer')));
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get department statistics (Admin only)
const getDepartmentStats = async (req, res) => {
    try {
        const { deptCode } = req.params;
        const departmentMap = {
            CSE: 'Computer Science & Engineering',
            IT: 'Information Technology',
            AIDS: 'Artificial Intelligence & Data Science',
            MECH: 'Mechanical Engineering',
            CIVIL: 'Civil Engineering',
            EEE: 'Electrical & Electronics Engineering',
            ECE: 'Electronics & Communication Engineering',
        };
        const fullDeptName = departmentMap[deptCode.toUpperCase()] || deptCode;
        const normalizedFull = fullDeptName.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
        const normalizedCode = deptCode.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');

        // Count total faculties from User model
        const allUsers = await User.find({ role: 'faculty' }, 'department');
        const totalFaculties = allUsers.filter(user => {
            const dept = user.department || '';
            const normalizedDept = dept.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
            return normalizedDept === normalizedFull || normalizedDept === normalizedCode;
        }).length;

        // Count stats from FacultyData
        const facultyData = await FacultyData.find().populate('user', 'department');
        const filtered = facultyData.filter(facultyItem => {
            const dept = facultyItem.user?.department || '';
            const normalizedDept = dept.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
            return normalizedDept === normalizedFull || normalizedDept === normalizedCode;
        });

        let totalPublications = 0;
        let totalPatents = 0;
        let totalProjectProposals = 0;

        filtered.forEach(faculty => {
            totalPublications += faculty.publications ? faculty.publications.length : 0;
            totalPatents += faculty.patents ? faculty.patents.length : 0;
            totalProjectProposals += faculty.projectProposals ? faculty.projectProposals.length : 0;
        });

        res.status(200).json({
            totalFaculties,
            totalPublications,
            totalPatents,
            totalProjectProposals
        });
    } catch (error) {
        console.error('Error fetching department stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const downloadFacultyEventsPDF = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const user = await User.findOne({ facultyId, role: 'faculty' });
        if (!user) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        const facultyData = await FacultyData.findOne({ user: user._id });
        if (!facultyData) {
            return res.status(404).json({ message: 'Faculty data not found' });
        }

        // Create PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Faculty Events', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;

        // Profile Picture (if available)
        if (user.profilePicture) {
            try {
                const imagePath = path.join(__dirname, '../uploads', path.basename(user.profilePicture));
                if (fs.existsSync(imagePath)) {
                    const imageBuffer = fs.readFileSync(imagePath);
                    const imageBase64 = imageBuffer.toString('base64');
                    doc.addImage(`data:image/jpeg;base64,${imageBase64}`, 'JPEG', 20, yPosition, 50, 50);
                    yPosition += 60;
                } else {
                    doc.setFontSize(12);
                    doc.text('Profile Picture: Not found', 20, yPosition);
                    yPosition += 10;
                }
            } catch (error) {
                console.error('Error adding profile picture:', error);
                doc.setFontSize(12);
                doc.text('Profile Picture: Error loading', 20, yPosition);
                yPosition += 10;
            }
        }

        // Basic Information
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Basic Information', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const formatDate = (date) => {
            if (!date) return 'N/A';
            const d = new Date(date);
            if (isNaN(d.getTime())) return 'N/A';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const basicInfo = [
            { label: 'Name:', value: user.name },
            { label: 'Faculty ID:', value: user.facultyId },
            { label: 'Designation:', value: user.designation || 'N/A' },
            { label: 'Email:', value: user.email || 'N/A' },
            { label: 'Phone:', value: user.phone || 'N/A' },
            { label: 'Department:', value: user.department || 'N/A' },
            { label: 'Qualification:', value: user.qualification || 'N/A' },
            { label: 'Experience:', value: user.experience || 'N/A' },
            { label: 'Joining Date:', value: formatDate(user.joiningDate) },
            { label: 'Specialization:', value: user.specialization || 'N/A' },
            { label: 'Bio:', value: user.bio || 'N/A' }
        ];

        basicInfo.forEach(info => {
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.text(info.label, 20, yPosition);
            doc.setFont('helvetica', 'normal');
            doc.text(info.value, 80, yPosition);
            yPosition += 10;
        });

        yPosition += 10;

        // Helper function to format item for PDF (deep clone and remove internals)
        const formatItemForPDF = (item) => {
            const formatted = JSON.parse(JSON.stringify(item)); // Deep clone to remove Mongoose internals

            const removeAndFormat = (obj) => {
                if (typeof obj !== 'object' || obj === null) return obj;
                if (Array.isArray(obj)) {
                    return obj.map(removeAndFormat);
                }
                const newObj = {};
                for (const key in obj) {
                    if (!key.startsWith('$') && !key.startsWith('__') && key !== '_id' && key !== '__v' && key !== 'user') {
                        let value = obj[key];
                        if (typeof value === 'object' && value !== null) {
                            value = removeAndFormat(value);
                        } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                            // Format ISO date strings
                            const date = new Date(value);
                            if (!isNaN(date.getTime())) {
                                const day = String(date.getDate()).padStart(2, '0');
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const year = date.getFullYear();
                                value = `${day}/${month}/${year}`;
                            }
                        }
                        newObj[key] = value;
                    }
                }
                return newObj;
            };
            return removeAndFormat(formatted);
        };

        // Helper function to render value for PDF (simple, no deep nesting to match frontend)
        const renderValueForPDF = (value) => {
            if (value === null || value === undefined) return 'N/A';
            if (typeof value === 'object') {
                if (Array.isArray(value)) {
                    return value.length === 0 ? 'None' : value.join('; ');
                }
                // For objects, render as key: value pairs
                const entries = Object.entries(value).filter(([key]) => !key.startsWith('$') && !key.startsWith('__') && key !== '_id' && key !== '__v');
                if (entries.length === 0) return 'N/A';
                return entries.map(([key, val]) => `${key}: ${renderValueForPDF(val)}`).join(', ');
            }
            return String(value);
        };

        // Helper function to add sections
        const addSection = (title, items) => {
            if (items && items.length > 0) {
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(title, 20, yPosition);
                yPosition += 12;

                doc.setFontSize(10);
                items.forEach((item, index) => {
                    if (yPosition > pageHeight - 40) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    const formattedItem = formatItemForPDF(item);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${index + 1}.`, 20, yPosition);
                    yPosition += 10;

                    doc.setFont('helvetica', 'normal');
                    Object.keys(formattedItem).forEach(key => {
                        const value = formattedItem[key];
                        if (yPosition > pageHeight - 20) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        doc.setFont('helvetica', 'bold');
                        doc.text(`${key}:`, 30, yPosition);
                        doc.setFont('helvetica', 'normal');
                        const valueText = renderValueForPDF(value);
                        const lines = doc.splitTextToSize(valueText, pageWidth - 80);
                        lines.forEach(line => {
                            if (yPosition > pageHeight - 20) {
                                doc.addPage();
                                yPosition = 20;
                            }
                            doc.text(line, 80, yPosition);
                            yPosition += 8;
                        });
                    });
                    yPosition += 10;
                });
                yPosition += 10;
            }
        };

        // Activity Statistics Graph
        if (yPosition > pageHeight - 100) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Activity Statistics', 20, yPosition);
        yPosition += 15;

        // Count activities
        const activityCounts = {
            'Faculty Development Programs': facultyData.facultyDevelopmentPrograms?.length || 0,
            'Workshops': facultyData.workshops?.length || 0,
            'Seminars': facultyData.seminars?.length || 0,
            'Industry Know How': facultyData.industryKnowHow?.length || 0,
            'Fellowships': facultyData.fellowships?.length || 0,
            'Guest Lectures': facultyData.guestLectures?.length || 0,
            'Publications': facultyData.publications?.length || 0,
            'Patents': facultyData.patents?.length || 0,
            'Project Proposals': facultyData.projectProposals?.length || 0,
            'Funding Received': facultyData.fundingReceived?.length || 0,
            'PhD Degrees': facultyData.phdDegrees?.length || 0,
        };

        const maxCount = Math.max(...Object.values(activityCounts));
        const chartHeight = 80;
        const chartWidth = pageWidth - 40;
        const barWidth = chartWidth / Object.keys(activityCounts).length - 10;

        let xPos = 20;
        Object.entries(activityCounts).forEach(([activity, count]) => {
            const barHeight = maxCount > 0 ? (count / maxCount) * chartHeight : 0;

            // Draw bar
            doc.setFillColor(100, 150, 255);
            doc.rect(xPos, yPosition + chartHeight - barHeight, barWidth, barHeight, 'F');

            // Draw count text on bar
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            if (barHeight > 10) {
                doc.text(count.toString(), xPos + barWidth / 2, yPosition + chartHeight - barHeight + 8, { align: 'center' });
            }

            // Draw activity label
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(6);
            const labelLines = doc.splitTextToSize(activity, barWidth);
            let labelY = yPosition + chartHeight + 5;
            labelLines.forEach(line => {
                doc.text(line, xPos + barWidth / 2, labelY, { align: 'center' });
                labelY += 4;
            });

            xPos += barWidth + 10;
        });

        yPosition += chartHeight + 40;

        // Add sections for each activity type
        addSection('Faculty Development Programs', facultyData.facultyDevelopmentPrograms);
        addSection('Workshops', facultyData.workshops);
        addSection('Seminars', facultyData.seminars);
        addSection('Industry Know How', facultyData.industryKnowHow);
        addSection('Fellowships', facultyData.fellowships);
        addSection('Guest Lectures', facultyData.guestLectures);
        addSection('Publications', facultyData.publications);
        addSection('Patents', facultyData.patents);
        addSection('Project Proposals', facultyData.projectProposals);
        addSection('Funding Received', facultyData.fundingReceived);
        addSection('PhD Degrees', facultyData.phdDegrees);

        // Set response headers
        const filename = `${user.name.replace(/\s+/g, '_')}_Events.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Send PDF
        res.send(Buffer.from(doc.output('arraybuffer')));
    } catch (error) {
        console.error('Error generating events PDF:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Generate department event summary Excel (Admin only)
const generateDepartmentEventSummary = async (req, res) => {
    try {
        const { deptCode, eventType } = req.params;
        const departmentMap = {
            CSE: 'Computer Science & Engineering',
            IT: 'Information Technology',
            AIDS: 'Artificial Intelligence & Data Science',
            MECH: 'Mechanical Engineering',
            CIVIL: 'Civil Engineering',
            EEE: 'Electrical & Electronics Engineering',
            ECE: 'Electronics & Communication Engineering',
        };
        const fullDeptName = departmentMap[deptCode.toUpperCase()] || deptCode;
        const normalizedFull = fullDeptName.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
        const normalizedCode = deptCode.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');

        // Get all faculty data for the department
        const facultyData = await FacultyData.find().populate('user', 'name facultyId department');
        const filtered = facultyData.filter(facultyItem => {
            const dept = facultyItem.user?.department || '';
            const normalizedDept = dept.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
            return normalizedDept === normalizedFull || normalizedDept === normalizedCode;
        });

        // Map event types to their array names
        const eventTypeMap = {
            'faculty-development-programs': 'facultyDevelopmentPrograms',
            'workshops': 'workshops',
            'seminars': 'seminars',
            'industry-know-how': 'industryKnowHow',
            'fellowships': 'fellowships',
            'guest-lectures': 'guestLectures',
            'publications': 'publications',
            'patents': 'patents',
            'project-proposals': 'projectProposals',
            'funding-received': 'fundingReceived',
            'phd-degrees': 'phdDegrees',
        };

        const arrayName = eventTypeMap[eventType];
        if (!arrayName) {
            return res.status(400).json({ message: 'Invalid event type' });
        }

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${eventType.replace(/-/g, ' ').toUpperCase()} - ${deptCode.toUpperCase()}`);

        // Collect all events
        const allEvents = [];
        filtered.forEach(faculty => {
            const events = faculty[arrayName] || [];
            events.forEach(event => {
                allEvents.push({
                    facultyId: faculty.user.facultyId,
                    facultyName: faculty.user.name,
                    ...event.toObject(),
                });
            });
        });

        if (allEvents.length === 0) {
            // Add headers even if no data
            worksheet.columns = [
                { header: 'Faculty ID', key: 'facultyId', width: 15 },
                { header: 'Faculty Name', key: 'facultyName', width: 25 },
            ];
        } else {
            // Get all unique keys from events
            const allKeys = new Set();
            allEvents.forEach(event => {
                Object.keys(event).forEach(key => {
                    if (!key.startsWith('$') && !key.startsWith('__') && key !== '_id' && key !== '__v') {
                        allKeys.add(key);
                    }
                });
            });

            // Create columns
            const columns = [
                { header: 'Faculty ID', key: 'facultyId', width: 15 },
                { header: 'Faculty Name', key: 'facultyName', width: 25 },
            ];

            Array.from(allKeys).forEach(key => {
                if (key !== 'facultyId' && key !== 'facultyName') {
                    columns.push({ header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'), key, width: 20 });
                }
            });

            worksheet.columns = columns;

            // Add data rows
            allEvents.forEach(event => {
                const row = {};
                columns.forEach(col => {
                    const value = event[col.key];
                    if (value instanceof Date) {
                        row[col.key] = value.toISOString().split('T')[0]; // Format date
                    } else if (Array.isArray(value)) {
                        row[col.key] = value.join('; ');
                    } else if (typeof value === 'object' && value !== null) {
                        row[col.key] = JSON.stringify(value);
                    } else {
                        row[col.key] = value || '';
                    }
                });
                worksheet.addRow(row);
            });
        }

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6FA' }
        };

        // Set response headers
        const filename = `${deptCode.toUpperCase()}_${eventType.replace(/-/g, '_')}_Summary.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Send Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        res.send(buffer);
    } catch (error) {
        console.error('Error generating department event summary:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDepartmentEventsSummary = async (req, res) => {
    try {
        const departments = [
            { code: 'CSE', name: 'Computer Science & Engineering' },
            { code: 'IT', name: 'Information Technology' },
            { code: 'AIDS', name: 'Artificial Intelligence & Data Science' },
            { code: 'MECH', name: 'Mechanical Engineering' },
            { code: 'CIVIL', name: 'Civil Engineering' },
            { code: 'EEE', name: 'Electrical & Electronics Engineering' },
            { code: 'ECE', name: 'Electronics & Communication Engineering' },
        ];

        const summary = [];

        for (const dept of departments) {
            const normalizedFull = dept.name.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
            const normalizedCode = dept.code.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');

            const facultyData = await FacultyData.find().populate('user', 'department');
            const filtered = facultyData.filter(facultyItem => {
                const deptName = facultyItem.user?.department || '';
                const normalizedDept = deptName.toLowerCase().replace(/\s/g, '').replace(/&/g, 'and');
                return normalizedDept === normalizedFull || normalizedDept === normalizedCode;
            });

            let publications = 0;
            let patents = 0;
            let projectProposals = 0;
            let workshops = 0;
            let seminars = 0;
            let facultyDevelopmentPrograms = 0;
            let industryKnowHow = 0;
            let fellowships = 0;
            let guestLectures = 0;
            let phdDegrees = 0;

            filtered.forEach(faculty => {
                publications += (faculty.publications?.length || 0);
                patents += (faculty.patents?.length || 0);
                projectProposals += (faculty.projectProposals?.length || 0);
                workshops += (faculty.workshops?.length || 0);
                seminars += (faculty.seminars?.length || 0);
                facultyDevelopmentPrograms += (faculty.facultyDevelopmentPrograms?.length || 0);
                industryKnowHow += (faculty.industryKnowHow?.length || 0);
                fellowships += (faculty.fellowships?.length || 0);
                guestLectures += (faculty.guestLectures?.length || 0);
                phdDegrees += (faculty.phdDegrees?.length || 0);
            });

            summary.push({
                department: dept.name,
                publications,
                patents,
                projectProposals,
                workshops,
                seminars,
                facultyDevelopmentPrograms,
                industryKnowHow,
                fellowships,
                guestLectures,
                phdDegrees,
            });
        }

        res.status(200).json(summary);
    } catch (error) {
        console.error('Error fetching department events summary:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getPublicFaculty, getPublicFacultyProfile, downloadFacultyProfilePDF, downloadFacultyEventsPDF, getAllFaculty, getTotalFaculties, getTotalPublications, searchFaculty, searchFacultyAdvanced, getMe, updateMe, updateProfile, uploadProfilePicture, getEvents, deleteFaculty, getInactiveFaculty, notifyFaculty, getMyNotifications, getDepartmentStats, generateDepartmentEventSummary, getDepartmentEventsSummary };
