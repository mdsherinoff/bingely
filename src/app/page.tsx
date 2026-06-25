import QuoteMarquee from '@/components/landing/QuoteMarquee'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import ExamplePlan from '@/components/landing/ExamplePlan'
import Footer from '@/components/landing/Footer'
import MysteryReel from '@/components/easter-eggs/MysteryReel'

export default function LandingPage() {
  return (
    <main className="bg-espresso">
      <QuoteMarquee />
      <Hero />
      <Features />
      <ExamplePlan />
      <Footer />
      <MysteryReel />
    </main>
  )
}
