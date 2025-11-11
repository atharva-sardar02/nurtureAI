import { createContext, useContext, useEffect, useState } from 'react'
import { 
  signIn as authSignIn,
  signUp as authSignUp,
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
  onAuthStateChange,
} from '@/services/firebase/auth'
import { createUserProfile, updateLastLogin } from '@/services/firebase/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
      
      // Update last login timestamp when user signs in
      if (user) {
        updateLastLogin(user.uid).catch(console.error)
      }
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const result = await authSignIn(email, password)
    if (result.success && result.user) {
      // Update last login
      await updateLastLogin(result.user.uid).catch(console.error)
    }
    return result
  }

  const signUp = async (email, password) => {
    const result = await authSignUp(email, password)
    if (result.success && result.user) {
      // Create user profile in Firestore
      const profileResult = await createUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
      }, 'email')
      
      if (!profileResult.success) {
        console.error('Failed to create user profile:', profileResult.error)
        // Don't fail sign-up if profile creation fails, but log it
      }
    }
    return result
  }

  const signInWithGoogle = async () => {
    const result = await authSignInWithGoogle()
    if (result.success && result.user) {
      // Create or update user profile
      const profileResult = await createUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
      }, 'google.com')
      
      if (!profileResult.success) {
        console.error('Failed to create/update user profile:', profileResult.error)
      }
      
      // Update last login
      await updateLastLogin(result.user.uid).catch(console.error)
    }
    return result
  }

  const signOut = async () => {
    return await authSignOut()
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

