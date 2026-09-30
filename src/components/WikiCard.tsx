import { useState } from 'react'
import { BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import type { WikiData } from '../types'

interface WikiCardProps {
  wikiJson?: string
}

export function WikiCard({ wikiJson }: WikiCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!wikiJson) return null

  let data: WikiData | null = null
  try {
    data = JSON.parse(wikiJson) as WikiData
  } catch {
    return null
  }

  if (!data || !data.extract) return null

  const needsTruncation = data.extract.length > 140

  return (
    <div className="mt-2.5 rounded-xl border border-border/70 bg-gradient-to-br from-card/80 to-muted/20 p-3 text-xs shadow-xs transition-all">
      <div className="flex items-start gap-3">
        {data.thumbnail?.source ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
            <img
              src={data.thumbnail.source}
              alt={data.title || 'Wikipedia Thumbnail'}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <BookOpen className="h-5 w-5" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-foreground truncate">
                {data.title}
              </span>
              {data.description && (
                <span className="hidden sm:inline-block font-normal text-muted-foreground text-[11px] truncate max-w-[200px]">
                  · {data.description}
                </span>
              )}
            </div>

            {data.url && (
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-primary hover:bg-muted transition-colors shrink-0"
                title="View full Wikipedia encyclopedia article"
              >
                <span>Wikipedia</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>

          <p className={`text-[11px] leading-relaxed text-muted-foreground ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {data.extract}
          </p>

          {needsTruncation && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary hover:underline pt-0.5 cursor-pointer"
            >
              <span>{isExpanded ? 'Show less' : 'Read full brief'}</span>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
