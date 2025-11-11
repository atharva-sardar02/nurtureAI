/**
 * Generate Kinship Mapping Documentation
 * Creates a mapping file/documentation for kinship codes
 * 
 * This script can be used to:
 * - Generate documentation about kinship mappings
 * - Export mapping to JSON for use in other systems
 * - Validate kinship codes in CSV files
 */

import { getAllKinshipMappings, getKinshipLabel, getKinshipCode } from '../src/utils/kinshipMapping.js';
import { parseCSV, getCSVPath } from './importCSV.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate kinship mapping documentation
 */
export function generateKinshipMappingDoc() {
  const mappings = getAllKinshipMappings();
  
  const doc = {
    description: 'Kinship Code to Label Mapping',
    version: '1.0',
    mappings: Object.entries(mappings).map(([code, label]) => ({
      code: parseInt(code, 10),
      label,
      description: getKinshipDescription(label),
    })),
    usage: {
      codeToLabel: 'Use getKinshipLabel(code) to convert code to label',
      labelToCode: 'Use getKinshipCode(label) to convert label to code',
    },
  };
  
  return doc;
}

/**
 * Get description for kinship label
 */
function getKinshipDescription(label) {
  const descriptions = {
    mother: 'Biological or adoptive mother',
    father: 'Biological or adoptive father',
    other: 'Other relationship type',
    guardian: 'Legal guardian or caregiver',
  };
  return descriptions[label] || 'Unknown relationship type';
}

/**
 * Validate kinship codes in CSV file
 */
export async function validateKinshipCodesInCSV() {
  try {
    const csvPath = getCSVPath('kinships.csv');
    const data = await parseCSV(csvPath);
    
    const validCodes = [1, 2, 12, 2051];
    const issues = [];
    const codeCounts = {};
    
    data.forEach((row, index) => {
      const user0Label = parseInt(row.user0Label || row.user_0_label, 10);
      const user1Label = parseInt(row.user1Label || row.user_1_label, 10);
      
      if (user0Label && !validCodes.includes(user0Label)) {
        issues.push({
          row: index + 1,
          field: 'user0Label',
          code: user0Label,
          issue: `Invalid kinship code: ${user0Label}`,
        });
      }
      
      if (user1Label && !validCodes.includes(user1Label)) {
        issues.push({
          row: index + 1,
          field: 'user1Label',
          code: user1Label,
          issue: `Invalid kinship code: ${user1Label}`,
        });
      }
      
      // Count codes
      if (user0Label) {
        codeCounts[user0Label] = (codeCounts[user0Label] || 0) + 1;
      }
      if (user1Label) {
        codeCounts[user1Label] = (codeCounts[user1Label] || 0) + 1;
      }
    });
    
    return {
      totalRows: data.length,
      issues,
      codeCounts,
      isValid: issues.length === 0,
    };
  } catch (error) {
    return {
      error: error.message,
      isValid: false,
    };
  }
}

/**
 * Export mapping to JSON file
 */
export async function exportMappingToJSON(outputPath) {
  const doc = generateKinshipMappingDoc();
  const json = JSON.stringify(doc, null, 2);
  
  if (outputPath) {
    fs.writeFileSync(outputPath, json, 'utf8');
    console.log(`✅ Kinship mapping exported to ${outputPath}`);
  }
  
  return json;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'validate') {
    console.log('🔍 Validating kinship codes in CSV...\n');
    const result = await validateKinshipCodesInCSV();
    
    if (result.error) {
      console.error('❌ Error:', result.error);
      process.exit(1);
    }
    
    console.log(`📊 Total rows: ${result.totalRows}`);
    console.log(`📊 Code distribution:`, result.codeCounts);
    
    if (result.issues.length > 0) {
      console.log(`\n⚠️  Found ${result.issues.length} issues:`);
      result.issues.slice(0, 10).forEach(issue => {
        console.log(`   Row ${issue.row}: ${issue.issue}`);
      });
      if (result.issues.length > 10) {
        console.log(`   ... and ${result.issues.length - 10} more`);
      }
    } else {
      console.log('\n✅ All kinship codes are valid!');
    }
    
    process.exit(result.isValid ? 0 : 1);
  } else if (command === 'export') {
    const outputPath = args[1] || path.join(__dirname, '..', 'docs', 'kinship-mapping.json');
    await exportMappingToJSON(outputPath);
    process.exit(0);
  } else {
    console.log('Kinship Mapping Generator\n');
    console.log('Usage:');
    console.log('  node scripts/generateKinshipMapping.js validate  - Validate codes in CSV');
    console.log('  node scripts/generateKinshipMapping.js export    - Export mapping to JSON');
    process.exit(0);
  }
}

// Run if called directly
if (process.argv[1]?.includes('generateKinshipMapping.js')) {
  main().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export default {
  generateKinshipMappingDoc,
  validateKinshipCodesInCSV,
  exportMappingToJSON,
};

