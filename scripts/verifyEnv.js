/**
 * Environment Variables Verification Script
 * Checks that all required environment variables are set
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Required environment variables
const REQUIRED_VARS = {
  // Firebase
  VITE_FIREBASE_API_KEY: 'Firebase API Key',
  VITE_FIREBASE_AUTH_DOMAIN: 'Firebase Auth Domain',
  VITE_FIREBASE_PROJECT_ID: 'Firebase Project ID',
  VITE_FIREBASE_STORAGE_BUCKET: 'Firebase Storage Bucket',
  VITE_FIREBASE_MESSAGING_SENDER_ID: 'Firebase Messaging Sender ID',
  VITE_FIREBASE_APP_ID: 'Firebase App ID',
  
  // OpenAI
  VITE_OPENAI_API_KEY: 'OpenAI API Key',
  
  // Optional (for RAG - PR #7)
  VITE_PINECONE_API_KEY: 'Pinecone API Key (optional)',
  VITE_PINECONE_ENVIRONMENT: 'Pinecone Environment (optional)',
  VITE_PINECONE_INDEX_NAME: 'Pinecone Index Name (optional)',
};

function checkEnvFile() {
  console.log('🔍 Checking .env file...\n');
  
  const envPath = resolve(__dirname, '..', '.env');
  
  if (!existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('💡 Create a .env file in the project root with your credentials.');
    return false;
  }
  
  console.log('✅ .env file exists\n');
  
  // Read .env file
  const envContent = readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  const envVars = {};
  
  for (const line of envLines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
  
  // Check required variables
  let allPresent = true;
  const missing = [];
  const present = [];
  const optional = [];
  
  for (const [varName, description] of Object.entries(REQUIRED_VARS)) {
    const value = envVars[varName];
    const isOptional = varName.includes('PINECONE') || varName.includes('GOOGLE');
    
    if (!value || value === '' || value.includes('your_') || value.includes('YOUR_')) {
      if (isOptional) {
        optional.push({ varName, description });
      } else {
        missing.push({ varName, description });
        allPresent = false;
      }
    } else {
      // Mask sensitive values for display
      const masked = value.length > 10 
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : '***';
      present.push({ varName, description, masked });
    }
  }
  
  // Display results
  console.log('📋 Environment Variables Status:\n');
  
  if (present.length > 0) {
    console.log('✅ Required Variables Set:');
    present.forEach(({ varName, description, masked }) => {
      console.log(`   ✓ ${varName} (${description}): ${masked}`);
    });
    console.log('');
  }
  
  if (optional.length > 0) {
    console.log('⚠️  Optional Variables (not set):');
    optional.forEach(({ varName, description }) => {
      console.log(`   ○ ${varName} (${description})`);
    });
    console.log('');
  }
  
  if (missing.length > 0) {
    console.log('❌ Missing Required Variables:');
    missing.forEach(({ varName, description }) => {
      console.log(`   ✗ ${varName} (${description})`);
    });
    console.log('');
    allPresent = false;
  }
  
  return allPresent;
}

function verifyFirebaseConfig() {
  console.log('🔍 Verifying Firebase Configuration...\n');
  
  try {
    // Try to import Firebase config
    // Note: This will only work if environment variables are loaded
    // In Vite, env vars are loaded at build time, not runtime in Node.js
    console.log('⚠️  Firebase config verification requires Vite dev server');
    console.log('   Run "npm run dev" to test Firebase initialization\n');
    return true;
  } catch (error) {
    console.error('❌ Firebase config error:', error.message);
    return false;
  }
}

function verifyOpenAIConfig() {
  console.log('🔍 Verifying OpenAI Configuration...\n');
  
  try {
    // Check if OpenAI service can be imported
    const openaiPath = resolve(__dirname, '..', 'src', 'services', 'ai', 'openai.js');
    if (existsSync(openaiPath)) {
      console.log('✅ OpenAI service file exists');
      console.log('⚠️  OpenAI API key verification requires actual API call');
      console.log('   Test in browser after starting dev server\n');
      return true;
    } else {
      console.error('❌ OpenAI service file not found');
      return false;
    }
  } catch (error) {
    console.error('❌ OpenAI config error:', error.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🔐 Environment Variables Verification');
  console.log('='.repeat(60));
  console.log('');
  
  const envOk = checkEnvFile();
  const firebaseOk = verifyFirebaseConfig();
  const openaiOk = verifyOpenAIConfig();
  
  console.log('='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));
  
  if (envOk && firebaseOk && openaiOk) {
    console.log('✅ All required environment variables are set!');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Test Firebase connection in browser console');
    console.log('   3. Test OpenAI API by sending a chat message');
    console.log('   4. Check browser console for any errors');
    console.log('');
    console.log('⚠️  Note: Vite loads environment variables at server startup');
    console.log('   Restart dev server after changing .env file');
    process.exit(0);
  } else {
    console.log('❌ Some configuration issues found');
    console.log('');
    console.log('💡 Fix the issues above and run this script again');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Verification error:', error);
  process.exit(1);
});

