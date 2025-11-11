/**
 * Common Footer Component
 * Footer with support links and information
 */

import { Link } from "react-router-dom"
import { Mail, Phone, HelpCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4">About NurtureAI</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered mental health support for families, helping connect children and adolescents with the care they need.
            </p>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@daybreakhealth.com"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  support@daybreakhealth.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+1-800-HELP"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  1-800-HELP
                </a>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.crisistextline.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Crisis Text Line
                </a>
              </li>
              <li>
                <a
                  href="https://988lifeline.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  988 Suicide & Crisis Lifeline
                </a>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Daybreak Health. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

