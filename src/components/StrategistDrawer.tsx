import { useState } from 'react'
import {
  Sparkles,
  Send,
  Compass,
  ShieldAlert,
  Clock,
  Backpack,
  X,
  Loader2,
  MapPin,
  Info,
} from 'lucide-react'
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
  isFallback?: boolean
}

export function StrategistDrawer({ expedition, waypoints, isOpen, onClose }: StrategistDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Greetings Explorer. I am your AI Field Strategist for **${expedition.title}** (${expedition.destination}).

Ask me about terrain difficulty, weather hazards, gear recommendations, timing/pacing, or local regulations. You can also click any of the tactical quick prompts above.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const waypointsSummary = waypoints
    .map((w, idx) => `${idx + 1}. ${w.title} (${w.location}, ${w.category})`)
    .join(', ')

  const getHeuristicAssessment = (prompt: string): string => {
    const p = prompt.toLowerCase()
    const dest = expedition.destination.toLowerCase()
    const isIceland = dest.includes('iceland') || dest.includes('vik')
    const isJapan = dest.includes('japan') || dest.includes('tokyo')

    if (p.includes('hazard') || p.includes('safety')) {
      if (isIceland) {
        return `⚠️ **Iceland South Coast Tactical Hazard Briefing:**\n\n1. **Sleeper Waves (Reynisfjara)**: Sneaker waves with violent backwash occur unexpectedly. Keep a minimum 30-meter buffer from the waterline at all times; never turn your back.\n2. **Gale-Force Wind Gusts**: Sudden crosswinds exceeding 70 km/h along Route 1 and cliff edges. Park facing into the wind to prevent car door damage.\n3. **Glacier Crevasses**: Never step on glacial tongues (Sólheimajökull, Vatnajökull) without certified crampons and an ice guide.\n4. **Emergency Contact**: SafeTravel.is app active; emergency services dial 112.`
      }
      if (isJapan) {
        return `⚠️ **Tokyo Urban & Cultural Hazard Briefing:**\n\n1. **Summer Heat Exhaustion / Humidity**: Temperatures can exceed 35°C in August. Hydrate with electrolyte Pocari Sweat from vending machines.\n2. **Earthquake Preparedness**: Know evacuation routes in subway stations and hotel safe zones (Safety Tips App).\n3. **Bicycle & Pedestrian Congestion**: Narrow alleyways in Yanaka/Asakusa share space with rapid commuter cyclists. Stay on the designated pedestrian left.`
      }
      return `⚠️ **General Backcountry Tactical Assessment for ${expedition.destination}:**\n\n1. Check live meteorological forecasts every 6 hours before departing base camp.\n2. Maintain three points of contact on exposed rocky scrambles.\n3. Establish emergency check-in protocols with team members and carry an offline satellite messenger.`
    }

    if (p.includes('pace') || p.includes('schedule') || p.includes('itinerary')) {
      return `⏱️ **Optimal Expedition Pacing & Schedule:**\n\n- **07:00 – 08:30**: Early departure to beat regional tour crowds and capitalize on soft morning golden-hour lighting.\n- **09:00 – 12:30**: Highest physical exertion window (${waypoints[0]?.title || 'Stop 1'}). Allocate ample buffer for technical sections.\n- **13:00 – 14:00**: High-calorie field lunch and hydration checkpoint.\n- **14:30 – 17:30**: Secondary reconnaissance stops (${waypoints[1]?.title || 'Stop 2'}). Arrive before dusk for camp setup.`
    }

    if (p.includes('gear') || p.includes('pack')) {
      return `🎒 **Essential Gear Matrix for ${expedition.destination}:**\n\n- **Protective Shell**: 3-layer waterproof, wind-resistant breathable hardshell.\n- **Footwear**: Ankle-support hiking boots with Vibram traction lugs.\n- **Navigation**: Satellite GPS communicator + physical topo map + power bank with thermal insulation.\n- **First Aid**: Pressure bandages, blister kits, thermal emergency space blanket, water purification tablets.`
    }

    return `🧭 **Field Advisory for ${expedition.title}:**\n\nScouting complete for route encompassing ${waypoints.length} waypoints across ${expedition.destination}.\n\nTerrain profile: High scenic diversity. Keep pack weight under 15% of body weight for optimal mobility. Review real-time weather telemetry at each stop before committing to exposed ascents.`
  }

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
        // Fallback to rich local heuristic assessment with helpful note
        const assessment = getHeuristicAssessment(q)
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `${assessment}\n\n*(Note: Live Claude interactive sessions require signing in via the top bar.)*`,
            isFallback: true,
          },
        ])
      }
    } catch {
      const assessment = getHeuristicAssessment(q)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `${assessment}\n\n*(Note: Live Claude interactive sessions require signing in via the top bar.)*`,
          isFallback: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    {
      label: 'Hazards & Safety',
      icon: ShieldAlert,
      prompt: 'What are the main weather or terrain hazards for this route and how should we mitigate them?',
    },
    {
      label: 'Optimal Pacing',
      icon: Clock,
      prompt: 'Suggest an optimal time-of-day itinerary and pacing schedule across these waypoints.',
    },
    {
      label: 'Gear Checklist',
      icon: Backpack,
      prompt: 'What specific technical gear, clothing, and emergency items do we need for these specific stops?',
    },
    {
      label: 'Local Regulations',
      icon: Compass,
      prompt: 'What cultural rules, local customs, and environmental regulations should our team observe?',
    },
  ]

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-card/95 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4 bg-card/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shadow-xs">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Field Strategist</h2>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.2 font-mono text-[9px] font-semibold text-emerald-400 border border-emerald-500/20">
                Claude 3.5
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary" />
              <span>{expedition.destination} · {waypoints.length} Stops</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close strategist drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex gap-2 overflow-x-auto border-b border-border/60 bg-muted/20 p-3 text-xs no-scrollbar">
        {quickPrompts.map((qp) => {
          const Icon = qp.icon
          return (
            <button
              key={qp.label}
              onClick={() => handleSend(qp.prompt)}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1 text-[11px] font-medium text-foreground hover:border-primary/60 hover:bg-muted/60 transition-all disabled:opacity-50 shadow-xs"
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
              className={`max-w-[90%] rounded-2xl p-3.5 leading-relaxed text-xs ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-xs'
                  : 'border border-border/80 bg-muted/30 text-foreground rounded-tl-xs whitespace-pre-wrap shadow-xs'
              }`}
            >
              {m.content}
            </div>
            <span className="mt-1 px-1 font-mono text-[9px] text-muted-foreground uppercase flex items-center gap-1">
              {m.role === 'user' ? 'Scout' : 'AI Strategist'}
              {m.isFallback && <span className="text-amber-400">· Heuristic Brief</span>}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs py-2 bg-muted/20 px-3 rounded-lg border border-border/50">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>Analyzing terrain parameters and meteorological data...</span>
          </div>
        )}
      </div>

      {/* Input form */}
      <div className="border-t border-border p-3.5 bg-card/60">
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
            className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity shadow-xs"
            aria-label="Send query"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
