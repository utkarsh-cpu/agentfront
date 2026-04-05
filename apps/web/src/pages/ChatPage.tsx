import { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Sheet, SheetContent } from '@workspace/ui/components/sheet'
import { useConversationStore } from '@/stores/conversation.store'
import { useAbortController } from '@/hooks/useAbortController'
import { conversationsService } from '@/services/conversations.service'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatMain } from '@/components/chat/ChatMain'
import { useState } from 'react'

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { getSignal, abort } = useAbortController()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const {
    conversations,
    activeConversation,
    setConversations,
    setActiveConversation,
    addConversation,
    updateConversation,
    removeConversation,
    setMessages,
    addMessage,
    setStreaming,
    appendToStreaming,
    finalizeStreaming,
    setLoading,
    isLoading,
  } = useConversationStore()

  // Load conversations on mount
  useEffect(() => {
    setLoading(true)
    conversationsService
      .getConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [setConversations, setLoading])

  // Load active conversation when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setActiveConversation(null)
      setMessages([])
      return
    }

    conversationsService
      .getConversation(conversationId, getSignal())
      .then((data) => {
        const { messages: msgs, ...conv } = data
        setActiveConversation(conv)
        setMessages(msgs)
      })
      .catch(() => {
        navigate('/chat', { replace: true })
      })
  }, [conversationId, setActiveConversation, setMessages, getSignal, navigate])

  // Auto-redirect to most recent conversation if no conversationId
  useEffect(() => {
    if (!conversationId && !isLoading && conversations.length > 0) {
      navigate(`/chat/${conversations[0].id}`, { replace: true })
    }
  }, [conversationId, isLoading, conversations, navigate])

  const handleNewChat = useCallback(async () => {
    try {
      const conv = await conversationsService.createConversation({
        modelName: 'claude-sonnet-4-6',
      })
      addConversation(conv)
      navigate(`/chat/${conv.id}`)
      setSidebarOpen(false)
    } catch {
      // ignore
    }
  }, [addConversation, navigate])

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await conversationsService.deleteConversation(id)
        removeConversation(id)
        if (activeConversation?.id === id) {
          const remaining = conversations.filter((c) => c.id !== id)
          if (remaining.length > 0) {
            navigate(`/chat/${remaining[0].id}`, { replace: true })
          } else {
            navigate('/chat', { replace: true })
          }
        }
      } catch {
        // ignore
      }
    },
    [activeConversation, conversations, removeConversation, navigate]
  )

  const handleSend = useCallback(
    async (message: string) => {
      if (!activeConversation) return

      const userMsg = {
        id: crypto.randomUUID(),
        conversationId: activeConversation.id,
        role: 'user' as const,
        content: message,
        createdAt: new Date().toISOString(),
      }
      addMessage(userMsg)
      setStreaming(true)

      // Auto-update title optimistically
      if (activeConversation.title === 'New Conversation') {
        const title = message.slice(0, 50) + (message.length > 50 ? '...' : '')
        updateConversation(activeConversation.id, { title })
      }

      let accumulated = ''
      try {
        await conversationsService.sendMessage(
          activeConversation.id,
          message,
          (chunk) => {
            accumulated += chunk
            appendToStreaming(chunk)
          },
          getSignal()
        )
        finalizeStreaming({
          id: crypto.randomUUID(),
          conversationId: activeConversation.id,
          role: 'assistant',
          content: accumulated,
          createdAt: new Date().toISOString(),
        })
      } catch {
        finalizeStreaming({
          id: crypto.randomUUID(),
          conversationId: activeConversation.id,
          role: 'assistant',
          content: accumulated || 'An error occurred.',
          createdAt: new Date().toISOString(),
        })
      }

      // Move conversation to top of list
      updateConversation(activeConversation.id, {
        updatedAt: new Date().toISOString(),
      })
    },
    [activeConversation, addMessage, setStreaming, appendToStreaming, finalizeStreaming, updateConversation, getSignal]
  )

  const handleModelChange = useCallback(
    async (model: string) => {
      if (!activeConversation) return
      try {
        const updated = await conversationsService.updateConversation(activeConversation.id, {
          modelName: model,
        })
        updateConversation(activeConversation.id, {
          modelName: updated.modelName,
        })
      } catch {
        // ignore
      }
    },
    [activeConversation, updateConversation]
  )

  const handleToolsChange = useCallback(
    async (tools: string[]) => {
      if (!activeConversation) return
      try {
        const updated = await conversationsService.updateConversation(activeConversation.id, {
          tools,
        })
        updateConversation(activeConversation.id, {
          tools: updated.tools,
        })
      } catch {
        // ignore
      }
    },
    [activeConversation, updateConversation]
  )

  const handleTitleChange = useCallback(
    async (title: string) => {
      if (!activeConversation) return
      try {
        await conversationsService.updateConversation(activeConversation.id, { title })
        updateConversation(activeConversation.id, { title })
      } catch {
        // ignore
      }
    },
    [activeConversation, updateConversation]
  )

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <ChatSidebar
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* Mobile sidebar via Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[260px] p-0 md:hidden">
          <ChatSidebar
            onNewChat={handleNewChat}
            onDeleteConversation={handleDeleteConversation}
          />
        </SheetContent>
      </Sheet>

      {/* Main chat area */}
      <ChatMain
        onSend={handleSend}
        onAbort={abort}
        onModelChange={handleModelChange}
        onToolsChange={handleToolsChange}
        onTitleChange={handleTitleChange}
        onToggleSidebar={() => setSidebarOpen(true)}
      />
    </div>
  )
}
