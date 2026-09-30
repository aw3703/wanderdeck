import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from 'lucide-react'
import type { WeatherData } from '../types'

interface WeatherBadgeProps {
  weatherJson?: string
  className?: string
}

export function WeatherBadge({ weatherJson, className = '' }: WeatherBadgeProps) {
  if (!weatherJson) return null

  let data: WeatherData | null = null
  try {
    data = JSON.parse(weatherJson) as WeatherData
  } catch {
    return null
  }

  if (!data || data.temp === undefined) return null

  const temp = Math.round(data.temp)
  const desc = data.description || 'Clear'
  const isRain = desc.toLowerCase().includes('rain') || desc.toLowerCase().includes('drizzle')
  const isSnow = desc.toLowerCase().includes('snow')
  const isCloud = desc.toLowerCase().includes('cloud') || desc.toLowerCase().includes('overcast')

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-lg border border-border/70 bg-card/80 px-2.5 py-1.5 text-xs backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center gap-1.5">
        {isSnow ? (
          <CloudSnow className="h-4 w-4 text-cyan-400" />
        ) : isRain ? (
          <CloudRain className="h-4 w-4 text-blue-400" />
        ) : isCloud ? (
          <Cloud className="h-4 w-4 text-slate-300" />
        ) : (
          <Sun className="h-4 w-4 text-amber-400" />
        )}
        <span className="font-mono font-bold text-foreground text-sm">{temp}°C</span>
      </div>

      <span className="capitalize text-muted-foreground truncate max-w-[120px]">{desc}</span>

      <div className="hidden sm:flex items-center gap-2 border-l border-border/50 pl-2 text-[11px] text-muted-foreground">
        {data.humidity !== undefined && (
          <span className="flex items-center gap-0.5" title="Humidity">
            <Droplets className="h-3 w-3 text-blue-400/80" />
            {data.humidity}%
          </span>
        )}
        {data.wind_speed !== undefined && (
          <span className="flex items-center gap-0.5" title="Wind speed">
            <Wind className="h-3 w-3 text-teal-400/80" />
            {data.wind_speed} m/s
          </span>
        )}
      </div>
    </div>
  )
}
