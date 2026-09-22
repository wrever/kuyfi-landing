import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero/Hero'
import { ChaosMonkey } from './sections/narrative/ChaosMonkey'
import { Closing } from './sections/narrative/Closing'
import { Evidence } from './sections/narrative/Evidence'
import { HowItWorks } from './sections/narrative/HowItWorks'
import { Install } from './sections/narrative/Install'
import { OpenCore } from './sections/narrative/OpenCore'
import { OpenSource } from './sections/narrative/OpenSource'
import { OsintScanner } from './sections/narrative/OsintScanner'
import { RealTerminal } from './sections/narrative/RealTerminal'
import { Updates } from './sections/narrative/Updates'
import { WhatKuyfiDoes } from './sections/narrative/WhatKuyfiDoes'
import { WhyBlackBox } from './sections/narrative/WhyBlackBox'

export default function App() {
  return (
    <>
      <main id="main">
        <Hero />
        <WhatKuyfiDoes />
        <WhyBlackBox />
        <HowItWorks />
        <OsintScanner />
        <ChaosMonkey />
        <RealTerminal />
        <Evidence />
        <Install />
        <OpenSource />
        <OpenCore />
        <Updates />
        <Closing />
      </main>
      <Footer />
    </>
  )
}
