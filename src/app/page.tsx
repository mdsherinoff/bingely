import QuoteMarquee from '@/components/landing/QuoteMarquee'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import ExamplePlan from '@/components/landing/ExamplePlan'
import Footer from '@/components/landing/Footer'
import MysteryReel from '@/components/easter-eggs/MysteryReel'
import KonamiEgg from '@/components/easter-eggs/KonamiEgg'
import PageTransition from '@/components/layout/PageTransition'

export default function LandingPage() {
  return (
    <PageTransition>
      <main id="main-content" className="bg-espresso">
        <QuoteMarquee />
        <Hero />
        <Features />
        <ExamplePlan />
        <Footer />
        <MysteryReel />
        <KonamiEgg />
      </main>
    </PageTransition>
  )
}
