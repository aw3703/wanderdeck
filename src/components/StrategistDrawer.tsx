import { useState } from 'react'
import { Sparkles, Send, Compass, ShieldAlert, Clock, Backpack, X, Loader2 } from 'lucide-react'
import { callAction } from '../lib/actions'
import type { Expedition, Waypoint } from '../types'

interface StrategistDrawerProps {
  expedition: Expedition
  waypoints: Waypoint[]
  isOpen: boolean
  onClose: () => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function StrategistDrawer({ expedition, waypoints, isOpen, onClose }: StrategistDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Greetings Explorer. I am your AI Field Strategist for **${expedition.title}**. Ask me about terrain difficulty, weather hazards, gear recommendations, timing/pacing, or local regulations.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const waypointsSummary = waypoints.map((w, idx) => `${idx + 1}. ${w.title} (${w.location})`).join(', ')

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim()
    if (!q || loading) return

    const userMsg: Message = { role: 'user', content: q }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await callAction<{ text: string }>('askStrategist', {
        prompt: q,
        expeditionTitle: expedition.title,
        destination: expedition.destination,
        waypointsSummary,
      })

      if (res.success && res.data?.text) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.data!.text }])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Field assessment: ${res.error || 'Failed to establish strategist uplink. Please verify connection.'}`,
          },
        ])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${msg}` }])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    { label: 'Hazards & Safety', icon: ShieldAlert, prompt: 'What are the main weather or terrain hazards for this route and how should we mitigate them?' },
    { label: 'Optimal Pacing', icon: Clock, prompt: 'Suggest an optimal time-of-day itinerary and pacing schedule across these waypoints.' },
    { label: 'Gear Checklist', icon: Backpack, prompt: 'What specific technical gear, clothing, and emergency items do we need for these specific stops?' },
    { label: 'Local Etiquette', icon: Compass, prompt: 'What cultural rules, local customs, and environmental regulations should our team observe?' },
  ]

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-card/95 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Field Strategist</h2>
            <p className="text-[11px] text-muted-foreground">Claude AI Expedition Advisory</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close strategist drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-border/50 bg-muted/20 p-2.5 text-xs no-scrollbar">
        {quickPrompts.map((qp) => {
          const Icon = qp.icon
          return (
            <button
              key={qp.label}
              onClick={() => handleSend(qp.prompt)}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-primary/50 hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <Icon className="h-3 w-3 text-primary" />
              <span>{qp.label}</span>
            </button>
          )
        })}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground font-medium rounded-tr-sm'
                  : 'border border-border/70 bg-muted/30 text-foreground rounded-tl-sm whitespace-pre-wrap'
              }`}
            >
              {m.content}
            </div>
            <span className="mt-1 px-1 font-mono text-[9px] text-muted-foreground uppercase">
              {m.role === 'user' ? 'You' : 'Claude Strategist'}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>Analyzing expedition parameters...</span>
          </div>
        )}
      </div>

      {/* Input form */}
      <div className="border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the strategist anything about this route..."
            disabled={loading}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
