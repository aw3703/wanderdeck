import type { ActionHandler, ActionTools } from 'deepspace/worker'
import type { Env } from '../../worker'
import { FLAGSHIP_TRIPS } from '../flagship-data.js'

interface WeatherResponse {
  temp?: number
  feels_like?: number
  humidity?: number
  description?: string
  icon?: string
  wind_speed?: number
  sunrise?: number
  sunset?: number
}

interface WikiResponse {
  title?: string
  description?: string
  extract?: string
  url?: string
  thumbnail?: {
    source?: string
  }
}

interface SpeechResponse {
  audioUrl?: string
  voice?: string
  format?: string
}

interface ClaudeResponse {
  content?: Array<{
    type?: string
    text?: string
  }>
}

interface GeminiImageResponse {
  base64Images?: string[]
}

export const actions: Record<string, ActionHandler<Env>> = {
  /**
   * Enriches a waypoint with OpenWeatherMap weather, Wikipedia cultural summary,
   * and an OpenAI TTS Audio Tour Guide recording, persisting updates onto the record.
   */
  enrichWaypoint: async ({ params, tools }) => {
    const waypointId = params.waypointId as string
    const title = (params.title as string) || 'Destination'
    const location = (params.location as string) || title
    const narrator = (params.narrator as string) || 'alloy'

    if (!waypointId) {
      return { success: false, error: 'Missing waypointId' }
    }

    let weatherData: WeatherResponse | null = null
    let wikiData: WikiResponse | null = null
    let audioUrl = ''
    let narrative = ''

    // 1. Fetch live weather from OpenWeatherMap
    try {
      const weatherRes = await tools.integration<WeatherResponse>('openweathermap/current', {
        q: location,
        units: 'metric',
      })
      if (weatherRes.success && weatherRes.data) {
        weatherData = weatherRes.data
      }
    } catch (err) {
      console.warn('Weather fetch warning:', err)
    }

    // 2. Fetch encyclopedic intelligence from Wikipedia
    try {
      const wikiRes = await tools.integration<WikiResponse>('wikipedia/get-page-summary', {
        title: title,
      })
      if (wikiRes.success && wikiRes.data) {
        wikiData = wikiRes.data
      } else {
        // Fallback to searching location
        const locationWikiRes = await tools.integration<WikiResponse>('wikipedia/get-page-summary', {
          title: location,
        })
        if (locationWikiRes.success && locationWikiRes.data) {
          wikiData = locationWikiRes.data
        }
      }
    } catch (err) {
      console.warn('Wiki fetch warning:', err)
    }

    // 3. Compose a captivating audio field guide narration
    const weatherSnippet = weatherData
      ? `Conditions are currently ${weatherData.description ?? 'clear'} around ${Math.round(weatherData.temp ?? 20)} degrees Celsius with ${weatherData.humidity ?? 50}% humidity.`
      : ''
    const wikiSnippet = wikiData?.extract
      ? wikiData.extract.split('.').slice(0, 3).join('. ') + '.'
      : `${title} is a standout waypoint on our expedition route.`

    narrative = `Welcome to ${title}. ${wikiSnippet} ${weatherSnippet} Keep your compass calibrated and stay observant.`

    // 4. Synthesize voice audio via OpenAI TTS (speech/text-to-speech)
    try {
      const speechRes = await tools.integration<SpeechResponse>('speech/text-to-speech', {
        model: 'tts-1',
        voice: narrator,
        input: narrative,
        response_format: 'mp3',
      })
      if (speechRes.success && speechRes.data?.audioUrl) {
        audioUrl = speechRes.data.audioUrl
      }
    } catch (err) {
      console.warn('Speech synthesis warning:', err)
    }

    // 5. Update the waypoint record in DeepSpace
    const patch: Record<string, unknown> = {
      audioNarrative: narrative,
    }
    if (weatherData) {
      patch.weatherJson = JSON.stringify(weatherData)
    }
    if (wikiData) {
      patch.wikiJson = JSON.stringify(wikiData)
    }
    if (audioUrl) {
      patch.audioUrl = audioUrl
      patch.audioNarrator = narrator
    }

    await tools.update('waypoints', waypointId, patch)

    return {
      success: true,
      data: {
        waypointId,
        weather: weatherData,
        wiki: wikiData,
        audioUrl,
        narrative,
      },
    }
  },

  /**
   * Field Strategist AI advisor powered by Anthropic Claude (claude-haiku-4-5)
   */
  askStrategist: async ({ params, tools }) => {
    const prompt = params.prompt as string
    const expeditionTitle = (params.expeditionTitle as string) || 'Current Expedition'
    const destination = (params.destination as string) || 'Exploration Region'
    const waypointsSummary = (params.waypointsSummary as string) || ''

    if (!prompt) {
      return { success: false, error: 'Prompt is required' }
    }

    const systemPrompt = `You are the lead Expedition Strategist and Field Commander for WanderDeck.
You provide tactical, practical, concise, and inspiring field intelligence for real-world explorers.
Ground your answers with specific tips on terrain, pacing, timing (e.g. golden hour, avoiding peak crowds), local etiquette, weather preparations, and essential gear.
Current Expedition: "${expeditionTitle}" in ${destination}.
Planned Waypoints: ${waypointsSummary || 'Route under active scouting'}.
Format response in clean Markdown with clear bullet points.`

    try {
      const res = await tools.integration<ClaudeResponse>('anthropic/chat-completion', {
        model: 'claude-haiku-4-5',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      })

      if (!res.success || !res.data) {
        return { success: false, error: res.error || 'Failed to query Field Strategist' }
      }

      const text = res.data.content?.find((c) => c.type === 'text')?.text ?? 'No tactical response received.'
      return {
        success: true,
        data: { text },
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return { success: false, error: msg }
    }
  },

  /**
   * Generates a complete structured expedition using Anthropic Claude,
   * inserting the expedition, waypoints, and gear checklist into DeepSpace collections.
   */
  generateExpedition: async ({ params, tools, userId }) => {
    const destination = params.destination as string
    const style = (params.style as string) || 'adventure & nature'
    const days = Number(params.days) || 3

    if (!destination) {
      return { success: false, error: 'Destination is required' }
    }

    const prompt = `Create a realistic, exciting ${days}-day expedition itinerary for: "${destination}" with style: "${style}".
Respond ONLY with a valid JSON object matching this schema without any markdown fence or backticks:
{
  "title": "Short punchy expedition title",
  "destination": "${destination}",
  "country": "Country name",
  "summary": "2-sentence inspiring overview of the journey",
  "coverImage": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "tags": "exploration, nature, trek",
  "startDate": "Day 1",
  "endDate": "Day ${days}",
  "waypoints": [
    {
      "title": "Exact landmark/place name",
      "location": "City or Region name for weather lookup",
      "category": "nature" | "landmark" | "food" | "culture" | "summit",
      "lat": "approx lat e.g. 64.1466",
      "lon": "approx lon e.g. -21.9426",
      "notes": "1-sentence tactical tip or insight"
    }
  ],
  "checklists": [
    { "item": "Gear item description", "category": "gear" | "safety" | "docs" | "food" }
  ]
}
Include between 4 and 6 realistic waypoints and 5 gear checklist items.`

    try {
      const aiRes = await tools.integration<ClaudeResponse>('anthropic/chat-completion', {
        model: 'claude-haiku-4-5',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      })

      if (!aiRes.success || !aiRes.data) {
        return { success: false, error: aiRes.error || 'Failed to generate expedition' }
      }

      const rawText = aiRes.data.content?.find((c) => c.type === 'text')?.text ?? ''
      // Strip markdown code fences if present
      const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(cleanedJson) as {
        title: string
        destination: string
        country: string
        summary: string
        coverImage?: string
        tags?: string
        startDate?: string
        endDate?: string
        waypoints: Array<{
          title: string
          location: string
          category?: string
          lat?: string
          lon?: string
          notes?: string
        }>
        checklists: Array<{
          item: string
          category?: string
        }>
      }

      // 1. Create Expedition record
      const expRes = await tools.create('expeditions', {
        title: parsed.title,
        destination: parsed.destination,
        country: parsed.country,
        summary: parsed.summary,
        coverImage: parsed.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
        tags: parsed.tags || 'expedition',
        startDate: parsed.startDate || 'Day 1',
        endDate: parsed.endDate || `Day ${days}`,
        status: 'planning',
        aiBriefing: parsed.summary,
      })

      if (!expRes.success || !expRes.data?.recordId) {
        return { success: false, error: 'Failed to create expedition record' }
      }

      const expeditionId = expRes.data.recordId

      // 2. Create Waypoints
      if (Array.isArray(parsed.waypoints)) {
        for (let i = 0; i < parsed.waypoints.length; i++) {
          const wp = parsed.waypoints[i]
          await tools.create('waypoints', {
            expeditionId,
            title: wp.title,
            location: wp.location || parsed.destination,
            category: wp.category || 'landmark',
            lat: wp.lat || '',
            lon: wp.lon || '',
            order: i + 1,
            visited: false,
            notes: wp.notes || '',
            weatherJson: '',
            wikiJson: '',
            audioUrl: '',
            audioNarrator: 'alloy',
            audioNarrative: '',
          })
        }
      }

      // 3. Create Checklists
      if (Array.isArray(parsed.checklists)) {
        for (const item of parsed.checklists) {
          await tools.create('checklists', {
            expeditionId,
            item: item.item,
            category: item.category || 'gear',
            completed: false,
            assignedTo: userId || 'Team',
          })
        }
      }

      return {
        success: true,
        data: {
          expeditionId,
          title: parsed.title,
          waypointCount: parsed.waypoints?.length ?? 0,
        },
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return { success: false, error: msg }
    }
  },

  /**
   * Generates a vintage expedition travel poster using Gemini image model
   */
  generatePoster: async ({ params, tools }) => {
    const prompt = params.prompt as string
    const expeditionId = params.expeditionId as string | undefined

    if (!prompt) {
      return { success: false, error: 'Prompt is required' }
    }

    const enhancedPrompt = `Vintage travel expedition poster art, national geographic aesthetics, atmospheric scenic vista of ${prompt}, high aesthetic, clean composition, artistic, retro silkscreen style.`

    try {
      const imgRes = await tools.integration<GeminiImageResponse>('gemini/generate-image', {
        prompt: enhancedPrompt,
        model: 'gemini-2.5-flash-image',
        aspectRatio: '16:9',
      })

      if (!imgRes.success || !imgRes.data?.base64Images?.[0]) {
        return { success: false, error: imgRes.error || 'Failed to generate poster' }
      }

      const imageUrl = imgRes.data.base64Images[0]

      if (expeditionId) {
        await tools.update('expeditions', expeditionId, {
          coverImage: imageUrl,
        })
      }

      return {
        success: true,
        data: { imageUrl },
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return { success: false, error: msg }
    }
  },

  /**
   * Pre-seeds initial curated flagship expeditions if the collection is fresh.
   */
  seedSampleData: async ({ tools }) => {
    const existing = await tools.query('expeditions', { limit: 1 })
    if (existing.success && existing.data?.records && existing.data.records.length > 0) {
      return { success: true, data: { message: 'Expeditions already populated' } }
    }

    const flagshipTrips = FLAGSHIP_TRIPS

    for (const trip of flagshipTrips) {
      const expRes = await tools.create('expeditions', {
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

      if (expRes.success && expRes.data?.recordId) {
        const expeditionId = expRes.data.recordId

        for (const wp of trip.waypoints) {
          await tools.create('waypoints', {
            expeditionId,
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
          await tools.create('checklists', {
            expeditionId,
            item: chk.item,
            category: chk.category,
            completed: chk.completed,
            assignedTo: 'Field Team',
          })
        }

        // Add initial field note
        await tools.create('fieldnotes', {
          expeditionId,
          author: 'Navigator',
          content: `Initialized expedition deck for ${trip.destination}. Route scouting completed.`,
          waypointTitle: trip.waypoints[0]?.title || '',
          category: 'observation',
        })
      }
    }

    return { success: true, data: { seeded: flagshipTrips.length } }
  },
}
