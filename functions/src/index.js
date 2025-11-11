const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Import function modules
const { processInsuranceCard } = require('./processInsuranceCard');

// Export functions
exports.processInsuranceCard = processInsuranceCard.processInsuranceCard;

// Placeholder for future Cloud Functions
// Functions to be added in later PRs:
// - calculateCostEstimate
// - sendAppointmentReminder
// - generateEmbeddings
// - performRAGSearch

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.json({ message: 'NurtureAI Cloud Functions initialized' });
});

