/**
 * Landing Page
 * Main page displayed after authentication
 */

import { AssessmentChat } from "@/components/chat/assessment-chat"
import { Header } from "@/components/common/Header"
import { Footer } from "@/components/common/Footer"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="h-[calc(100vh-80px)]">
          <AssessmentChat />
        </div>
      </main>
      <Footer />
    </div>
  )
}

