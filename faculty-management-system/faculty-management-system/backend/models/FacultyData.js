// backend/models/FacultyData.js
const mongoose = require('mongoose');

// Define sub-schemas for different data types
const activitySchema = new mongoose.Schema({
    title: String,
    venue: String,
    numberOfDays: Number,
    date: Date,
    organizedBy: String,
    mode: String,
});

const publicationSchema = new mongoose.Schema({
    title: String,
    authorDetails: String,
    volumeNumber: String,
    issueNumber: String,
    year: Number,
    doi: String,
    journal: String,
    type: String, // e.g., National, International
});

const patentSchema = new mongoose.Schema({
    title: String,
    year: Number,
    author: String,
    type: String,
});

const projectSchema = new mongoose.Schema({
    title: String,
    pi: String,
    coPi: String,
    fundingAgency: String,
    appliedDate: Date,
    amount: String,
    status: String,
});

const fundingSchema = new mongoose.Schema({
    title: String,
    pi: String,
    coPi: String,
    fundingAgency: String,
    appliedDate: Date,
    amount: String,
});

const phdSchema = new mongoose.Schema({
    titleOfThesis: String,
    enrollNumber: String,
    supervisorName: String,
    vivaDate: Date,
});

const facultyDataSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    facultyDevelopmentPrograms: [activitySchema],
    workshops: [activitySchema],
    seminars: [activitySchema],
    industryKnowHow: [activitySchema],
    fellowships: [activitySchema],
    guestLectures: [activitySchema],
    publications: [publicationSchema],
    patents: [patentSchema],
    projectProposals: [projectSchema],
    fundingReceived: [fundingSchema],
    phdDegrees: [phdSchema],
});

const FacultyData = mongoose.model('FacultyData', facultyDataSchema);
module.exports = FacultyData;