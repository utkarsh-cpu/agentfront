import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cn } from '@workspace/ui/lib/utils'

const terminalLines = [
  '> initializing secure connection...',
  '> loading encryption modules...',
  '> verifying TLS certificates...',
  '> establishing handshake protocol...',
  '> connection established.',
  '> awaiting credentials_',
]

const systemStatusArt = [
  '╔═════════════════════════════════╗',  // 35 chars wide
'║  ░░░░░░  NEXUS SYSTEMS  ░░░░░░  ║',
'║─────────────────────────────────║',
'║  STATUS: OPERATIONAL            ║',
'║  UPTIME: 99.97%                 ║',
'║  AGENTS: STANDING BY            ║',
'╚═════════════════════════════════╝',
].join('\n')

function TerminalAnimation() {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (visibleLines >= terminalLines.length) return
    const timeout = setTimeout(
      () => setVisibleLines((prev) => prev + 1),
      400 + Math.random() * 300,
    )
    return () => clearTimeout(timeout)
  }, [visibleLines])

  return (
    <div className="font-mono text-sm leading-relaxed">
      {terminalLines.slice(0, visibleLines).map((line, i) => (
        <div
          key={i}
          className={cn(
            'text-terminal/70',
            i === visibleLines - 1 && 'text-terminal',
          )}
        >
          {line}
        </div>
      ))}
      {visibleLines >= terminalLines.length && (
        <span className="inline-block h-4 w-2 animate-pulse bg-terminal" />
      )}
    </div>
  )
}

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-black">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden w-1/2 flex-col justify-between border-r border-white/10 bg-black p-12 lg:flex">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-terminal">
            AGENTCOMMAND
          </h1>
          <p className="mt-2 font-mono text-sm text-white/40">
            SECURE AGENT CONTROL INTERFACE v1.0
          </p>
        </div>

        <div className="space-y-6">
          <TerminalAnimation />

          <pre
            className="w-fit whitespace-pre font-mono text-[11px] leading-[1.5] text-terminal/55 select-none"
            style={{ fontVariantLigatures: 'none' }}
          >
            {systemStatusArt}
          </pre>
        </div>

        <p className="font-mono text-xs text-white/20">
          © {new Date().getFullYear()} NEXUS SYSTEMS — ALL RIGHTS RESERVED
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-black px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile-only header */}
          <div className="mb-8 lg:hidden">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-terminal">
              NEXUS
            </h1>
            <p className="font-mono text-xs text-white/40">
              SECURE AGENT CONTROL INTERFACE
            </p>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
