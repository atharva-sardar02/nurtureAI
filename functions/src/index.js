const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Placeholder for future Cloud Functions
// Functions will be added in later PRs:
// - processInsuranceCard (OCR)
// - calculateCostEstimate
// - sendAppointmentReminder
// - generateEmbeddings
// - performRAGSearch

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.json({ message: 'NurtureAI Cloud Functions initialized' });
});

