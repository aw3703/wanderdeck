import { BookOpen, ExternalLink } from 'lucide-react'
import type { WikiData } from '../types'

interface WikiCardProps {
  wikiJson?: string
}

export function WikiCard({ wikiJson }: WikiCardProps) {
  if (!wikiJson) return null

  let data: WikiData | null = null
  try {
    data = JSON.parse(wikiJson) as WikiData
  } catch {
    return null
  }

  if (!data || !data.extract) return null

  return (
    <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs">
      <div className="flex items-start gap-2.5">
        {data.thumbnail?.source ? (
          <img
            src={data.thumbnail.source}
            alt={data.title || 'Wikipedia Thumbnail'}
            className="h-12 w-12 rounded object-cover shrink-0 border border-border/50"
            loading="lazy"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary shrink-0">
            <BookOpen className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 pb-1">
            <span className="font-semibold text-foreground truncate">
              {data.title}
              {data.description && (
                <span className="ml-1.5 font-normal text-muted-foreground text-[11px]">
                  ({data.description})
                </span>
              )}
            </span>
            {data.url && (
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline shrink-0"
              >
                <span>Wikipedia</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {data.extract}
          </p>
        </div>
      </div>
    </div>
  )
}
