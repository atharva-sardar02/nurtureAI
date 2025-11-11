# Data Mapping Documentation

This document provides detailed information about code-to-label mappings used in the NurtureAI application.

## Questionnaire Type Mapping

### Overview
Questionnaire types are stored as numeric codes in CSV files and transformed to standardized codes with metadata during import.

### Mapping Table

| Code | Standardized Code | Label | Scored | Risk Screen |
|------|------------------|-------|--------|-------------|
| 1 | `PHQ_A` | PHQ-A | ✅ | ✅ |
| 2 | `GAD_7` | GAD-7 | ✅ | ✅ |
| 3 | `PSC_17` | PSC-17 | ✅ | ✅ |
| 4 | `SDQ` | SDQ | ✅ | ✅ |
| Other/Unknown | `OTHER` | Other (read-only) | ❌ | ❌ |

### Data Structure
After transformation, questionnaire documents in Firestore contain:
```javascript
{
  type: "PSC_17",           // Standardized code
  typeCode: 3,              // Original numeric code
  typeLabel: "PSC-17",      // Human-readable label
  typeMetadata: {
    scored: true,           // Whether questionnaire has scoring
    riskScreen: true        // Whether used for risk screening
  }
}
```

### Usage in UI
- Use `typeLabel` for display (e.g., "PHQ-A", "GAD-7")
- Use `typeMetadata.scored` to determine if score should be displayed
- Use `typeMetadata.riskScreen` to determine if questionnaire is used for risk assessment

### Utility Functions
Located in `src/utils/questionnaireMapping.js`:
- `getQuestionnaireType(code)` - Get full type object from code
- `getQuestionnaireCode(labelOrCode)` - Get numeric code from label
- `transformQuestionnaireData(data)` - Transform raw CSV data

---

## Kinship Code Mapping

### Overview
Kinship relationships are stored as numeric codes in CSV files and transformed to objects with consent eligibility flags during import.

### Mapping Table

| Code | Label | Consent Eligible | Notes |
|------|-------|------------------|-------|
| 1 | mother | ✅ | Biological or adoptive mother |
| 2 | father | ✅ | Biological or adoptive father |
| 3 | legalGuardian | ✅ | Legal guardian (important for school referrals) |
| 4 | otherCaregiver | ❌ | Other caregiver/relative (can be overridden) |
| 12 | other | ❌ | Legacy code (maps to otherCaregiver) |
| 2051 | guardian | ✅ | Legacy code (maps to legalGuardian) |

### Data Structure
After transformation, kinship documents in Firestore contain:
```javascript
{
  user0Kinship: {
    code: 1,
    label: "mother",
    consentEligible: true
  },
  user1Kinship: {
    code: 3,
    label: "legalGuardian",
    consentEligible: true
  }
}
```

### Consent Eligibility Rules
- **Mother (1)**: Always eligible for consent
- **Father (2)**: Always eligible for consent
- **Legal Guardian (3)**: Always eligible for consent (important for school referrals)
- **Other Caregiver (4)**: Not eligible by default, but can be overridden if legal guardianship is provided

### UI Behavior
For "otherCaregiver" relationships:
- Show checkbox: "I also hold legal guardianship"
- If checked:
  - Set `consentEligible: true`
  - Store `guardianProof: "provided"` in onboarding application
- If unchecked:
  - Keep `consentEligible: false`
  - Store `guardianProof: "not_provided"`

### Usage in Onboarding
The `onboardingApplications` collection stores:
```javascript
{
  kinship: {
    code: 4,
    label: "otherCaregiver",
    consentEligible: false  // Can be overridden to true
  },
  guardianProof: "provided"  // Optional, only for otherCaregiver
}
```

### Utility Functions
Located in `src/utils/kinshipMapping.js`:
- `getKinshipLabel(code)` - Get label from code
- `getKinshipMapping(code)` - Get full mapping object with consent eligibility
- `getKinshipCode(label)` - Get code from label
- `transformKinshipData(data)` - Transform raw CSV data

---

## Implementation Notes

### Data Import
Both mappings are applied during CSV import via:
- `scripts/seedDatabase.js` - Main import script
- `src/utils/questionnaireMapping.js` - Questionnaire transformation
- `src/utils/kinshipMapping.js` - Kinship transformation

### Validation
Validation scripts check:
- Questionnaire types are valid standardized codes (`PHQ_A`, `GAD_7`, `PSC_17`, `SDQ`, `OTHER`)
- Kinship codes are valid (1, 2, 3, 4, 12, 2051)
- Consent eligibility flags are properly set

Run validation with:
```bash
npm run validate:data
```

### Backward Compatibility
- Legacy kinship codes (12, 2051) are supported
- Questionnaire types can be queried by either `type` (standardized) or `typeCode` (original)
- Both camelCase and snake_case field names are supported during import

---

## References

- PRD Section 13, Q11: Patient-Guardian Relationships
- PRD Section 13, Q12: Questionnaire Display
- `nurtureai-prd.md` - Full product requirements
- `docs/DATA_QUALITY_REPORT.md` - Data quality issues and resolutions

