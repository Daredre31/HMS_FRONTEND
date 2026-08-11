
import Navbar from '../pages/landingNav'
import Hero from '../pages/Hero'
import FeaturesSection from '../pages/featurepage'
import HowItWorksSection from '../pages/howitwork'
import ReportsSection from '../pages/Report'
import ContactSection from '../pages/contact'

const HomeLanding = () => {
  return (
    <div>
        <Navbar />
        <Hero />
        <FeaturesSection />
        <HowItWorksSection />
        <ReportsSection />
        <ContactSection />
    </div>
  )
}

export default HomeLanding