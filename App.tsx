
import React, { useState } from 'react';
import DesignStudio from './components/DesignStudio';
import LandingPage from './components/LandingPage';

export type Currency = 'USD' | 'SEK' | 'EUR';
export type Language = 'en' | 'sv';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'studio'>('landing');
  const [currency, setCurrency] = useState<Currency>('SEK');
  const [language, setLanguage] = useState<Language>('en');

  const handleEnter = () => {
    setView('studio');
  };

  return (
    <div className="antialiased">
      {view === 'landing' ? (
        <LandingPage onEnter={handleEnter} />
      ) : (
        <DesignStudio 
          currency={currency} 
          setCurrency={setCurrency}
          language={language}
          setLanguage={setLanguage}
          onBack={() => setView('landing')}
        />
      )}
    </div>
  );
};

export default App;
