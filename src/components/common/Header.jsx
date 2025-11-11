/**
 * Common Header Component
 * Reusable header with navigation and user actions
 */

import { Button } from "@/components/ui/button"
import { LogOut, Menu } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

export function Header({ title = "NurtureAI" }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <img
              src="/logo-n-icon.png"
              alt="NurtureAI Logo"
              className="w-10 h-10"
            />
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">Mental Health Support</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate("/")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </button>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </nav>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  navigate("/")
                  setMobileMenuOpen(false)
                }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                Home
              </button>
              <div className="text-sm text-muted-foreground">
                {user.email}
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-2 justify-start">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

