export interface FlagshipTrip {
  title: string
  destination: string
  country: string
  summary: string
  coverImage: string
  tags: string
  startDate: string
  endDate: string
  status: 'planning' | 'in_progress' | 'completed'
  aiBriefing: string
  waypoints: {
    title: string
    location: string
    category: 'nature' | 'waterfall' | 'glacier' | 'culture' | 'summit' | 'coastal'
    lat: string
    lon: string
    order: number
    visited: boolean
    notes: string
    wikiJson: string
    weatherJson: string
    audioNarrative: string
  }[]
  checklists: {
    item: string
    category: string
    completed: boolean
  }[]
}

export const FLAGSHIP_TRIPS: FlagshipTrip[] = [
  {
    title: 'Iceland South Coast & Glacial Fjords',
    destination: 'Vik, Iceland',
    country: 'Iceland',
    summary:
      'Traverse volcanic black sand beaches, thundering sub-arctic waterfalls, and crystalline blue ice caves.',
    coverImage:
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
    tags: 'glaciers, waterfalls, arctic, ring road',
    startDate: '2026-10-10',
    endDate: '2026-10-16',
    status: 'in_progress',
    aiBriefing:
      'High wind warnings common along south coast cliffs. Waterproof shell and crampons required for glacier access.',
    waypoints: [
      {
        title: 'Seljalandsfoss',
        location: 'Seljalandsfoss, Iceland',
        category: 'waterfall',
        lat: '63.6156',
        lon: '-19.9886',
        order: 1,
        visited: true,
        notes: 'Path goes completely behind the waterfall. Waterproof layers mandatory.',
        wikiJson: JSON.stringify({
          title: 'Seljalandsfoss',
          description: 'Waterfall in Iceland',
          extract:
            'Seljalandsfoss is a waterfall in Iceland located in the South Region right by Route 1. The waterfall drops 60 m and is part of the Seljalands River that has its origin in the volcanic glacier Eyjafjallajökull.',
          url: 'https://en.wikipedia.org/wiki/Seljalandsfoss',
        }),
        weatherJson: JSON.stringify({
          temp: 7,
          feels_like: 4,
          description: 'light rain',
          humidity: 88,
          wind_speed: 6.2,
        }),
        audioNarrative:
          'Welcome to Seljalandsfoss. Fed by the Eyjafjallajökull volcano glacier, this sixty-meter waterfall allows explorers to walk directly behind the roaring veil of water.',
      },
      {
        title: 'Reynisfjara Beach',
        location: 'Vik, Iceland',
        category: 'nature',
        lat: '63.4057',
        lon: '-19.0716',
        order: 2,
        visited: false,
        notes: 'Watch out for sleeper waves. Hexagonal basalt column sea stacks.',
        wikiJson: JSON.stringify({
          title: 'Reynisfjara',
          description: 'Black sand beach in Iceland',
          extract:
            'Reynisfjara is a world-famous black-sand beach situated on the South Coast of Iceland, immediately beside the small fishing village of Vík í Mýrdal. It features enormous basalt stacks and roaring Atlantic waves.',
          url: 'https://en.wikipedia.org/wiki/Reynisfjara',
        }),
        weatherJson: JSON.stringify({
          temp: 6,
          feels_like: 2,
          description: 'broken clouds',
          humidity: 82,
          wind_speed: 8.5,
        }),
        audioNarrative:
          'Standing on the volcanic black sands of Reynisfjara, the Gardar basalt columns rise like an ancient organ. Never turn your back to the sea here—the Atlantic waves are legendary.',
      },
      {
        title: 'Jökulsárlón Glacier Lagoon',
        location: 'Jokulsarlon, Iceland',
        category: 'glacier',
        lat: '64.0484',
        lon: '-16.1794',
        order: 3,
        visited: false,
        notes: 'Floating ancient icebergs drifting to Diamond Beach. Zodiac boat launch.',
        wikiJson: JSON.stringify({
          title: 'Jökulsárlón',
          description: 'Large glacial lagoon in southeast Iceland',
          extract:
            'Jökulsárlón is a large glacial lake in southeast Iceland, on the edge of Vatnajökull National Park. It developed into a lake after the glacier started receding from the edge of the Atlantic Ocean.',
          url: 'https://en.wikipedia.org/wiki/J%C3%B6kuls%C3%A1rl%C3%B3n',
        }),
        weatherJson: JSON.stringify({
          temp: 4,
          feels_like: 0,
          description: 'overcast clouds',
          humidity: 91,
          wind_speed: 5.1,
        }),
        audioNarrative:
          'Here at Jökulsárlón, colossal chunks of electric blue ice break away from Vatnajökull and drift serenely toward the black sands of Diamond Beach.',
      },
    ],
    checklists: [
      { item: 'Gore-Tex waterproof hardshell jacket & pants', category: 'gear', completed: true },
      { item: 'Microspikes / crampons for icy trailheads', category: 'safety', completed: true },
      { item: 'All-weather GPS tracker & emergency beacon', category: 'safety', completed: false },
      { item: 'International Drivers Permit & 4x4 rental insurance', category: 'docs', completed: true },
      { item: 'Thermos for hot Icelandic tea & trail broth', category: 'food', completed: false },
    ],
  },
  {
    title: 'Tokyo Heritage Trails & Shitamachi Alleyways',
    destination: 'Tokyo, Japan',
    country: 'Japan',
    summary:
      'Explore historic merchant quarters, hidden kissaten coffee shops, and sacred Edo temples amidst modern metropolis.',
    coverImage:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    tags: 'culture, history, urban, culinary',
    startDate: '2026-11-04',
    endDate: '2026-11-10',
    status: 'planning',
    aiBriefing:
      'Best explored early morning before temple crowds. Carry cash for traditional yatai stalls and coin lockers.',
    waypoints: [
      {
        title: 'Sensō-ji',
        location: 'Asakusa, Tokyo',
        category: 'culture',
        lat: '35.7148',
        lon: '139.7967',
        order: 1,
        visited: false,
        notes: 'Oldest Buddhist temple in Tokyo. Incense burner ritual at main hall.',
        wikiJson: JSON.stringify({
          title: 'Sensō-ji',
          description: 'Ancient Buddhist temple in Asakusa, Tokyo',
          extract:
            "Sensō-ji is an ancient Buddhist temple located in Asakusa, Tokyo, Japan. It is Tokyo's oldest-established temple, and one of its most significant, dedicated to Kannon Bodhisattva.",
          url: 'https://en.wikipedia.org/wiki/Sens%C5%8D-ji',
        }),
        weatherJson: JSON.stringify({
          temp: 18,
          feels_like: 17,
          description: 'clear sky',
          humidity: 55,
          wind_speed: 3.1,
        }),
        audioNarrative:
          "Welcome to Sensō-ji, founded in the year 645. Passing under the giant red Kaminarimon thunder gate, you enter Tokyo's deepest historic heartbeat.",
      },
      {
        title: 'Meiji Jingu',
        location: 'Shibuya, Tokyo',
        category: 'nature',
        lat: '35.6764',
        lon: '139.6993',
        order: 2,
        visited: false,
        notes: 'Serene forested shrine. 100,000 trees donated from across Japan.',
        wikiJson: JSON.stringify({
          title: 'Meiji Shrine',
          description: 'Shinto shrine in Shibuya, Tokyo',
          extract:
            'Meiji Shrine is a Shinto shrine in Shibuya, Tokyo, dedicated to the deified spirits of Emperor Meiji and his wife, Empress Shōken, surrounded by a 170-acre evergreen forest.',
          url: 'https://en.wikipedia.org/wiki/Meiji_Shrine',
        }),
        weatherJson: JSON.stringify({
          temp: 19,
          feels_like: 18,
          description: 'few clouds',
          humidity: 52,
          wind_speed: 2.8,
        }),
        audioNarrative:
          'Step into the tranquil cedar forest of Meiji Jingu, a sacred green sanctuary insulated from the pulse of Harajuku.',
      },
    ],
    checklists: [
      { item: 'IC Card (Suica/Pasmo) loaded for Tokyo Metro', category: 'docs', completed: true },
      { item: 'Comfortable slip-on walking shoes for temple entrances', category: 'gear', completed: false },
      { item: 'Pocket Wi-Fi / eSIM connectivity kit', category: 'gear', completed: true },
      { item: 'Goshuincho pilgrim stamp book', category: 'culture', completed: false },
    ],
  },
]
