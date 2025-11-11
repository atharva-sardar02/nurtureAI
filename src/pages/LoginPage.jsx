import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { Header } from "@/components/layout/header"
import { resetPassword } from "@/services/firebase/auth"

export function LoginPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const { signIn, signUp, signInWithGoogle } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true })
    }
  }, [user, authLoading, navigate])

  // Form validation
  const validateForm = () => {
    const errors = {}
    
    // Email validation
    if (!email) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address"
    }
    
    // Password validation
    if (!password) {
      errors.password = "Password is required"
    } else if (isSignUp && password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setValidationErrors({})
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)

    const result = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password)

    setLoading(false)

    if (!result.success) {
      setError(result.error)
    } else if (isSignUp) {
      setSuccess("Account created successfully! Redirecting...")
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setValidationErrors({})
    
    if (!email) {
      setValidationErrors({ email: "Email is required" })
      return
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationErrors({ email: "Please enter a valid email address" })
      return
    }
    
    setLoading(true)
    const result = await resetPassword(email)
    setLoading(false)
    
    if (result.success) {
      setSuccess("Password reset email sent! Check your inbox.")
      setShowPasswordReset(false)
    } else {
      setError(result.error)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)
    const result = await signInWithGoogle()
    setLoading(false)
    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="NurtureAI" />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {showPasswordReset 
                ? "Reset Password" 
                : isSignUp 
                  ? "Create Account" 
                  : "Sign In"}
            </CardTitle>
            <CardDescription>
              {showPasswordReset
                ? "Enter your email and we'll send you a password reset link"
                : isSignUp 
                  ? "Create an account to get started" 
                  : "Sign in to your account to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={showPasswordReset ? handlePasswordReset : handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: "" })
                    }
                  }}
                  className={validationErrors.email ? "border-destructive" : ""}
                  required
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive">{validationErrors.email}</p>
                )}
              </div>
              {!showPasswordReset && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (validationErrors.password) {
                        setValidationErrors({ ...validationErrors, password: "" })
                      }
                    }}
                    className={validationErrors.password ? "border-destructive" : ""}
                    required
                  />
                  {validationErrors.password && (
                    <p className="text-sm text-destructive">{validationErrors.password}</p>
                  )}
                </div>
              )}
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  {success}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : showPasswordReset ? "Send Reset Email" : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>
            {!showPasswordReset && !isSignUp && (
              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordReset(true)
                    setError("")
                    setSuccess("")
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
            {showPasswordReset && (
              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordReset(false)
                    setError("")
                    setSuccess("")
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            )}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                }}
                className="text-primary hover:underline"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

