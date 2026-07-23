// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        facultyId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
        },
        address: {
            type: String,
        },
        department: {
            type: String,
        },
        designation: {
            type: String,
        },
        qualification: {
            type: String,
        },
        experience: {
            type: String,
        },
        joiningDate: {
            type: Date,
        },
        specialization: {
            type: String,
        },
        bio: {
            type: String,
        },
        profilePicture: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'faculty'],
            required: true,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
    }
);

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook removed, hashing done explicitly in routes

const User = mongoose.model('User', userSchema);

module.exports = User;
