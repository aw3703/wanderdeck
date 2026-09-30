import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { seo } from '../seo'
import {
  Compass,
  ArrowRight,
  Cloud,
  Headphones,
  BookOpen,
  Sparkles,
  Users,
  CheckCircle2,
  MapPin,
  Radio,
  Layers,
  Zap,
} from 'lucide-react'

export default function Landing() {
  return (
    <>
      <Seo {...seo} path="/" />
      <div
        data-testid="static-landing"
        className="min-h-screen bg-background text-foreground antialiased"
      >
        {/* Navigation Bar */}
        <header className="border-b border-border/70 bg-card/60 backdrop-blur-md sticky top-0 z-40">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-bold tracking-tight text-foreground text-sm sm:text-base">
                WanderDeck
              </span>
              <span className="hidden sm:inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                DeepSpace App
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/home"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
              >
                <span>Launch Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 lg:pt-24 lg:pb-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-xs text-muted-foreground mb-6">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>Real-Time Expedition Telemetry & Voice Narrated Routes</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl sm:leading-[1.1]">
              Collaborative expedition decks with live environmental intelligence.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              WanderDeck turns static travel checklists into living, multiplayer expedition dossiers.
              Enriched on-demand with live meteorological sensors, encyclopedic cultural dossiers,
              voice-synthesized field guides, and AI route strategy.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90 transition-all hover:scale-[1.01]"
              >
                <span>Enter the App</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
              >
                <span>Explore Technical Architecture</span>
              </a>
            </div>
          </div>

          {/* Interactive Mock Deck Preview */}
          <div className="mx-auto mt-14 max-w-5xl rounded-2xl border border-border bg-card/90 shadow-2xl p-4 sm:p-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="font-mono text-xs font-semibold text-foreground ml-2">
                  Iceland South Coast & Glacial Fjords
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 font-mono text-[10px] font-semibold border border-emerald-500/20">
                  RecordRoom DO Connected
                </span>
                <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  3 Waypoints Plotted
                </span>
              </div>
            </div>

            {/* Waypoint Cards Sample Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
              {/* Card 1 */}
              <div className="rounded-xl border border-border/80 bg-background/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-bold text-primary-foreground">
                      1
                    </span>
                    <span className="font-semibold text-sm text-foreground">Seljalandsfoss</span>
                  </div>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase font-mono text-muted-foreground">
                    Waterfall
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-lg bg-muted/40 border border-border/60 px-2.5 py-1 text-xs">
                  <Cloud className="h-3.5 w-3.5 text-blue-400" />
                  <span className="font-mono font-bold text-foreground">7°C</span>
                  <span className="text-[11px] text-muted-foreground">Light Rain · 88% Hum</span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  60-meter drop fed by Eyjafjallajökull glacier. Trail leads completely behind the roaring veil.
                </p>

                <div className="rounded-lg border border-border/60 bg-card p-2 text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground font-medium">
                    <Headphones className="h-3 w-3 text-primary" />
                    <span>OpenAI TTS Voice Guide</span>
                  </span>
                  <span className="font-mono text-muted-foreground">0:42</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-xl border border-border/80 bg-background/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted font-mono text-[10px] font-bold text-muted-foreground">
                      2
                    </span>
                    <span className="font-semibold text-sm text-foreground">Reynisfjara Beach</span>
                  </div>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase font-mono text-muted-foreground">
                    Coastal
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-lg bg-muted/40 border border-border/60 px-2.5 py-1 text-xs">
                  <Cloud className="h-3.5 w-3.5 text-slate-300" />
                  <span className="font-mono font-bold text-foreground">6°C</span>
                  <span className="text-[11px] text-muted-foreground">Overcast · 8.5 m/s Wind</span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Hexagonal basalt column cliffs and Atlantic sea stacks. High hazard warning for sneaker waves.
                </p>

                <div className="rounded-lg border border-border/60 bg-card p-2 text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground font-medium">
                    <Headphones className="h-3 w-3 text-primary" />
                    <span>OpenAI TTS Voice Guide</span>
                  </span>
                  <span className="font-mono text-muted-foreground">0:38</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-xl border border-border/80 bg-background/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted font-mono text-[10px] font-bold text-muted-foreground">
                      3
                    </span>
                    <span className="font-semibold text-sm text-foreground">Jökulsárlón Lagoon</span>
                  </div>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase font-mono text-muted-foreground">
                    Glacier
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 rounded-lg bg-muted/40 border border-border/60 px-2.5 py-1 text-xs">
                  <Cloud className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-mono font-bold text-foreground">4°C</span>
                  <span className="text-[11px] text-muted-foreground">Sub-arctic · 91% Hum</span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Ancient electric-blue icebergs calving from Vatnajökull drifting out toward Diamond Beach.
                </p>

                <div className="rounded-lg border border-border/60 bg-card p-2 text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground font-medium">
                    <Headphones className="h-3 w-3 text-primary" />
                    <span>OpenAI TTS Voice Guide</span>
                  </span>
                  <span className="font-mono text-muted-foreground">0:45</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature & Integrations Architecture Grid */}
        <section id="features" className="border-t border-border/80 bg-muted/20 py-16 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Powered by DeepSpace SDK Primitives & Integrations
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
                Engineered to demonstrate full-stack real-time collaboration with Cloudflare Workers and platform services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Integration 1 */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Cloud className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">OpenWeatherMap Integration</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Live meteorological telemetry. Fetches real-time temperature, wind, humidity, and barometric conditions for any global waypoint.
                </p>
                <span className="inline-block rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  openweathermap/current
                </span>
              </div>

              {/* Integration 2 */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Wikipedia Intelligence</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Extracts verified encyclopedic summaries, historical backgrounds, cultural heritage data, and thumbnail imagery for points of interest.
                </p>
                <span className="inline-block rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  wikipedia/get-page-summary
                </span>
              </div>

              {/* Integration 3 */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <Headphones className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Audio Field Guides</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Converts the combined cultural and meteorological briefing into voice-narrated MP3 audio tour clips with in-browser playback controls.
                </p>
                <span className="inline-block rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  speech/text-to-speech
                </span>
              </div>

              {/* Integration 4 */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Claude AI Expedition Strategist</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generates complete multi-day expedition itineraries and answers tactical questions on gear, weather hazards, and route pacing.
                </p>
                <span className="inline-block rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  anthropic/chat-completion
                </span>
              </div>
            </div>

            {/* Core DeepSpace Architecture Features */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">Durable Objects & RecordRooms</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Four synchronized collections (expeditions, waypoints, checklists, fieldnotes) backed by SQLite storage and RBAC permissions.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-foreground">Multiplayer Real-Time Presence</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Watch team members view and edit the expedition live. Checkbox toggles and new waypoints reflect across browser tabs instantly.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-foreground">Atomic Server Actions</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Privileged worker actions (`enrichWaypoint`, `generateExpedition`, `askStrategist`) orchestrate writes and third-party APIs seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/70 py-10 px-4 text-center text-xs text-muted-foreground">
          <p>© 2026 WanderDeck. Built and deployed on DeepSpace Cloudflare Workers.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link to="/home" className="hover:text-foreground transition-colors">
              App Home
            </Link>
            <span>·</span>
            <a
              href="https://github.com/aw3703/wanderdeck"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub Repository
            </a>
            <span>·</span>
            <a
              href="https://docs.deep.space"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              DeepSpace Docs
            </a>
          </div>
        </footer>
      </div>
    </>
  )
}
