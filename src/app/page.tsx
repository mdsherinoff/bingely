import { Button, Card, Badge, TimelineItem } from '@/components/ui'

export default function Home() {
  return (
    <main className="bg-espresso flex min-h-screen flex-col gap-8 p-12">
      <div className="flex gap-4">
        <Button variant="primary">Watch Now</Button>
        <Button variant="secondary">Save Plan</Button>
        <Button variant="ghost">Skip</Button>
      </div>
      <div className="flex gap-3">
        <Badge variant="gold">Anime</Badge>
        <Badge variant="rose">1,000+ episodes</Badge>
        <Badge variant="muted">Ongoing</Badge>
      </div>
      <Card className="max-w-sm">
        <p className="font-display text-parchment text-2xl">One Piece</p>
        <p className="text-parchment/40 mt-1 font-mono text-xs">
          1,122 EPISODES · 24 MIN
        </p>
      </Card>
      <div className="max-w-xs">
        <TimelineItem week={1} episodes={14} label="East Blue Arc" isCurrent />
        <TimelineItem week={2} episodes={14} label="Alabasta Arc" />
        <TimelineItem week={3} episodes={14} label="Skypiea Arc" />
      </div>
    </main>
  )
}
