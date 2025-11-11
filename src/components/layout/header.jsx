import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"

export function Header({ title = "Daybreak Health", showMenu = true, isAuthenticated = false, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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

        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

