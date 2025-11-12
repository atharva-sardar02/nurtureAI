/**
 * Common Header Component
 * Reusable header with navigation and user actions
 */

import { Button } from "@/components/ui/button"
import { LogOut, Menu, Home, FileText, UserPlus, Calendar, MessageCircle, BarChart3 } from "lucide-react"
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
                 <nav className="hidden md:flex items-center gap-4 lg:gap-6" role="navigation" aria-label="Main navigation">
                   <button
                     onClick={() => navigate("/")}
                     className={cn(
                       "text-sm font-medium transition-colors flex items-center gap-2 min-h-[44px] px-2 rounded-md hover:bg-muted/50",
                       isActive("/")
                         ? "text-foreground"
                         : "text-muted-foreground hover:text-foreground"
                     )}
                     aria-label="Navigate to home"
                     aria-current={isActive("/") ? "page" : undefined}
                   >
                     <Home className="w-4 h-4" aria-hidden="true" />
                     Home
                   </button>
                   <button
                     onClick={() => navigate("/assessment")}
                     className={cn(
                       "text-sm font-medium transition-colors flex items-center gap-2 min-h-[44px] px-2 rounded-md hover:bg-muted/50",
                       isActive("/assessment")
                         ? "text-foreground"
                         : "text-muted-foreground hover:text-foreground"
                     )}
                     aria-label="Navigate to assessment"
                     aria-current={isActive("/assessment") ? "page" : undefined}
                   >
                     <FileText className="w-4 h-4" aria-hidden="true" />
                     Assessment
                   </button>
                   <button
                     onClick={() => navigate("/onboarding")}
                     className={cn(
                       "text-sm font-medium transition-colors flex items-center gap-2 min-h-[44px] px-2 rounded-md hover:bg-muted/50",
                       isActive("/onboarding")
                         ? "text-foreground"
                         : "text-muted-foreground hover:text-foreground"
                     )}
                     aria-label="Navigate to onboarding"
                     aria-current={isActive("/onboarding") ? "page" : undefined}
                   >
                     <UserPlus className="w-4 h-4" aria-hidden="true" />
                     Onboarding
                   </button>
                   <button
                     onClick={() => navigate("/scheduling")}
                     className={cn(
                       "text-sm font-medium transition-colors flex items-center gap-2 min-h-[44px] px-2 rounded-md hover:bg-muted/50",
                       isActive("/scheduling")
                         ? "text-foreground"
                         : "text-muted-foreground hover:text-foreground"
                     )}
                     aria-label="Navigate to scheduling"
                     aria-current={isActive("/scheduling") ? "page" : undefined}
                   >
                     <Calendar className="w-4 h-4" aria-hidden="true" />
                     Scheduling
                   </button>
                   <button
                     onClick={() => navigate("/support")}
                     className={cn(
                       "text-sm font-medium transition-colors flex items-center gap-2 min-h-[44px] px-2 rounded-md hover:bg-muted/50",
                       isActive("/support")
                         ? "text-foreground"
                         : "text-muted-foreground hover:text-foreground"
                     )}
                     aria-label="Navigate to support"
                     aria-current={isActive("/support") ? "page" : undefined}
                   >
                     <MessageCircle className="w-4 h-4" aria-hidden="true" />
                     Support
                   </button>
                   <button
                     onClick={() => navigate("/admin")}
                     className={cn(
                       "text-sm font-medium transition-colors flex items-center gap-2 min-h-[44px] px-2 rounded-md hover:bg-muted/50",
                       isActive("/admin")
                         ? "text-foreground"
                         : "text-muted-foreground hover:text-foreground"
                     )}
                     aria-label="Navigate to admin dashboard"
                     aria-current={isActive("/admin") ? "page" : undefined}
                   >
                     <BarChart3 className="w-4 h-4" aria-hidden="true" />
                     Admin
                   </button>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut} 
                className="flex items-center gap-2 min-h-[44px] sm:min-h-[40px] transition-all duration-200"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
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
                className="flex items-center gap-2 min-h-[44px] min-w-[44px] transition-all duration-200"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <Menu className="w-5 h-5" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {user && mobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden border-t border-border py-4"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  navigate("/")
                  setMobileMenuOpen(false)
                }}
                className={cn(
                  "text-sm font-medium transition-colors text-left flex items-center gap-2 min-h-[44px] px-4 rounded-md hover:bg-muted/50",
                  isActive("/") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                role="menuitem"
                aria-label="Navigate to home"
                aria-current={isActive("/") ? "page" : undefined}
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Home
              </button>
              <button
                onClick={() => {
                  navigate("/assessment")
                  setMobileMenuOpen(false)
                }}
                className={cn(
                  "text-sm font-medium transition-colors text-left flex items-center gap-2 min-h-[44px] px-4 rounded-md hover:bg-muted/50",
                  isActive("/assessment") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                role="menuitem"
                aria-label="Navigate to assessment"
                aria-current={isActive("/assessment") ? "page" : undefined}
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                Assessment
              </button>
              <button
                onClick={() => {
                  navigate("/onboarding")
                  setMobileMenuOpen(false)
                }}
                className={cn(
                  "text-sm font-medium transition-colors text-left flex items-center gap-2 min-h-[44px] px-4 rounded-md hover:bg-muted/50",
                  isActive("/onboarding") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                role="menuitem"
                aria-label="Navigate to onboarding"
                aria-current={isActive("/onboarding") ? "page" : undefined}
              >
                <UserPlus className="w-4 h-4" aria-hidden="true" />
                Onboarding
              </button>
              <button
                onClick={() => {
                  navigate("/scheduling")
                  setMobileMenuOpen(false)
                }}
                className={cn(
                  "text-sm font-medium transition-colors text-left flex items-center gap-2 min-h-[44px] px-4 rounded-md hover:bg-muted/50",
                  isActive("/scheduling") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                role="menuitem"
                aria-label="Navigate to scheduling"
                aria-current={isActive("/scheduling") ? "page" : undefined}
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                Scheduling
              </button>
              <button
                onClick={() => {
                  navigate("/support")
                  setMobileMenuOpen(false)
                }}
                className={cn(
                  "text-sm font-medium transition-colors text-left flex items-center gap-2 min-h-[44px] px-4 rounded-md hover:bg-muted/50",
                  isActive("/support") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                role="menuitem"
                aria-label="Navigate to support"
                aria-current={isActive("/support") ? "page" : undefined}
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Support
              </button>
              <button
                onClick={() => {
                  navigate("/admin")
                  setMobileMenuOpen(false)
                }}
                className={cn(
                  "text-sm font-medium transition-colors text-left flex items-center gap-2 min-h-[44px] px-4 rounded-md hover:bg-muted/50",
                  isActive("/admin") 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                role="menuitem"
                aria-label="Navigate to admin dashboard"
                aria-current={isActive("/admin") ? "page" : undefined}
              >
                <BarChart3 className="w-4 h-4" aria-hidden="true" />
                Admin
              </button>
              <div className="text-sm text-muted-foreground pt-2 border-t border-border">
                {user.email}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut} 
                className="flex items-center gap-2 justify-start min-h-[44px] px-4 transition-all duration-200"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

