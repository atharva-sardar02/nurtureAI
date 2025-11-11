/**
 * Common Header Component
 * Reusable header with navigation and user actions
 */

import { Button } from "@/components/ui/button"
import { LogOut, Menu, Home, FileText, UserPlus, Calendar, MessageCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Header({ title = "NurtureAI" }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

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
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-2",
                  isActive("/") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => navigate("/assessment")}
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-2",
                  isActive("/assessment") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="w-4 h-4" />
                Assessment
              </button>
              <button
                onClick={() => navigate("/onboarding")}
                className={cn(
                  "text-sm font-medium transition-colors flex items-center gap-2",
                  isActive("/onboarding") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <UserPlus className="w-4 h-4" />
                Onboarding
              </button>
                   <button
                     onClick={() => navigate("/scheduling")}
                     className={cn(
                       "text-sm font-medium transition-colors flex items-center gap-2",
                       isActive("/scheduling")
                         ? "text-foreground"
                         : "text-muted-foreground hover:text-foreground"
                     )}
                   >
                     <Calendar className="w-4 h-4" />
                     Scheduling
                   </button>
                   <button
                     onClick={() => navigate("/support")}
                     className={cn(
                       "text-sm font-medium transition-colors flex items-center gap-2",
                       isActive("/support")
                         ? "text-foreground"
                         : "text-muted-foreground hover:text-foreground"
                     )}
                   >
                     <MessageCircle className="w-4 h-4" />
                     Support
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
                className={cn(
                  "text-sm font-medium transition-colors text-left flex items-center gap-2",
                  isActive("/") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={() => {
                  navigate("/assessment")
                  setMobileMenuOpen(false)
                }}
                className={cn(
                  "text-sm font-medium transition-colors text-left flex items-center gap-2",
                  isActive("/assessment") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="w-4 h-4" />
                Assessment
              </button>
              <button
                onClick={() => {
                  navigate("/onboarding")
                  setMobileMenuOpen(false)
                }}
                className={cn(
                  "text-sm font-medium transition-colors text-left flex items-center gap-2",
                  isActive("/onboarding") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <UserPlus className="w-4 h-4" />
                Onboarding
              </button>
                   <button
                     onClick={() => {
                       navigate("/scheduling")
                       setMobileMenuOpen(false)
                     }}
                     className={cn(
                       "text-sm font-medium transition-colors text-left flex items-center gap-2",
                       isActive("/scheduling")
                         ? "text-foreground"
                         : "text-muted-foreground hover:text-foreground"
                     )}
                   >
                     <Calendar className="w-4 h-4" />
                     Scheduling
                   </button>
                   <button
                     onClick={() => {
                       navigate("/support")
                       setMobileMenuOpen(false)
                     }}
                     className={cn(
                       "text-sm font-medium transition-colors text-left flex items-center gap-2",
                       isActive("/support")
                         ? "text-foreground"
                         : "text-muted-foreground hover:text-foreground"
                     )}
                   >
                     <MessageCircle className="w-4 h-4" />
                     Support
                   </button>
              <div className="text-sm text-muted-foreground pt-2 border-t border-border">
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

