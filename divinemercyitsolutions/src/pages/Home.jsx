import Navbar          from '../components/Navbar'
import FloatingActions from '../components/FloatingActions'
import Hero            from '../components/Hero'
import TrustTicker     from '../components/TrustTicker'
import QuickDesignWizard from '../components/QuickDesignWizard'
import HowItWorks      from '../components/HowItWorks'
import Services        from '../components/Services'
import AIFeatures      from '../components/AIFeatures'
import Visualization3D from '../components/Visualization3D'
import Portfolio       from '../components/Portfolio'
import CostEstimator   from '../components/CostEstimator'
import Testimonials    from '../components/Testimonials'
import ProjectTracking from '../components/ProjectTracking'
import WhyChooseUs     from '../components/WhyChooseUs'
import FAQ             from '../components/FAQ'
import LeadGeneration  from '../components/LeadGeneration'
import Footer          from '../components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustTicker />
      <QuickDesignWizard />
      <HowItWorks />
      <Services />
      <AIFeatures />
      <Visualization3D />
      <Portfolio />
      <CostEstimator />
      <Testimonials />
      <ProjectTracking />
      <WhyChooseUs />
      <FAQ />
      <LeadGeneration />
      <Footer />
      <FloatingActions />
    </>
  )
}
