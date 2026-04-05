import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useChatStore } from "@/stores/chat.store"
import { useAgentStore } from "@/stores/agent.store"
import { useAbortController } from "@/hooks/useAbortController"
import { chatService } from "@/services/chat.service"
import { MessageList } from "@/components/chat/MessageList"
import { ChatInput } from "@/components/chat/ChatInput"

export function AgentChatPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const { setActiveConversation, setMessages, addMessage, setStreaming, appendToStreaming, finalizeStreaming } = useChatStore()
  const setLastAgentId = useAgentStore((s) => s.setLastAgentId)
  const { getSignal, abort } = useAbortController()

  useEffect(() => {
    if (!agentId) return
    setLastAgentId(agentId)
    setActiveConversation(agentId)
    chatService
      .getConversationHistory(agentId, getSignal())
      .then(setMessages)
      .catch(() => { /* ignore */ })
  }, [agentId, setActiveConversation, setMessages, getSignal])

  const handleSend = async (message: string) => {
    if (!agentId) return

    const userMsg = { id: crypto.randomUUID(), role: "user" as const, content: message, createdAt: new Date().toISOString() }
    addMessage(userMsg)
    setStreaming(true)

    let accumulated = ""
    try {
      await chatService.sendMessage(
        agentId,
        message,
        (chunk) => {
          accumulated += chunk
          appendToStreaming(chunk)
        },
        getSignal()
      )
      finalizeStreaming({
        id: crypto.randomUUID(),
        role: "assistant",
        content: accumulated,
        createdAt: new Date().toISOString(),
      })
    } catch {
      finalizeStreaming({
        id: crypto.randomUUID(),
        role: "assistant",
        content: accumulated || "An error occurred.",
        createdAt: new Date().toISOString(),
      })
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <MessageList />
      <ChatInput onSend={handleSend} onAbort={abort} />
    </div>
  )
}
