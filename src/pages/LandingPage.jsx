/**
 * Landing Page
 * Main page displayed after authentication
 */

import { ChatInterface } from "@/components/chat/ChatInterface"
import { Header } from "@/components/common/Header"
import { Footer } from "@/components/common/Footer"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="h-[calc(100vh-80px)]">
          <ChatInterface />
        </div>
      </main>
      <Footer />
    </div>
  )
}

