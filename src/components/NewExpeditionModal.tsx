import { useState } from 'react'
import { Sparkles, Compass, X, Loader2, Calendar, MapPin } from 'lucide-react'
import { callAction } from '../lib/actions'
import { useMutations } from 'deepspace'
import type { Expedition } from '../types'

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
  const [style, setStyle] = useState('adventure & nature')
  const [days, setDays] = useState(4)

  // Manual Creation State
  const [manualTitle, setManualTitle] = useState('')
  const [manualDestination, setManualDestination] = useState('')
  const [manualCountry, setManualCountry] = useState('')
  const [manualSummary, setManualSummary] = useState('')
  const [manualTags, setManualTags] = useState('expedition, trekking')

  const { create } = useMutations<Expedition>('expeditions')

  if (!isOpen) return null

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
        setError(res.error || 'Failed to generate expedition. Please try again.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
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
      const recordId = await create({
        title: manualTitle,
        destination: manualDestination,
        country: manualCountry || manualDestination,
        summary: manualSummary || `Expedition across ${manualDestination}.`,
        coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        tags: manualTags,
        startDate: 'Day 1',
        endDate: 'Day 3',
        status: 'planning',
        aiBriefing: '',
      })

      if (recordId) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Plan New Expedition</h2>
              <p className="text-[11px] text-muted-foreground">Scout a new route with AI or create manually</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border bg-muted/20 text-xs">
          <button
            type="button"
            onClick={() => setTab('ai')}
            className={`flex-1 py-2.5 font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
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
            onClick={() => setTab('manual')}
            className={`flex-1 py-2.5 font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
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
          <div className="m-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* AI Generator Form */}
        {tab === 'ai' ? (
          <form onSubmit={handleGenerateAI} className="p-4 space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Destination or Region *
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Dolomites, Italy or Patagonia or Kyoto, Japan"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Expedition Theme
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="adventure & trekking">Alpine & Trekking</option>
                  <option value="coastal roadtrip">Coastal Roadtrip</option>
                  <option value="cultural heritage">Cultural & Historical</option>
                  <option value="photography & landscape">Landscape Photography</option>
                  <option value="wildlife & nature">Wildlife & Backcountry</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Duration (Days): {days}
                </label>
                <input
                  type="range"
                  min={2}
                  max={7}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-primary mt-2"
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/20 p-2.5 rounded-lg border border-border/50">
              Claude will architect a complete expedition dossier: 4-6 realistic waypoints with exact coordinates, initial tactical notes, and a tailored gear prep checklist.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !destination.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Scouting route with Claude...</span>
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
          <form onSubmit={handleCreateManual} className="p-4 space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Expedition Title *
              </label>
              <input
                type="text"
                required
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. Scottish Highlands West Highland Way"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Destination / Region *
                </label>
                <input
                  type="text"
                  required
                  value={manualDestination}
                  onChange={(e) => setManualDestination(e.target.value)}
                  placeholder="e.g. Fort William"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={manualCountry}
                  onChange={(e) => setManualCountry(e.target.value)}
                  placeholder="e.g. Scotland"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Brief Overview
              </label>
              <textarea
                value={manualSummary}
                onChange={(e) => setManualSummary(e.target.value)}
                rows={2}
                placeholder="Summary of objectives, terrain, or route highlights..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !manualTitle.trim() || !manualDestination.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
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
