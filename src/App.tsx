import { ContentPlaceholder } from './sections/ContentPlaceholder'
import { Hero } from './sections/Hero/Hero'
import { ChaosMonkey } from './sections/narrative/ChaosMonkey'
import { HowItWorks } from './sections/narrative/HowItWorks'
import { OsintScanner } from './sections/narrative/OsintScanner'
import { WhatKuyfiDoes } from './sections/narrative/WhatKuyfiDoes'
import { WhyBlackBox } from './sections/narrative/WhyBlackBox'

export default function App() {
  return (
    <main id="main">
      <Hero />
      <WhatKuyfiDoes />
      <WhyBlackBox />
      <HowItWorks />
      <OsintScanner />
      <ChaosMonkey />
      <ContentPlaceholder />
    </main>
  )
}
