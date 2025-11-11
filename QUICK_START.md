# Quick Start Guide
## Testing Your Setup

You've added your OpenAI API key and Firebase credentials! Here's how to verify everything works:

---

## ✅ Verification Complete

Your environment variables are set:
- ✅ Firebase API Key
- ✅ Firebase Auth Domain
- ✅ Firebase Project ID
- ✅ Firebase Storage Bucket
- ✅ Firebase Messaging Sender ID
- ✅ Firebase App ID
- ✅ OpenAI API Key

---

## 🚀 Next Steps

### 1. Start the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173` (or the port shown in terminal).

### 2. Test Authentication

1. **Sign Up** - Create a new account with email/password
2. **Sign In** - Test login functionality
3. **Google Sign-In** - Test OAuth (if enabled in Firebase Console)

### 3. Test AI Chat Interface

1. After logging in, you'll see the chat interface
2. **Send a test message** like: "My child has been anxious lately"
3. **Verify**:
   - ✅ AI responds (OpenAI API working)
   - ✅ Messages appear in chat
   - ✅ Loading indicator shows while waiting
   - ✅ No errors in browser console

### 4. Test Crisis Detection

Try sending a message with crisis keywords:
- "My child mentioned suicide"
- "My child is hurting themselves"

**Expected**: Crisis detection alert should appear with emergency resources.

### 5. Check Browser Console

Open browser DevTools (F12) and check:
- ✅ No Firebase errors
- ✅ No OpenAI API errors
- ✅ Firebase initialized successfully
- ✅ Conversations saving to Firestore (check Network tab)

### 6. Verify Firestore Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Firestore Database**
3. Check for:
   - ✅ `users` collection (your user profile)
   - ✅ `conversations` collection (after chatting)

---

## 🐛 Troubleshooting

### Issue: "OpenAI API key is missing"
**Solution**: 
- Check `.env` file has `VITE_OPENAI_API_KEY=sk-...`
- Restart dev server after updating `.env`

### Issue: "Firebase configuration is missing"
**Solution**:
- Verify all `VITE_FIREBASE_*` variables are set in `.env`
- Restart dev server

### Issue: Chat not responding
**Solution**:
- Check browser console for errors
- Verify OpenAI API key is valid
- Check OpenAI account has credits/quota

### Issue: Authentication not working
**Solution**:
- Verify Firebase Auth is enabled in Firebase Console
- Check Email/Password provider is enabled
- Verify Firebase project ID matches `.env`

---

## 📝 Quick Test Checklist

- [ ] Dev server starts without errors
- [ ] Can sign up with email/password
- [ ] Can sign in
- [ ] Chat interface loads
- [ ] Can send a message
- [ ] AI responds to messages
- [ ] No console errors
- [ ] User profile created in Firestore
- [ ] Conversations saved to Firestore

---

## 🎉 You're All Set!

Once all the above tests pass, you're ready to:
- Continue with PR #7 (RAG Enhancement Layer)
- Test the full chat flow
- Start building additional features

**Note**: Pinecone API key is optional and only needed for PR #7 (RAG system).

