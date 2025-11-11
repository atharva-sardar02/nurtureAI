const admin = require('firebase-admin');

admin.initializeApp();

// Export v2 functions directly
// Using direct require - Firebase will handle lazy loading
exports.processInsuranceCard = require('./processInsuranceCard').processInsuranceCard;

// Placeholder for future Cloud Functions
// Functions to be added in later PRs:
// - calculateCostEstimate
// - sendAppointmentReminder
// - generateEmbeddings
// - performRAGSearch

