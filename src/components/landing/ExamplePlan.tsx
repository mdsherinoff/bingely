import { Card, Badge, TimelineItem } from '@/components/ui'

export default function ExamplePlan() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-16 md:grid-cols-2">
        {/* Left — copy */}
        <div className="flex flex-col gap-6">
          <p className="text-gold/60 font-mono text-xs tracking-[0.3em] uppercase">
            See it in action
          </p>
          <h2 className="font-display text-parchment text-5xl leading-tight">
            One Piece in 11 months
          </h2>
          <p className="font-body text-parchment/50 text-lg leading-relaxed">
            1,122 episodes sounds impossible. With 3 hours free on weekdays and
            6 on weekends, Bingely maps out exactly how you get there — arc by
            arc, week by week.
          </p>
          <div className="flex gap-3">
            <Badge variant="gold">28 eps / week</Badge>
            <Badge variant="rose">Casual pace</Badge>
            <Badge variant="muted">Done by March</Badge>
          </div>
        </div>

        {/* Right — timeline preview */}
        <Card className="flex flex-col gap-1">
          <p className="text-parchment/30 mb-4 font-mono text-xs tracking-widest">
            WATCH PLAN — ONE PIECE
          </p>
          <TimelineItem
            week={1}
            episodes={28}
            label="East Blue Arc"
            isCurrent
          />
          <TimelineItem week={5} episodes={28} label="Alabasta Arc" />
          <TimelineItem week={12} episodes={28} label="Enies Lobby Arc" />
          <TimelineItem week={20} episodes={28} label="Marineford Arc" />
          <TimelineItem week={32} episodes={28} label="Wano Arc" />
        </Card>
      </div>
    </section>
  )
}
