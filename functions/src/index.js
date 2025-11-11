const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();

// Import and export functions
exports.processInsuranceCard = require('./processInsuranceCard').processInsuranceCard;

// Placeholder for future Cloud Functions
// Functions to be added in later PRs:
// - calculateCostEstimate
// - sendAppointmentReminder
// - generateEmbeddings
// - performRAGSearch

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.json({ message: 'NurtureAI Cloud Functions initialized' });
});

