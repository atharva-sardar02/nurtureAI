import { AssessmentChat } from "@/components/chat/assessment-chat"
import { Header } from "@/components/layout/header"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(100vh-80px)]">
        <AssessmentChat />
      </div>
    </div>
  )
}

