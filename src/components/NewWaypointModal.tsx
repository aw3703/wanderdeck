import { useState } from 'react'
import { MapPin, X, Loader2, Sparkles } from 'lucide-react'
import { useMutations } from 'deepspace'
import { callAction } from '../lib/actions'
import type { Waypoint } from '../types'

interface NewWaypointModalProps {
  expeditionId: string
  nextOrder: number
  isOpen: boolean
  onClose: () => void
}

export function NewWaypointModal({ expeditionId, nextOrder, isOpen, onClose }: NewWaypointModalProps) {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('landmark')
  const [notes, setNotes] = useState('')
  const [enrichNow, setEnrichNow] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { create } = useMutations<Waypoint>('waypoints')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    setError(null)

    try {
      const loc = location.trim() || title.trim()
      const recordId = await create({
        expeditionId,
        title: title.trim(),
        location: loc,
        category,
        order: nextOrder,
        visited: false,
        notes: notes.trim(),
        weatherJson: '',
        wikiJson: '',
        audioUrl: '',
        audioNarrator: 'alloy',
        audioNarrative: '',
      })

      if (recordId && enrichNow) {
        // Run enrichment in background via server action
        callAction('enrichWaypoint', {
          waypointId: recordId,
          title: title.trim(),
          location: loc,
        }).catch((err) => console.warn('Background enrichment warning:', err))
      }

      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Add Expedition Waypoint</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="m-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-foreground mb-1">
              Waypoint / Landmark Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bixby Creek Bridge or Diamond Beach"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Big Sur, CA"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="landmark">Landmark</option>
                <option value="nature">Nature / Trail</option>
                <option value="waterfall">Waterfall</option>
                <option value="summit">Summit / Overlook</option>
                <option value="culture">Cultural / Heritage</option>
                <option value="food">Culinary / Rest</option>
                <option value="stay">Camp / Lodging</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-foreground mb-1">
              Field Notes / Tips
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Best light at sunset. Rocky footing, high winds."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enrichNow}
                onChange={(e) => setEnrichNow(e.target.checked)}
                className="rounded accent-primary h-3.5 w-3.5"
              />
              <span className="text-[11px] font-medium text-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>Auto-enrich with Weather + Wikipedia + Audio Guide</span>
              </span>
            </label>
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
              disabled={loading || !title.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>Add Waypoint</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
