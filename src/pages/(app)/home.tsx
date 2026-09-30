import { useState, useEffect } from 'react'
import {
  useQuery,
  useMutations,
  useAuthProfileReady,
  usePresence,
} from 'deepspace'
import { useToast } from '../../components/ui'
import {
  Compass,
  MapPin,
  CheckSquare,
  FileText,
  Sparkles,
  Plus,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Circle,
  Trash2,
  ChevronRight,
  Headphones,
  Users,
  Image as ImageIcon,
  Flame,
  Globe,
  Radio,
  Loader2,
} from 'lucide-react'
import type { Expedition, Waypoint, ChecklistItem, FieldNote } from '../../types'
import { callAction } from '../../lib/actions'
import { WeatherBadge } from '../../components/WeatherBadge'
import { WikiCard } from '../../components/WikiCard'
import { AudioPlayer } from '../../components/AudioPlayer'
import { StrategistDrawer } from '../../components/StrategistDrawer'
import { NewExpeditionModal } from '../../components/NewExpeditionModal'
import { NewWaypointModal } from '../../components/NewWaypointModal'
import { FLAGSHIP_TRIPS } from '../../flagship-data'

export default function HomePage() {
  const { isSignedIn, user } = useAuthProfileReady()
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast()

  // Realtime Presence of fellow explorers
  const { users: activeUsers } = usePresence()

  // 1. Expeditions Query & Mutations
  const { records: expeditions, status: expStatus } = useQuery<Expedition>('expeditions')
  const {
    create: createExpedition,
    put: putExpedition,
    remove: removeExpedition,
    ready: expMutationsReady,
  } = useMutations<Expedition>('expeditions')

  const [selectedExpeditionId, setSelectedExpeditionId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'waypoints' | 'checklist' | 'notes'>('waypoints')

  // Modals & Drawers
  const [isNewExpeditionOpen, setIsNewExpeditionOpen] = useState(false)
  const [isNewWaypointOpen, setIsNewWaypointOpen] = useState(false)
  const [isStrategistOpen, setIsStrategistOpen] = useState(false)
  const [enrichingId, setEnrichingId] = useState<string | null>(null)
  const [generatingPoster, setGeneratingPoster] = useState(false)
  const [seeding, setSeeding] = useState(false)

  // Quick-add state for Checklist and Field Notes
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [newChecklistCategory, setNewChecklistCategory] = useState('gear')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteCategory, setNewNoteCategory] = useState('observation')

  // 2. Waypoints Query & Mutations for current expedition
  const { records: waypointsRecords } = useQuery<Waypoint>('waypoints', {
    where: selectedExpeditionId ? { expeditionId: selectedExpeditionId } : undefined,
    orderBy: 'order',
  })
  const {
    create: createWaypoint,
    put: putWaypoint,
    remove: removeWaypoint,
    ready: wpMutationsReady,
  } = useMutations<Waypoint>('waypoints')

  // 3. Checklist Query & Mutations
  const { records: checklistRecords } = useQuery<ChecklistItem>('checklists', {
    where: selectedExpeditionId ? { expeditionId: selectedExpeditionId } : undefined,
  })
  const {
    create: createChecklistItem,
    put: putChecklistItem,
    remove: removeChecklistItem,
    ready: chkMutationsReady,
  } = useMutations<ChecklistItem>('checklists')

  // 4. Field Notes Query & Mutations
  const { records: notesRecords } = useQuery<FieldNote>('fieldnotes', {
    where: selectedExpeditionId ? { expeditionId: selectedExpeditionId } : undefined,
    orderBy: 'createdAt',
    orderDir: 'desc',
  })
  const {
    create: createFieldNote,
    remove: removeFieldNote,
    ready: noteMutationsReady,
  } = useMutations<FieldNote>('fieldnotes')

  const handleSeed = async () => {
    setSeeding(true)
    try {
      // 1. Try server action first
      const res = await callAction('seedSampleData')
      if (res.success) {
        toastSuccess('Flagship expeditions initialized!')
        setSeeding(false)
        return
      }
    } catch {
      // Fallback to client mutation
    }

    // 2. Client fallback via DeepSpace mutations
    try {
      for (const trip of FLAGSHIP_TRIPS) {
        const expId = await createExpedition({
          title: trip.title,
          destination: trip.destination,
          country: trip.country,
          summary: trip.summary,
          coverImage: trip.coverImage,
          tags: trip.tags,
          startDate: trip.startDate,
          endDate: trip.endDate,
          status: trip.status,
          aiBriefing: trip.aiBriefing,
        })

        if (expId) {
          for (const wp of trip.waypoints) {
            await createWaypoint({
              expeditionId: expId,
              title: wp.title,
              location: wp.location,
              category: wp.category,
              lat: wp.lat,
              lon: wp.lon,
              order: wp.order,
              visited: wp.visited,
              notes: wp.notes,
              weatherJson: wp.weatherJson,
              wikiJson: wp.wikiJson,
              audioUrl: '',
              audioNarrator: 'alloy',
              audioNarrative: wp.audioNarrative,
            })
          }

          for (const chk of trip.checklists) {
            await createChecklistItem({
              expeditionId: expId,
              item: chk.item,
              category: chk.category,
              completed: chk.completed,
              assignedTo: 'Field Team',
            })
          }

          await createFieldNote({
            expeditionId: expId,
            author: user?.name || user?.email || 'Navigator',
            content: `Initialized expedition deck for ${trip.destination}. Route scouting completed.`,
            waypointTitle: trip.waypoints[0]?.title || '',
            category: 'observation',
          })
        }
      }
      toastSuccess('Flagship expeditions initialized!')
    } catch (err) {
      console.warn('Client seed fallback error:', err)
      toastError('Could not initialize sample expeditions')
    } finally {
      setSeeding(false)
    }
  }

  // Auto-seed sample expeditions if fresh
  useEffect(() => {
    if (expStatus === 'ready' && expeditions.length === 0 && !seeding) {
      handleSeed().catch((err) =>
        console.warn('Initial seed check:', err)
      )
    }
  }, [expStatus, expeditions.length])

  // Select initial expedition if none selected
  useEffect(() => {
    if (expeditions.length > 0) {
      if (!selectedExpeditionId || !expeditions.some((e) => e.recordId === selectedExpeditionId)) {
        setSelectedExpeditionId(expeditions[0].recordId)
      }
    }
  }, [expeditions, selectedExpeditionId])

  const currentExpeditionRecord = expeditions.find((e) => e.recordId === selectedExpeditionId)
  const currentExpedition = currentExpeditionRecord?.data

  // Calculate Progress Stats
  const visitedCount = waypointsRecords.filter((w) => w.data.visited).length
  const totalWaypoints = waypointsRecords.length
  const routeProgress = totalWaypoints > 0 ? Math.round((visitedCount / totalWaypoints) * 100) : 0

  const completedChecklist = checklistRecords.filter((c) => c.data.completed).length
  const totalChecklist = checklistRecords.length
  const checklistProgress =
    totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0

  // Enrich single waypoint action
  const handleEnrich = async (waypointId: string, title: string, location: string) => {
    setEnrichingId(waypointId)
    toastInfo('Enriching Waypoint', `Calling OpenWeatherMap + Wikipedia + Voice Audio Guide for ${title}...`)
    try {
      const res = await callAction('enrichWaypoint', {
        waypointId,
        title,
        location,
      })
      if (res.success) {
        toastSuccess('Waypoint Enriched', `${title} updated with live telemetry and voice guide.`)
      } else {
        toastError('Enrichment Warning', res.error || 'Failed to enrich waypoint.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toastError('Enrichment Error', msg)
    } finally {
      setEnrichingId(null)
    }
  }

  // Generate AI Expedition Poster using Gemini
  const handleGeneratePoster = async () => {
    if (!currentExpeditionRecord || !currentExpedition) return
    setGeneratingPoster(true)
    toastInfo('Generating Poster', `Consulting Gemini Image model for ${currentExpedition.destination}...`)

    try {
      const res = await callAction<{ imageUrl: string }>('generatePoster', {
        prompt: `${currentExpedition.title}, ${currentExpedition.destination}, scenic dramatic vista`,
        expeditionId: currentExpeditionRecord.recordId,
      })

      if (res.success && res.data?.imageUrl) {
        toastSuccess('Poster Created', 'Expedition cover art updated.')
      } else {
        toastError('Generation Failed', res.error || 'Could not generate poster.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toastError('Generation Error', msg)
    } finally {
      setGeneratingPoster(false)
    }
  }

  // Add checklist item handler
  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChecklistItem.trim() || !selectedExpeditionId) return
    try {
      await createChecklistItem({
        expeditionId: selectedExpeditionId,
        item: newChecklistItem.trim(),
        category: newChecklistCategory,
        completed: false,
        assignedTo: user?.name || user?.email || 'Team',
      })
      setNewChecklistItem('')
    } catch (err) {
      console.warn('Checklist create warning:', err)
    }
  }

  // Add field note handler
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteContent.trim() || !selectedExpeditionId) return
    try {
      await createFieldNote({
        expeditionId: selectedExpeditionId,
        author: user?.name || user?.email || 'Field Scout',
        content: newNoteContent.trim(),
        waypointTitle: currentExpedition?.title || 'Route Entry',
        category: newNoteCategory,
      })
      setNewNoteContent('')
    } catch (err) {
      console.warn('Fieldnote create warning:', err)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Top Banner & Expedition Navigator */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                WanderDeck
              </h1>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Radio className="h-2.5 w-2.5 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Collaborative Expedition Studio & AI Audio Field Guide
            </p>
          </div>
        </div>

        {/* Action Controls & Multiplayer Indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Presence Roster */}
          <div
            className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/60 px-2.5 py-1.5 text-xs shadow-xs"
            title={`${activeUsers.length || 1} explorer(s) viewing in real time`}
          >
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[11px] font-medium text-foreground">
              {activeUsers.length || 1} online
            </span>
          </div>

          <button
            onClick={() => setIsStrategistOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Field Strategist</span>
          </button>

          <button
            onClick={() => setIsNewExpeditionOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Expedition</span>
          </button>
        </div>
      </div>

      {/* Expedition Selector Pills */}
      {expeditions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-medium text-muted-foreground shrink-0 flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Decks:
          </span>
          {expeditions.map((exp) => {
            const isSelected = exp.recordId === selectedExpeditionId
            return (
              <button
                key={exp.recordId}
                onClick={() => setSelectedExpeditionId(exp.recordId)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary shadow-xs'
                    : 'border-border/70 bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{exp.data.title}</span>
                <span className="rounded bg-muted/60 px-1 py-0.2 font-mono text-[10px] uppercase text-muted-foreground">
                  {exp.data.country || exp.data.destination}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Empty State when no expeditions exist */}
      {expeditions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">
              Ready for Your Next Expedition?
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Load our curated flagship expeditions (Iceland South Coast, Tokyo Heritage Trails) or build a custom route from scratch.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {seeding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              )}
              <span>Load Flagship Expeditions</span>
            </button>
            <button
              onClick={() => setIsNewExpeditionOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Custom</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Expedition Active Card */}
      {currentExpedition && currentExpeditionRecord && (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {/* Cover image banner */}
          <div className="relative h-48 w-full sm:h-56 bg-muted/60 overflow-hidden">
            <img
              src={
                currentExpedition.coverImage ||
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
              }
              alt={currentExpedition.title}
              className="h-full w-full object-cover brightness-[0.75] transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={handleGeneratePoster}
                disabled={generatingPoster}
                className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md hover:bg-black/80 transition-colors disabled:opacity-50"
                title="Generate custom vintage expedition poster art with Gemini"
              >
                {generatingPoster ? (
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                ) : (
                  <ImageIcon className="h-3 w-3 text-amber-400" />
                )}
                <span>AI Poster Art</span>
              </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-primary/90 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary-foreground uppercase tracking-wide">
                  {currentExpedition.status || 'Active'}
                </span>
                <span className="rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-md flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  {currentExpedition.destination}
                </span>
                {currentExpedition.startDate && (
                  <span className="rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-md flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-sky-400" />
                    {currentExpedition.startDate} — {currentExpedition.endDate || 'Ongoing'}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-sm sm:text-2xl">
                {currentExpedition.title}
              </h2>
            </div>
          </div>

          {/* Expedition Details & Summary Bar */}
          <div className="p-4 sm:p-5 border-b border-border/80 bg-card/60 flex flex-col gap-3">
            <p className="text-xs leading-relaxed text-muted-foreground max-w-3xl">
              {currentExpedition.summary}
            </p>

            {currentExpedition.tags && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentExpedition.tags.split(',').map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4 border-t border-border/50">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
                <p className="text-[10px] uppercase font-mono text-muted-foreground">Waypoints</p>
                <p className="font-mono text-base font-bold text-foreground">
                  {visitedCount} / {totalWaypoints}
                </p>
                <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${routeProgress}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
                <p className="text-[10px] uppercase font-mono text-muted-foreground">Gear Packed</p>
                <p className="font-mono text-base font-bold text-foreground">
                  {completedChecklist} / {totalChecklist}
                </p>
                <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
                <p className="text-[10px] uppercase font-mono text-muted-foreground">Audio Guides</p>
                <p className="font-mono text-base font-bold text-foreground">
                  {waypointsRecords.filter((w) => !!w.data.audioUrl).length} ready
                </p>
                <p className="text-[9px] text-muted-foreground mt-1">OpenAI TTS</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
                <p className="text-[10px] uppercase font-mono text-muted-foreground">Logbook Notes</p>
                <p className="font-mono text-base font-bold text-foreground">
                  {notesRecords.length} entries
                </p>
                <p className="text-[9px] text-muted-foreground mt-1">Live Synced</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs for Views */}
          <div className="flex border-b border-border bg-muted/30 px-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('waypoints')}
              className={`flex items-center gap-1.5 py-3 border-b-2 px-3 transition-colors ${
                activeTab === 'waypoints'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Route Waypoints ({totalWaypoints})</span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-1.5 py-3 border-b-2 px-3 transition-colors ${
                activeTab === 'checklist'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>Gear Checklist ({totalChecklist})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 py-3 border-b-2 px-3 transition-colors ${
                activeTab === 'notes'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Field Logbook ({notesRecords.length})</span>
            </button>
          </div>

          {/* Tab 1: Route Waypoints Content */}
          {activeTab === 'waypoints' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Itinerary & Telemetry</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Live meteorological sensors, cultural encyclopedic briefs, and voice tour guides
                  </p>
                </div>
                <button
                  onClick={() => setIsNewWaypointOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Stop</span>
                </button>
              </div>

              {waypointsRecords.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <Compass className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                  <p className="text-xs font-medium text-foreground">No waypoints plotted yet</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Add stops along your expedition route or use the AI Strategist to generate them.
                  </p>
                  <button
                    onClick={() => setIsNewWaypointOpen(true)}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Plot First Waypoint</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {waypointsRecords.map((wpRecord, index) => {
                    const wp = wpRecord.data
                    const isEnriching = enrichingId === wpRecord.recordId

                    return (
                      <div
                        key={wpRecord.recordId}
                        className={`group relative rounded-xl border p-4 transition-all duration-200 ${
                          wp.visited
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-border/80 bg-card hover:border-border'
                        }`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          {/* Left: Checkbox + Info */}
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (wpMutationsReady) {
                                  putWaypoint(wpRecord.recordId, { visited: !wp.visited })
                                }
                              }}
                              className="mt-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                              title={wp.visited ? 'Mark unvisited' : 'Mark visited'}
                            >
                              {wp.visited ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground/60" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted font-mono text-[10px] font-bold text-muted-foreground">
                                  {index + 1}
                                </span>
                                <h4
                                  className={`text-sm font-semibold truncate ${
                                    wp.visited
                                      ? 'line-through text-muted-foreground'
                                      : 'text-foreground'
                                  }`}
                                >
                                  {wp.title}
                                </h4>
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                                  {wp.category}
                                </span>
                              </div>

                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-primary shrink-0" />
                                <span>{wp.location}</span>
                              </p>

                              {wp.notes && (
                                <p className="text-xs text-foreground/90 italic pt-0.5">
                                  &ldquo;{wp.notes}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Telemetry & Actions */}
                          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                            {/* Live Weather Badge */}
                            {wp.weatherJson ? (
                              <WeatherBadge weatherJson={wp.weatherJson} />
                            ) : null}

                            {/* Re-enrich / Refresh Button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleEnrich(wpRecord.recordId, wp.title, wp.location)
                              }
                              disabled={isEnriching}
                              className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted hover:border-border transition-colors disabled:opacity-50"
                              title="Fetch latest OpenWeatherMap conditions, Wikipedia intel, and Audio Guide"
                            >
                              <RefreshCw
                                className={`h-3 w-3 text-primary ${
                                  isEnriching ? 'animate-spin' : ''
                                }`}
                              />
                              <span>{isEnriching ? 'Enriching...' : 'Enrich AI'}</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove waypoint ${wp.title}?`)) {
                                  removeWaypoint(wpRecord.recordId)
                                }
                              }}
                              className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete waypoint"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Encyclopedic Intelligence Box from Wikipedia */}
                        {wp.wikiJson ? <WikiCard wikiJson={wp.wikiJson} /> : null}

                        {/* Audio Field Guide Player from OpenAI TTS */}
                        {wp.audioUrl ? (
                          <div className="mt-3">
                            <AudioPlayer
                              src={wp.audioUrl}
                              title={wp.title}
                              narrator={wp.audioNarrator || 'alloy'}
                            />
                          </div>
                        ) : wp.audioNarrative ? (
                          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-muted/20 border border-border/50 p-2 text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground text-[11px] truncate">
                              <Headphones className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate">&ldquo;{wp.audioNarrative}&rdquo;</span>
                            </div>
                            <button
                              onClick={() =>
                                handleEnrich(wpRecord.recordId, wp.title, wp.location)
                              }
                              disabled={isEnriching}
                              className="text-[10px] text-primary hover:underline font-semibold shrink-0 ml-2"
                            >
                              Synthesize Voice
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Gear Checklist Content */}
          {activeTab === 'checklist' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Expedition Gear & Prep</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Synchronized packing checklist across all team members in real time
                  </p>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {completedChecklist} of {totalChecklist} items packed ({checklistProgress}%)
                </span>
              </div>

              {/* Add Checklist Item Form */}
              <form
                onSubmit={handleAddChecklist}
                className="flex flex-col sm:flex-row gap-2 rounded-xl border border-border bg-muted/20 p-2.5"
              >
                <input
                  type="text"
                  required
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Add item (e.g. Satellite Communicator, Thermal Gloves, Permits)..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <select
                  value={newChecklistCategory}
                  onChange={(e) => setNewChecklistCategory(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="gear">Technical Gear</option>
                  <option value="safety">Safety / First Aid</option>
                  <option value="docs">Docs & Permits</option>
                  <option value="food">Provisions & Water</option>
                  <option value="culture">Clothing & Personal</option>
                </select>
                <button
                  type="submit"
                  disabled={!newChecklistItem.trim() || !chkMutationsReady}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Item</span>
                </button>
              </form>

              {/* Items List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                {checklistRecords.map((itemRecord) => {
                  const item = itemRecord.data
                  return (
                    <div
                      key={itemRecord.recordId}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors ${
                        item.completed
                          ? 'border-emerald-500/30 bg-emerald-500/5 text-muted-foreground'
                          : 'border-border/70 bg-card text-foreground'
                      }`}
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => {
                            if (chkMutationsReady) {
                              putChecklistItem(itemRecord.recordId, {
                                completed: e.target.checked,
                              })
                            }
                          }}
                          className="h-4 w-4 rounded accent-primary shrink-0"
                        />
                        <span className={`truncate ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.item}
                        </span>
                      </label>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-mono uppercase text-muted-foreground">
                          {item.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeChecklistItem(itemRecord.recordId)}
                          className="text-muted-foreground hover:text-destructive p-1"
                          title="Delete item"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Field Notes & Live Logbook Content */}
          {activeTab === 'notes' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Field Logbook & Team Notes</h3>
                <p className="text-[11px] text-muted-foreground">
                  Synchronous observations, trail alerts, wildlife spottings, and camp updates
                </p>
              </div>

              {/* Add Note Form */}
              <form
                onSubmit={handleAddNote}
                className="rounded-xl border border-border bg-muted/20 p-3 space-y-2"
              >
                <textarea
                  rows={2}
                  required
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record observation, hazard report, photo opportunity, or trail condition..."
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[11px] text-muted-foreground">Category:</span>
                    <select
                      value={newNoteCategory}
                      onChange={(e) => setNewNoteCategory(e.target.value)}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                    >
                      <option value="observation">Observation</option>
                      <option value="alert">Hazard / Alert</option>
                      <option value="tip">Insider Tip</option>
                      <option value="photo_note">Photo Note</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={!newNoteContent.trim() || !noteMutationsReady}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Log Entry</span>
                  </button>
                </div>
              </form>

              {/* Log Entries */}
              <div className="space-y-2.5">
                {notesRecords.map((noteRecord) => {
                  const note = noteRecord.data
                  const isAlert = note.category === 'alert'

                  return (
                    <div
                      key={noteRecord.recordId}
                      className={`rounded-xl border p-3 text-xs ${
                        isAlert
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : 'border-border/70 bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">{note.author}</span>
                          <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[9px] uppercase">
                            {note.category}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFieldNote(noteRecord.recordId)}
                          className="text-muted-foreground hover:text-destructive"
                          title="Remove log entry"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed pt-0.5">
                        {note.content}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals & Drawers */}
      <NewExpeditionModal
        isOpen={isNewExpeditionOpen}
        onClose={() => setIsNewExpeditionOpen(false)}
        onCreated={(id) => setSelectedExpeditionId(id)}
      />

      {selectedExpeditionId && (
        <NewWaypointModal
          expeditionId={selectedExpeditionId}
          nextOrder={totalWaypoints + 1}
          isOpen={isNewWaypointOpen}
          onClose={() => setIsNewWaypointOpen(false)}
        />
      )}

      {currentExpedition && (
        <StrategistDrawer
          expedition={currentExpedition}
          waypoints={waypointsRecords.map((w) => w.data)}
          isOpen={isStrategistOpen}
          onClose={() => setIsStrategistOpen(false)}
        />
      )}
    </div>
  )
}
