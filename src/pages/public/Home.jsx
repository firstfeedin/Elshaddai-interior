import Navbar          from '../../components/layout/Navbar'
import FloatingActions from '../../components/common/FloatingActions'
import Hero            from '../../components/sections/Hero'
import TrustTicker     from '../../components/common/TrustTicker'
import QuickDesignWizard from '../../components/sections/QuickDesignWizard'
import HowItWorks      from '../../components/sections/HowItWorks'
import Services        from '../../components/sections/Services'
import AIFeatures      from '../../components/sections/AIFeatures'
import Visualization3D from '../../components/sections/Visualization3D'
import Portfolio       from '../../components/sections/Portfolio'
import CostEstimator   from '../../components/sections/CostEstimator'
import Testimonials    from '../../components/sections/Testimonials'
import ProjectTracking from '../../components/sections/ProjectTracking'
import WhyChooseUs     from '../../components/sections/WhyChooseUs'
import FAQ             from '../../components/sections/FAQ'
import LeadGeneration  from '../../components/sections/LeadGeneration'
import Footer          from '../../components/layout/Footer'

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
