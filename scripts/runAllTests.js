/**
 * Comprehensive Test Runner
 * Runs all unit, integration, and component tests
 */

import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTestFile(filePath, category) {
  try {
    log(`\n  Running: ${filePath}`, 'cyan');
    const output = execSync(`node ${filePath}`, { 
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    // Count passed/failed from output
    const passedMatch = output.match(/(\d+)\s+passed/);
    const failedMatch = output.match(/(\d+)\s+failed/);
    
    if (passedMatch) totalTests += parseInt(passedMatch[1]);
    if (failedMatch) {
      const failed = parseInt(failedMatch[1]);
      failedTests += failed;
      totalTests += failed;
    } else {
      // If no failures mentioned, assume all passed
      if (passedMatch) passedTests += parseInt(passedMatch[1]);
    }
    
    testResults.push({ file: filePath, category, status: 'passed', output });
    log(`  ✅ Passed`, 'green');
    return true;
  } catch (error) {
    failedTests++;
    totalTests++;
    testResults.push({ 
      file: filePath, 
      category, 
      status: 'failed', 
      error: error.message,
      output: error.stdout || error.stderr || ''
    });
    log(`  ❌ Failed: ${error.message}`, 'red');
    return false;
  }
}

function getAllTestFiles(dir, category) {
  const files = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isFile() && entry.endsWith('.test.js')) {
        files.push({ path: fullPath, category });
      } else if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        files.push(...getAllTestFiles(fullPath, category));
      }
    }
  } catch (error) {
    // Directory doesn't exist, skip
  }
  return files;
}

async function runAllTests() {
  log('\n' + '='.repeat(70), 'blue');
  log('🧪 NurtureAI Test Suite Runner', 'blue');
  log('='.repeat(70), 'blue');
  
  const testFiles = [
    ...getAllTestFiles('tests/unit', 'unit'),
    ...getAllTestFiles('tests/integration', 'integration'),
  ];
  
  log(`\n📋 Found ${testFiles.length} test files\n`, 'cyan');
  
  // Group by category
  const unitTests = testFiles.filter(f => f.category === 'unit');
  const integrationTests = testFiles.filter(f => f.category === 'integration');
  
  // Run unit tests
  if (unitTests.length > 0) {
    log('\n📦 Unit Tests', 'yellow');
    log('-'.repeat(70), 'yellow');
    unitTests.forEach(({ path, category }) => {
      runTestFile(path, category);
    });
  }
  
  // Run integration tests
  if (integrationTests.length > 0) {
    log('\n🔗 Integration Tests', 'yellow');
    log('-'.repeat(70), 'yellow');
    integrationTests.forEach(({ path, category }) => {
      runTestFile(path, category);
    });
  }
  
  // Summary
  log('\n' + '='.repeat(70), 'blue');
  log('📊 Test Summary', 'blue');
  log('='.repeat(70), 'blue');
  log(`\nTotal Tests: ${totalTests}`, 'cyan');
  log(`✅ Passed: ${passedTests}`, 'green');
  log(`❌ Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  
  if (failedTests > 0) {
    log('\n❌ Failed Tests:', 'red');
    testResults
      .filter(r => r.status === 'failed')
      .forEach(r => {
        log(`  - ${r.file}`, 'red');
        if (r.error) {
          log(`    Error: ${r.error}`, 'red');
        }
      });
  }
  
  const coverage = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  log(`\n📈 Coverage: ${coverage}%`, coverage >= 80 ? 'green' : 'yellow');
  
  log('\n' + '='.repeat(70), 'blue');
  
  if (failedTests === 0) {
    log('✅ All tests passed!', 'green');
    process.exit(0);
  } else {
    log('❌ Some tests failed', 'red');
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

runAllTests().catch((error) => {
  log(`\n❌ Test runner error: ${error.message}`, 'red');
  process.exit(1);
});

