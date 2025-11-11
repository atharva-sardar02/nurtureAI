import { ErrorBoundary } from "./components/common/ErrorBoundary"
import { Routes } from "./routes/Routes"
import "./styles/global.css"

function App() {
  return (
    <ErrorBoundary>
      <Routes />
    </ErrorBoundary>
  )
}

export default App
