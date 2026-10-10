import React from 'react';
import AdsHero from './components/AdsHero';
import AdsStats from './components/AdsStats';
import AdsServices from './components/AdsServices';
import AdsCharacterSlider from './components/AdsCharacterSlider';
import Adsworkflow from './components/Adsworkflow';
import AdsPossibility from './components/AdsPossibility';
import AdsIndustries from './components/AdsIndustries';
import AdsPricing from './components/AdsPricing';
import AdsContact from './components/AdsContact';
import AdsFAQ from './components/AdsFAQ';
import JoinUltimate from '../Home/JoinUltimate';
import NewsletterSection from '../Footer/Newsletter';

const Ads = () => {
  return (
    <main className="w-full bg-white text-gray-900 font-sans">
      <AdsHero />
      <AdsStats />
      <AdsServices />
      <AdsCharacterSlider />
      <Adsworkflow />
      <AdsPossibility />
      <AdsIndustries />
      <AdsPricing />
      <AdsContact />
      <AdsFAQ />
      <JoinUltimate />
      <NewsletterSection />
    </main>
  );
};

export default Ads;
