# Known Issues & Limitations

This document tracks current known issues, limitations, and workarounds in the NurtureAI application.

---

## Current Issues

### High Priority

**None** - All critical issues have been resolved.

### Medium Priority

#### 1. OCR Accuracy (60-80%)
**Issue:** Insurance card OCR extraction has variable accuracy (60-80% success rate).

**Impact:** Users may need to manually correct extracted data.

**Workaround:** 
- Manual entry option always available
- Users can review and edit extracted data before submission
- Confidence scores displayed to guide user decisions

**Status:** Expected behavior - OCR is inherently imperfect. Manual fallback is the standard approach.

#### 2. Firebase Emulator Not Fully Configured
**Issue:** Security rules tests use structure validation rather than full emulator testing.

**Impact:** Some edge cases in security rules may not be caught until production.

**Workaround:**
- Manual testing in development environment
- Review security rules carefully before deployment
- Test with real Firebase project before production

**Status:** Future enhancement - Full emulator setup planned for PR #18.

#### 3. Component Tests Not Implemented
**Issue:** React component tests are not implemented (marked as optional).

**Impact:** Component behavior is tested manually and via integration tests.

**Workaround:**
- Manual testing for UI components
- Integration tests cover component functionality
- React Testing Library setup deferred

**Status:** Optional - Manual testing and integration tests provide adequate coverage for MVP.

### Low Priority

#### 4. E2E Tests Not Implemented
**Issue:** End-to-end tests using Playwright/Cypress are not set up.

**Impact:** Complete user journeys are tested manually.

**Workaround:**
- Manual E2E testing for critical flows
- Integration tests cover service interactions
- Can be added in future PRs

**Status:** Optional - Manual E2E testing sufficient for MVP.

#### 5. RAG Functionality Not Implemented
**Issue:** RAG (Retrieval-Augmented Generation) enhancement is deferred (PR #7).

**Impact:** AI chat uses base GPT-4 without knowledge base context.

**Workaround:**
- Base GPT-4 provides good responses
- RAG can be added later without breaking changes
- System prompts provide context

**Status:** Deferred - PR #7 marked for later implementation.

---

## Limitations

### Technical Limitations

1. **Vite Environment Variables**
   - Must use `VITE_` prefix
   - Only read at server startup
   - Require dev server restart after changes

2. **Firebase Functions**
   - Cold start latency (first invocation)
   - 60-second timeout for onCall functions
   - Node.js 20 runtime required

3. **Firestore Queries**
   - Complex queries require composite indexes
   - Index creation can take 10+ minutes
   - Some queries may be slow without proper indexes

4. **OpenAI API**
   - Rate limits apply
   - Costs per token
   - No built-in caching (can be added)

5. **Google Cloud Vision API**
   - Pay-per-use pricing
   - Requires billing enabled
   - API quota limits

### Feature Limitations

1. **No Email Notifications**
   - Appointment reminders not implemented
   - Password reset emails work (Firebase default)
   - Custom email templates not implemented

2. **No SMS Notifications**
   - SMS reminders not implemented
   - Can be added via Twilio or similar service

3. **Limited Admin Dashboard**
   - Support dashboard is basic
   - No analytics dashboard
   - No user management UI

4. **No Mobile App**
   - Web-only application
   - Responsive design for mobile browsers
   - No native iOS/Android apps

5. **No Offline Support**
   - Requires internet connection
   - No service worker for offline caching
   - No PWA features

---

## Browser Compatibility

### Supported Browsers

- **Chrome/Edge**: Latest 2 versions ✅
- **Firefox**: Latest 2 versions ✅
- **Safari**: Latest 2 versions ✅
- **Mobile Browsers**: iOS Safari, Chrome Mobile ✅

### Known Browser Issues

**None** - Application tested and working on all supported browsers.

---

## Performance Considerations

### Current Performance

- **Initial Load**: ~2-3 seconds (with code splitting)
- **Page Navigation**: < 500ms
- **API Response Times**: 
  - OpenAI: 2-5 seconds
  - Firestore: < 200ms
  - Vision API: 3-8 seconds

### Optimization Opportunities

1. **Code Splitting**: Can be enhanced for better initial load
2. **Caching**: OpenAI responses could be cached
3. **Image Optimization**: Insurance card images could be compressed
4. **Lazy Loading**: More components could be lazy-loaded

---

## Data Limitations

### Test Data

- **CSV Data**: Uses anonymized test data
- **No Real Patient Data**: All data is synthetic
- **Limited Dataset**: 16 CSV files with sample data

### Production Considerations

- **Data Migration**: Real data import process not documented
- **Data Validation**: Additional validation may be needed for production
- **Data Retention**: 90-day conversation retention enforced

---

## Security Considerations

### Current Security

- ✅ Firestore security rules implemented
- ✅ Storage security rules implemented
- ✅ Authentication required for all operations
- ✅ API keys not exposed to client

### Future Enhancements

- [ ] Rate limiting on API endpoints
- [ ] IP whitelisting for admin functions
- [ ] Audit logging
- [ ] Data encryption at rest (Firebase default)

---

## API Limitations

### OpenAI API

- **Rate Limits**: Varies by tier
- **Token Limits**: Context window limits apply
- **Cost**: Pay-per-token pricing
- **Availability**: Dependent on OpenAI service

### Google Cloud Vision API

- **Quota**: Daily/monthly limits apply
- **Cost**: Per-image pricing
- **Accuracy**: 60-80% for insurance cards
- **Availability**: Dependent on Google Cloud service

### Firebase

- **Free Tier Limits**: 
  - Firestore: 50K reads/day
  - Storage: 5GB
  - Functions: 2M invocations/month
- **Scaling**: Automatic but may require paid plan

---

## Workarounds

### For OCR Issues

1. Always provide manual entry option
2. Display confidence scores
3. Allow users to edit extracted data
4. Provide clear error messages

### For Performance Issues

1. Implement loading states
2. Use skeleton screens
3. Optimize images before upload
4. Cache frequently accessed data

### For Testing Limitations

1. Manual testing for UI components
2. Integration tests for services
3. Structure validation for security rules
4. Manual E2E testing for critical flows

---

## Reporting Issues

If you encounter issues not listed here:

1. Check browser console for errors
2. Review Firebase Console logs
3. Check network requests in DevTools
4. Review error messages carefully
5. Document steps to reproduce

---

**Last Updated:** 2025-01-XX  
**Status:** Active Development  
**Next Review:** After PR #18 completion


