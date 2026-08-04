import React, { useEffect, useRef } from 'react';
import './marketing.css';
import HeroSection from './sections/HeroSection';
import CapabilitiesSection from './sections/CapabilitiesSection';
import TrustSection from './sections/TrustSection';
import CtaSection from './sections/CtaSection';
import MarketingFooter from './sections/MarketingFooter';
import MarketingNav from './sections/MarketingNav';

const MarketingSite: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add marketing data attribute to isolate CSS scope
    document.documentElement.setAttribute('data-site', 'marketing');
    return () => {
      document.documentElement.removeAttribute('data-site');
    };
  }, []);

  return (
    <div className="mkt-root" ref={mainRef} id="mkt-root">
      <MarketingNav />
      <main>
        <HeroSection />
        <CapabilitiesSection />
        <TrustSection />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
};

export default MarketingSite;
