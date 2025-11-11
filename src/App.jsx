import { AssessmentChat } from "./components/chat/assessment-chat"
import { Header } from "./components/layout/header"
import "./styles/global.css"

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header title="NurtureAI" />
      <div className="h-[calc(100vh-80px)]">
        <AssessmentChat />
      </div>
    </div>
  )
}

export default App
