export interface Expedition {
  title: string
  destination: string
  country: string
  summary: string
  coverImage?: string
  tags?: string
  startDate?: string
  endDate?: string
  status?: 'planning' | 'in_progress' | 'completed'
  aiBriefing?: string
}

export interface WeatherData {
  temp?: number
  feels_like?: number
  humidity?: number
  description?: string
  icon?: string
  wind_speed?: number
  sunrise?: number
  sunset?: number
}

export interface WikiData {
  title?: string
  description?: string
  extract?: string
  url?: string
  thumbnail?: {
    source?: string
  }
}

export interface Waypoint {
  expeditionId: string
  title: string
  location: string
  category: 'nature' | 'landmark' | 'food' | 'culture' | 'stay' | 'summit' | 'waterfall' | 'glacier' | string
  lat?: string
  lon?: string
  order: number
  visited: boolean
  notes?: string
  weatherJson?: string
  wikiJson?: string
  audioUrl?: string
  audioNarrator?: string
  audioNarrative?: string
}

export interface ChecklistItem {
  expeditionId: string
  item: string
  category: 'gear' | 'safety' | 'docs' | 'food' | 'culture' | string
  completed: boolean
  assignedTo?: string
}

export interface FieldNote {
  expeditionId: string
  author: string
  content: string
  waypointTitle?: string
  category: 'observation' | 'tip' | 'alert' | 'photo_note' | string
}
