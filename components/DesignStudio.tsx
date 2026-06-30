import React, { useState, useRef } from 'react';
import { MetalType, DesignState } from '../types';
import Viewer3D from './Viewer3D';
import { ShoppingBag, RotateCcw, Type as TypeIcon, Globe, ArrowLeft, Download } from 'lucide-react';
import { Currency, Language } from '../App';

const FONTS = [
  // MONOSPACED (Recommended for best illusion alignment)
  { name: 'Inconsolata (Recommended)', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/droid/droid_sans_mono_regular.typeface.json', category: 'Monospaced' },
  { name: 'Roboto Mono', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/helvetiker_regular.typeface.json', category: 'Monospaced' },
  { name: 'Space Mono', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/optimer_bold.typeface.json', category: 'Monospaced' },
  { name: 'Ubuntu Mono', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/gentilis_bold.typeface.json', category: 'Monospaced' },
  { name: 'Courier Prime', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/droid/droid_serif_bold.typeface.json', category: 'Monospaced' },

  // GEOMETRIC & ROUNDED
  { name: 'Mont (Geometric)', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/helvetiker_bold.typeface.json', category: 'Geometric' },
  { name: 'Mont Bold Italic (Geometric)', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/helvetiker_bold.typeface.json#italic', category: 'Geometric' },
  { name: 'Geogrotesque (Rounded)', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/optimer_bold.typeface.json', category: 'Rounded' },
  { name: 'GT Pressura', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/gentilis_regular.typeface.json', category: 'Modern' },
  { name: 'ITC Avant Garde Gothic', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/helvetiker_regular.typeface.json', category: 'Geometric' },
  { name: 'Varela Round', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/droid/droid_sans_regular.typeface.json', category: 'Rounded' },
];

interface DesignStudioProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  onBack: () => void;
}

const DesignStudio: React.FC<DesignStudioProps> = ({
  currency,
  setCurrency,
  language,
  setLanguage,
  onBack
}) => {
  const [design, setDesign] = useState<DesignState>({
    letter1: 'G',
    letter2: 'S',
    metal: MetalType.GOLD,
    font: FONTS[0].url,
  });

  const [backdrop, setBackdrop] = useState<'cream' | 'dark' | 'midnight'>('cream');
  const exportRef = useRef<any>(null);

  const t = (en: string, sv: string) => language === 'sv' ? sv : en;

  const getPrice = (baseUsd: number) => {
    if (currency === 'SEK') return `${(baseUsd * 10.5).toLocaleString()} kr`;
    if (currency === 'EUR') return `€${(baseUsd * 0.92).toLocaleString()}`;
    return `$${baseUsd.toLocaleString()}`;
  };

  const basePrice = 890;

  const handleLetterChange = (key: 'letter1' | 'letter2', value: string) => {
    const char = value.slice(-1).toUpperCase();
    if (/^[A-Z0-9]?$/.test(char)) {
      setDesign(prev => ({ ...prev, [key]: char }));
    }
  };

  const handleDownloadObj = () => {
    if (exportRef.current) {
      const objData = exportRef.current.export();
      if (objData) {
        const blob = new Blob([objData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Lumiere_Design_${design.letter1}${design.letter2}.obj`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
  };

  const BACKDROP_STYLES = {
    cream: {
      bg: 'bg-[#F5F2EF]',
      text: 'text-gray-900',
      subText: 'text-gray-500',
      btn: 'bg-white/70 hover:bg-white text-gray-600 hover:text-gray-900 border border-gray-100',
      activeBtn: 'bg-gray-900 text-white shadow-sm',
      inactiveBtn: 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
    },
    dark: {
      bg: 'bg-[#15171C]',
      text: 'text-gray-100',
      subText: 'text-gray-400',
      btn: 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border border-white/5',
      activeBtn: 'bg-white text-gray-900 shadow-sm',
      inactiveBtn: 'text-gray-300 hover:text-white hover:bg-white/10'
    },
    midnight: {
      bg: 'bg-[#0B0F19]',
      text: 'text-gray-100',
      subText: 'text-gray-400',
      btn: 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border border-white/5',
      activeBtn: 'bg-white text-gray-900 shadow-sm',
      inactiveBtn: 'text-gray-300 hover:text-white hover:bg-white/10'
    }
  };

  const currentBackdrop = BACKDROP_STYLES[backdrop];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT PANEL: 3D VIEWER */}
      <div className={`lg:w-2/3 h-[50vh] lg:h-screen p-4 ${currentBackdrop.bg} flex items-center justify-center relative transition-colors duration-500`}>
        <div className="w-full h-full relative z-10">
          <Viewer3D
            {...design}
            letter1={design.letter1 || '?'}
            letter2={design.letter2 || '?'}
            exportRef={exportRef}
          />
        </div>

        {/* Navigation Back */}
        <button
          onClick={onBack}
          className={`absolute top-4 left-4 z-20 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all px-3 py-2 rounded-lg backdrop-blur-sm ${currentBackdrop.btn}`}
        >
          <ArrowLeft className="w-4 h-4" /> {t('Back', 'Tillbaka')}
        </button>

        {/* Download Button */}
        <button
          onClick={handleDownloadObj}
          className={`absolute top-4 right-4 z-20 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all px-3 py-2 rounded-lg backdrop-blur-sm ${currentBackdrop.btn}`}
          title="Download 3D Model (.obj)"
        >
          <Download className="w-4 h-4" /> {t('Download 3D', 'Ladda ner 3D')}
        </button>

        {/* Backdrop Switcher */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 p-1.5 rounded-full backdrop-blur-md shadow-sm transition-all border border-black/5 dark:border-white/5">
          <button
            onClick={() => setBackdrop('cream')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              backdrop === 'cream' ? currentBackdrop.activeBtn : currentBackdrop.inactiveBtn
            }`}
          >
            {t('Cream Ambient', 'Ljus Studio')}
          </button>
          <button
            onClick={() => setBackdrop('dark')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              backdrop === 'dark' ? currentBackdrop.activeBtn : currentBackdrop.inactiveBtn
            }`}
          >
            {t('Charcoal Studio', 'Mörk Studio')}
          </button>
          <button
            onClick={() => setBackdrop('midnight')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              backdrop === 'midnight' ? currentBackdrop.activeBtn : currentBackdrop.inactiveBtn
            }`}
          >
            {t('Midnight Sapphire', 'Midnattsblå')}
          </button>
        </div>

        {/* Background branding */}
        <div className="absolute top-8 right-8 z-0 text-right opacity-30 pointer-events-none">
          <h1 className={`text-3xl font-serif tracking-widest uppercase transition-colors duration-500 ${currentBackdrop.text}`}>Lumière</h1>
          <p className={`text-[10px] tracking-[0.3em] mt-1 transition-colors duration-500 ${currentBackdrop.subText}`}>ATELIER</p>
        </div>
      </div>

      {/* RIGHT PANEL: CONTROLS */}
      <div className="lg:w-1/3 min-h-[50vh] lg:h-screen bg-white shadow-2xl z-20 flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-2xl serif font-light text-gray-900">{t('Customize Your Illusion', 'Anpassa Din Illusion')}</h2>
          <p className="text-sm text-gray-500 mt-2 font-light">
            {t('Choose from our curated collection of monospaced and geometric fonts.', 'Välj från vår kuraterade kollektion av monospacerade och geometriska typsnitt.')}
          </p>
        </div>

        {/* Form Controls */}
        <div className="p-8 space-y-8 flex-1">

          {/* Letters Input */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t('Monogram Initials', 'Monogram Initialer')}</label>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <span className="block text-xs text-center text-gray-400 mb-1">{t('FRONT', 'FRAM')}</span>
                <input
                  type="text"
                  value={design.letter1}
                  onChange={(e) => handleLetterChange('letter1', e.target.value)}
                  className="w-full h-20 text-center text-4xl font-serif border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent outline-none transition-all bg-gray-50 text-gray-800 placeholder-gray-200"
                  placeholder="?"
                />
              </div>
              <div className="text-gray-300">
                <RotateCcw className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <span className="block text-xs text-center text-gray-400 mb-1">{t('SIDE', 'SIDA')}</span>
                <input
                  type="text"
                  value={design.letter2}
                  onChange={(e) => handleLetterChange('letter2', e.target.value)}
                  className="w-full h-20 text-center text-4xl font-serif border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent outline-none transition-all bg-gray-50 text-gray-800 placeholder-gray-200"
                  placeholder="?"
                />
              </div>
            </div>
          </div>

          {/* Font Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
              <TypeIcon className="w-3 h-3" /> {t('Typography Selection', 'Typsnittsval')}
            </label>
            <select
              value={design.font}
              onChange={(e) => setDesign(prev => ({ ...prev, font: e.target.value }))}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-yellow-600 outline-none"
            >
              <optgroup label={t('Recommended (Monospaced)', 'Rekommenderat (Monospacerat)')}>
                {FONTS.filter(f => f.category === 'Monospaced').map(f => (
                  <option key={f.url} value={f.url}>{f.name}</option>
                ))}
              </optgroup>
              <optgroup label={t('Modern & Geometric', 'Modernt & Geometriskt')}>
                {FONTS.filter(f => f.category !== 'Monospaced').map(f => (
                  <option key={f.url} value={f.url}>{f.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Metal Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t('Precious Metal', 'Ädelmetall')}</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(MetalType).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setDesign(prev => ({ ...prev, metal: m }));
                    if (m === MetalType.SILVER || m === MetalType.PLATINUM) {
                      setBackdrop('dark');
                    } else {
                      setBackdrop('cream');
                    }
                  }}
                  className={`py-3 px-4 rounded-lg text-sm transition-all border ${
                    design.metal === m
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Global Settings (Language/Currency) */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Globe className="w-3 h-3" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent border-none outline-none font-bold cursor-pointer hover:text-gray-800"
              >
                <option value="en">English</option>
                <option value="sv">Svenska</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent border-none outline-none font-bold cursor-pointer hover:text-gray-800"
              >
                <option value="SEK">SEK</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer / CTA */}
        <div className="p-8 bg-gray-900 text-white mt-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase">{t('Total', 'Totalt')}</span>
              <span className="text-2xl font-serif text-white">
                {getPrice(basePrice)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-green-400 font-medium">{t('In Stock', 'I Lager')}</span>
              <p className="text-xs text-gray-500">{t('Ships in 2-3 weeks', 'Leverans 2-3 veckor')}</p>
            </div>
          </div>
          <button className="w-full py-4 bg-white text-gray-900 rounded-none hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-sm font-bold">
            <ShoppingBag className="w-4 h-4" />
            {t('Add to Cart', 'Lägg i Varukorg')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DesignStudio;
