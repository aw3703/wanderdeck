import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Headphones,
  RotateCcw,
  Sparkles,
  Radio,
} from 'lucide-react'

interface AudioPlayerProps {
  src?: string
  narrative?: string
  title: string
  narrator?: string
}

export function AudioPlayer({ src, narrative, title, narrator = 'alloy' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [usingSpeechSynth, setUsingSpeechSynth] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setUsingSpeechSynth(false)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [src, narrative])

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const startSpeechSynth = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !narrative) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(narrative)
    utterance.rate = playbackRate
    utterance.pitch = 1.0

    // Set voice if available
    const voices = window.speechSynthesis.getVoices()
    const naturalVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')))
    if (naturalVoice) utterance.voice = naturalVoice

    utterance.onstart = () => {
      setIsPlaying(true)
      setUsingSpeechSynth(true)
      setDuration(Math.max(15, Math.round(narrative.length / 15)))
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      setUsingSpeechSynth(false)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setUsingSpeechSynth(false)
    }

    synthRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const togglePlay = () => {
    // If has audio URL, try native audio first
    if (src && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Native audio play error, falling back to speech synthesis:', err)
            if (narrative) {
              startSpeechSynth()
            } else {
              setIsPlaying(false)
            }
          })
      }
      return
    }

    // Fallback: browser speech synthesis of narrative
    if (narrative) {
      if (isPlaying) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
        setIsPlaying(false)
        setUsingSpeechSynth(false)
      } else {
        startSpeechSynth()
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current && !usingSpeechSynth) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    setCurrentTime(time)
    if (audioRef.current && !usingSpeechSynth) {
      audioRef.current.currentTime = time
    }
  }

  const cycleSpeed = () => {
    const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : playbackRate === 1.5 ? 2.0 : 1
    setPlaybackRate(nextRate)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate
    }
    if (usingSpeechSynth && isPlaying) {
      startSpeechSynth()
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="rounded-xl border border-border/80 bg-gradient-to-br from-card to-muted/20 p-3.5 shadow-sm backdrop-blur-sm space-y-2.5 transition-all">
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Headphones className="h-4 w-4" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
            )}
          </div>
          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-foreground truncate">Audio Field Guide</p>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-primary uppercase">
                {src ? `${narrator} voice` : 'Synthesizer'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3 px-1">
              <span className="w-0.5 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-0.5 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-0.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
            </div>
          )}
          <button
            type="button"
            onClick={cycleSpeed}
            className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[10px] font-medium text-foreground hover:bg-muted transition-colors"
            title="Cycle playback speed"
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      {/* Narrative Snippet Preview */}
      {narrative && (
        <p className="text-xs leading-relaxed text-foreground/80 italic line-clamp-2 bg-background/60 p-2 rounded-lg border border-border/40">
          &ldquo;{narrative}&rdquo;
        </p>
      )}

      {/* Progress & Scrubbing Bar */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          aria-label="Audio scrubber"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
        />
        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all"
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (audioRef.current && !usingSpeechSynth) {
                audioRef.current.currentTime = 0
                setCurrentTime(0)
              } else if (usingSpeechSynth) {
                startSpeechSynth()
              }
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Restart narration"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <span className="text-[11px] text-muted-foreground">
            {usingSpeechSynth ? 'TTS Voice Engine' : src ? 'High-Def Audio MP3' : 'Ready'}
          </span>
        </div>

        {src && (
          <button
            type="button"
            onClick={toggleMute}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  )
}
