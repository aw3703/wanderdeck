import { useState } from 'react'
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
} from 'lucide-react'
import type { WeatherData } from '../types'

interface WeatherBadgeProps {
  weatherJson?: string
  className?: string
}

export function WeatherBadge({ weatherJson, className = '' }: WeatherBadgeProps) {
  const [unit, setUnit] = useState<'C' | 'F'>('C')

  if (!weatherJson) return null

  let data: WeatherData | null = null
  try {
    data = JSON.parse(weatherJson) as WeatherData
  } catch {
    return null
  }

  if (!data || data.temp === undefined) return null

  const tempC = Math.round(data.temp)
  const tempF = Math.round((data.temp * 9) / 5 + 32)
  const displayTemp = unit === 'C' ? `${tempC}°C` : `${tempF}°F`

  const feelsLikeC = data.feels_like !== undefined ? Math.round(data.feels_like) : null
  const feelsLikeF = feelsLikeC !== null ? Math.round((feelsLikeC * 9) / 5 + 32) : null
  const displayFeelsLike = unit === 'C' ? `${feelsLikeC}°C` : `${feelsLikeF}°F`

  const desc = data.description || 'Clear'
  const isRain = desc.toLowerCase().includes('rain') || desc.toLowerCase().includes('drizzle')
  const isSnow = desc.toLowerCase().includes('snow')
  const isCloud = desc.toLowerCase().includes('cloud') || desc.toLowerCase().includes('overcast')

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/90 px-3 py-1.5 text-xs shadow-xs backdrop-blur-md transition-all hover:border-primary/40 ${className}`}
    >
      <button
        type="button"
        onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
        title="Click to toggle °C / °F"
      >
        {isSnow ? (
          <CloudSnow className="h-4 w-4 text-cyan-400 shrink-0" />
        ) : isRain ? (
          <CloudRain className="h-4 w-4 text-blue-400 shrink-0" />
        ) : isCloud ? (
          <Cloud className="h-4 w-4 text-slate-300 shrink-0" />
        ) : (
          <Sun className="h-4 w-4 text-amber-400 shrink-0" />
        )}
        <span className="font-mono font-bold text-foreground text-sm tracking-tight">
          {displayTemp}
        </span>
      </button>

      <div className="flex flex-col">
        <span className="capitalize text-foreground font-medium text-[11px] truncate max-w-[120px]">
          {desc}
        </span>
        {feelsLikeC !== null && (
          <span className="text-[10px] text-muted-foreground">
            Feels {displayFeelsLike}
          </span>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-2.5 border-l border-border/60 pl-2.5 text-[11px] text-muted-foreground font-mono">
        {data.humidity !== undefined && (
          <span className="flex items-center gap-1" title="Relative Humidity">
            <Droplets className="h-3 w-3 text-sky-400" />
            {data.humidity}%
          </span>
        )}
        {data.wind_speed !== undefined && (
          <span className="flex items-center gap-1" title="Wind Speed">
            <Wind className="h-3 w-3 text-emerald-400" />
            {data.wind_speed} m/s
          </span>
        )}
      </div>
    </div>
  )
}
