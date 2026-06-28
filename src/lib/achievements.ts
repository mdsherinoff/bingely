export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  condition: string
}

export const achievements: Achievement[] = [
  {
    id: 'first-plan',
    title: 'First Plan',
    description: 'Generated your first watch plan',
    icon: '◎',
    condition: 'Generate any watch plan',
  },
  {
    id: 'cinephile',
    title: 'Cinephile',
    description: 'Searched for 10 different titles',
    icon: '◈',
    condition: 'Search 10 titles',
  },
  {
    id: 'marathon-runner',
    title: 'Marathon Runner',
    description: 'Planned a series with 100+ episodes',
    icon: '◉',
    condition: 'Plan a 100+ episode series',
  },
  {
    id: 'anime-survivor',
    title: 'Anime Survivor',
    description: 'Planned a series with 500+ episodes',
    icon: '◆',
    condition: 'Plan a 500+ episode series',
  },
  {
    id: 'weekend-warrior',
    title: 'Weekend Warrior',
    description: 'Created a plan using only weekends',
    icon: '◇',
    condition: 'Use only Saturday and Sunday',
  },
  {
    id: 'hardcore',
    title: 'Hardcore',
    description: 'Generated a plan on hardcore pace',
    icon: '▲',
    condition: 'Select hardcore pace',
  },
  {
    id: 'challenge-accepted',
    title: 'Challenge Accepted',
    description: 'Visited a film challenge page',
    icon: '★',
    condition: 'Open any film challenge',
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Planned every item in a franchise challenge',
    icon: '✦',
    condition: 'Plan a franchise challenge',
  },
  {
    id: 'speed-runner',
    title: 'Speed Runner',
    description: 'Planned a completion in under 2 weeks',
    icon: '⚡',
    condition: 'Get a plan that finishes in 14 days',
  },
  {
    id: 'pdf-archivist',
    title: 'PDF Archivist',
    description: 'Downloaded a watch plan as PDF',
    icon: '▼',
    condition: 'Export any plan as PDF',
  },
  {
    id: 'cinephile-elite',
    title: 'Cinephile Elite',
    description: 'Discovered the Screening Room',
    icon: '★',
    condition: 'Find the secret',
  },
]

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id)
}
