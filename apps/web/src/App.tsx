import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthLayout } from "./components/auth/AuthLayout"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { AppLayout } from "./components/layout/AppLayout"
import { LoginPage } from "./pages/auth/LoginPage"
import { RegisterPage } from "./pages/auth/RegisterPage"
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage"
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage"
import { DashboardPage } from "./pages/DashboardPage"
import { AgentsPage } from "./pages/AgentsPage"
import { CreateAgentPage } from "./pages/CreateAgentPage"
import { AgentDetailPage } from "./pages/AgentDetailPage"
import { AgentChatPage } from "./pages/AgentChatPage"
import { ChatPage } from "./pages/ChatPage"
import { TasksPage } from "./pages/TasksPage"
import { TaskDetailPage } from "./pages/TaskDetailPage"
import { HistoryPage } from "./pages/HistoryPage"
import { SettingsPage } from "./pages/SettingsPage"
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage"
import { ApiKeysPage } from "./pages/ApiKeysPage"
import { ErrorBoundary } from "./components/shared/ErrorBoundary"

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            {/* Chat has its own layout */}
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />

            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/new" element={<CreateAgentPage />} />
              <Route path="/agents/:agentId" element={<AgentDetailPage />} />
              <Route path="/agents/:agentId/chat" element={<AgentChatPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/profile" element={<ProfileSettingsPage />} />
              <Route path="/settings/api-keys" element={<ApiKeysPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
