/**
 * Chat Page
 * Main page for the AI assessment chat
 */

import { Layout } from "@/components/common/Layout"
import { ChatInterface } from "@/components/chat/ChatInterface"

export function ChatPage() {
  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] max-w-4xl mx-auto w-full p-4 sm:p-6">
        <ChatInterface />
      </div>
    </Layout>
  )
}

