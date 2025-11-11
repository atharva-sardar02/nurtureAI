/**
 * Utility to test Firebase connection
 * Call this from browser console: window.testFirebase()
 */
import { db, auth } from '@/services/firebase/config'
import { collection, getDocs } from 'firebase/firestore'

export async function testFirebaseConnection() {
  try {
    console.log('🔍 Testing Firebase connection...')
    
    // Test 1: Check if Firebase is initialized
    if (!auth || !db) {
      throw new Error('Firebase services not initialized')
    }
    console.log('✅ Firebase services initialized')
    
    // Test 2: Check auth state
    console.log('✅ Auth service available')
    
    // Test 3: Try to read from Firestore (this will fail if rules are too strict, but connection works)
    try {
      const testCollection = collection(db, '_test')
      await getDocs(testCollection)
      console.log('✅ Firestore connection successful')
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.log('✅ Firestore connection successful (permission denied is expected for test collection)')
      } else {
        throw error
      }
    }
    
    console.log('🎉 All Firebase tests passed!')
    return { success: true }
  } catch (error) {
    console.error('❌ Firebase test failed:', error)
    return { success: false, error: error.message }
  }
}

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  window.testFirebase = testFirebaseConnection
}

