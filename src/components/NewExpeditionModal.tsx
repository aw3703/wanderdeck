import { useState } from 'react'
import { Sparkles, Compass, X, Loader2, MapPin, Plus, ShieldCheck, Check } from 'lucide-react'
import { callAction } from '../lib/actions'
import { useMutations } from 'deepspace'
import type { Expedition, Waypoint, ChecklistItem } from '../types'

interface NewExpeditionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (expeditionId: string) => void
}

export function NewExpeditionModal({ isOpen, onClose, onCreated }: NewExpeditionModalProps) {
  const [tab, setTab] = useState<'ai' | 'manual'>('ai')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI Generation State
  const [destination, setDestination] = useState('')
  const [style, setStyle] = useState('adventure & trekking')
  const [days, setDays] = useState(4)

  // Manual Creation State
  const [manualTitle, setManualTitle] = useState('')
  const [manualDestination, setManualDestination] = useState('')
  const [manualCountry, setManualCountry] = useState('')
  const [manualSummary, setManualSummary] = useState('')
  const [manualTags, setManualTags] = useState('alpine, trekking, wilderness')

  const { create: createExpedition } = useMutations<Expedition>('expeditions')
  const { create: createWaypoint } = useMutations<Waypoint>('waypoints')
  const { create: createChecklist } = useMutations<ChecklistItem>('checklists')

  if (!isOpen) return null

  const presets = [
    { name: 'Patagonia Fitz Roy', dest: 'El Chaltén, Argentina', country: 'Argentina' },
    { name: 'Dolomites Alta Via 1', dest: 'Cortina d\'Ampezzo, Italy', country: 'Italy' },
    { name: 'Yosemite High Sierra', dest: 'Yosemite, California', country: 'United States' },
    { name: 'Scottish Highlands', dest: 'Fort William, Scotland', country: 'United Kingdom' },
  ]

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await callAction<{ expeditionId: string; title: string }>('generateExpedition', {
        destination,
        style,
        days,
      })

      if (res.success && res.data?.expeditionId) {
        onCreated(res.data.expeditionId)
        onClose()
      } else {
        if (res.error?.includes('Unauthorized') || res.error?.includes('Authentication')) {
          setError(
            'DeepSpace AI generation requires an active session. Please sign in via the top navigation bar, or use the "Custom Route" tab to build your deck instantly without signing in.'
          )
        } else {
          setError(res.error || 'Failed to generate expedition. Please try again.')
        }
      }
    } catch {
      setError(
        'DeepSpace AI generation requires signing in. Please sign in via the top navigation bar, or use the "Custom Route" tab to build your deck instantly.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualTitle.trim() || !manualDestination.trim()) return

    setLoading(true)
    setError(null)

    try {
      const country = manualCountry.trim() || manualDestination.trim()
      const recordId = await createExpedition({
        title: manualTitle.trim(),
        destination: manualDestination.trim(),
        country,
        summary:
          manualSummary.trim() ||
          `Multi-day exploratory expedition across ${manualDestination.trim()} featuring scenic wilderness routes.`,
        coverImage:
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        tags: manualTags.trim(),
        startDate: 'Day 1',
        endDate: `Day 4`,
        status: 'planning',
        aiBriefing: `Expedition route initialized for ${manualDestination.trim()}. Recommended to verify local trail reports and pack appropriate weather gear.`,
      })

      if (recordId) {
        // Seed starter base camp waypoint so the new deck is immediately usable
        await createWaypoint({
          expeditionId: recordId,
          title: `${manualDestination.trim()} Base Camp`,
          location: manualDestination.trim(),
          category: 'stay',
          lat: '0',
          lon: '0',
          order: 1,
          visited: false,
          notes: 'Expedition staging area and trailhead departure point.',
          weatherJson: JSON.stringify({
            temp: 15,
            feels_like: 14,
            description: 'partly cloudy',
            humidity: 60,
            wind_speed: 4.2,
          }),
          wikiJson: '',
          audioUrl: '',
          audioNarrator: 'alloy',
          audioNarrative: `Welcome to the expedition staging point in ${manualDestination.trim()}. Check all radio communication channels and finalize pack weights before departure.`,
        })

        // Seed essential starter checklist
        await createChecklist({
          expeditionId: recordId,
          item: 'Topographic trail map & compass',
          category: 'safety',
          completed: false,
          assignedTo: 'Lead Scout',
        })
        await createChecklist({
          expeditionId: recordId,
          item: 'First aid kit with blister treatment',
          category: 'safety',
          completed: false,
          assignedTo: 'Field Team',
        })
        await createChecklist({
          expeditionId: recordId,
          item: 'Water filtration system / purification tablets',
          category: 'gear',
          completed: false,
          assignedTo: 'Field Team',
        })

        onCreated(recordId)
        onClose()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const applyPreset = (p: typeof presets[0]) => {
    setManualTitle(p.name)
    setManualDestination(p.dest)
    setManualCountry(p.country)
    setManualSummary(`Alpine and backcountry trek through ${p.dest}, exploring high-elevation passes and scenic landmarks.`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Create Expedition Deck</h2>
              <p className="text-[11px] text-muted-foreground">Scout a route with Claude AI or create custom</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border bg-muted/30 text-xs">
          <button
            type="button"
            onClick={() => { setTab('ai'); setError(null); }}
            className={`flex-1 py-3 font-semibold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              tab === 'ai'
                ? 'border-primary text-primary bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate with Claude AI</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('manual'); setError(null); }}
            className={`flex-1 py-3 font-semibold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              tab === 'manual'
                ? 'border-primary text-primary bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Custom Route</span>
          </button>
        </div>

        {error && (
          <div className="m-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex flex-col gap-2">
            <p>{error}</p>
            {tab === 'ai' && (
              <button
                type="button"
                onClick={() => { setTab('manual'); setError(null); }}
                className="self-start rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/30 transition-colors"
              >
                Switch to Custom Route →
              </button>
            )}
          </div>
        )}

        {/* AI Generator Form */}
        {tab === 'ai' ? (
          <form onSubmit={handleGenerateAI} className="p-4 sm:p-5 space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Destination or Region *
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Dolomites, Italy or Patagonia or Lofoten Islands, Norway"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Expedition Theme
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                >
                  <option value="adventure & trekking">Alpine & Trekking</option>
                  <option value="coastal roadtrip">Coastal Roadtrip</option>
                  <option value="cultural heritage">Cultural & Historical</option>
                  <option value="photography & landscape">Landscape Photography</option>
                  <option value="wildlife & nature">Wildlife & Backcountry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Duration: {days} Days
                </label>
                <input
                  type="range"
                  min={2}
                  max={7}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-primary mt-2.5"
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/60">
              Claude creates a complete dossier with 4–6 realistic route waypoints, coordinates, weather queries, and an essential gear checklist inserted directly into your synced deck.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !destination.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Scouting with Claude...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generate Expedition</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateManual} className="p-4 sm:p-5 space-y-3.5 text-xs">
            {/* Quick Presets */}
            <div className="space-y-1.5 pb-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Quick Inspiration Presets:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="rounded-lg border border-border/70 bg-muted/30 px-2 py-1 text-[11px] font-medium text-foreground hover:border-primary/50 hover:bg-muted transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Expedition Title *
              </label>
              <input
                type="text"
                required
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. Scottish Highlands West Highland Way"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Destination / Region *
                </label>
                <input
                  type="text"
                  required
                  value={manualDestination}
                  onChange={(e) => setManualDestination(e.target.value)}
                  placeholder="e.g. Fort William"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={manualCountry}
                  onChange={(e) => setManualCountry(e.target.value)}
                  placeholder="e.g. Scotland"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Expedition Overview
              </label>
              <textarea
                value={manualSummary}
                onChange={(e) => setManualSummary(e.target.value)}
                rows={2}
                placeholder="Summary of objectives, terrain, or route highlights..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !manualTitle.trim() || !manualDestination.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>Create Expedition</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
