import React from 'react'
import Navbar from '../pages/landingNav'
import Hero from '../pages/Hero'
import FeaturesSection from '../pages/featurepage'
import HowItWorksSection from '../pages/howitwork'
import ReportsSection from '../pages/Report'

const HomeLanding = () => {
  return (
    <div>
        <Navbar />
        <Hero />
        <FeaturesSection />
        <HowItWorksSection />
        <ReportsSection />
    </div>
  )
}

export default HomeLanding