const admin = require('firebase-admin');

admin.initializeApp();

// Import and export v2 functions directly
exports.processInsuranceCard = require('./processInsuranceCard').processInsuranceCard;

// Placeholder for future Cloud Functions
// Functions to be added in later PRs:
// - calculateCostEstimate
// - sendAppointmentReminder
// - generateEmbeddings
// - performRAGSearch

