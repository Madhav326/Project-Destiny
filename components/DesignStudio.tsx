import React, { useState, useRef } from 'react';
import { MetalType, DesignState, AiResponse } from '../types';
import Viewer3D from './Viewer3D';
import { generateDesignDescription } from '../services/geminiService';
import { Loader2, Sparkles, ShoppingBag, RotateCcw, Type as TypeIcon, Globe, ArrowLeft, Download, Layers, Move } from 'lucide-react';
import { Currency, Language } from '../App';

const FONTS = [
  // MONOSPACED (Recommended for best illusion alignment)
  { name: 'Inconsolata (Recommended)', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/droid/droid_sans_mono_regular.typeface.json', category: 'Monospaced' },
  { name: 'Roboto Mono', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/helvetiker_regular.typeface.json', category: 'Monospaced' },
  { name: 'Space Mono', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/optimer_bold.typeface.json', category: 'Monospaced' },
  { name: 'Ubuntu Mono', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/gentilis_bold.typeface.json', category: 'Monospaced' },
  { name: 'Courier Prime', url: 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/fonts/droid/droid_serif_bold.typeface.json', category: 'Monospaced' },
  
  // GEOMETRIC & ROUNDED (From the latest image)
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
    textureIntensity: 0.5,
    manualOffsetX: 0,
    manualOffsetY: 0,
    manualOffsetZ: 0
  });

  const [aiData, setAiData] = useState<AiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backdrop, setBackdrop] = useState<'cream' | 'dark' | 'midnight'>('cream');
  
  // Ref to access the OBJ exporter in the 3D scene
  const exportRef = useRef<any>(null);

  // Localization Helpers
  const t = (en: string, sv: string) => language === 'sv' ? sv : en;

  const getPrice = (baseUsd: number) => {
    if (currency === 'SEK') return `${(baseUsd * 10.5).toLocaleString()} kr`;
    if (currency === 'EUR') return `€${(baseUsd * 0.92).toLocaleString()}`;
    return `$${baseUsd.toLocaleString()}`;
  };

  const basePrice = 890;

  const handleLetterChange = (key: 'letter1' | 'letter2', value: string) => {
    // Only take the last character if multiple typed, uppercase
    const char = value.slice(-1).toUpperCase();
    
    // Allow empty string to let user delete, or single alphanumeric
    if (/^[A-Z0-9]?$/.test(char)) {
      setDesign(prev => ({ 
        ...prev, 
        [key]: char,
        // Reset manual offsets when letters change to let auto-center logic take over
        manualOffsetX: 0,
        manualOffsetY: 0,
        manualOffsetZ: 0
      }));
      // Reset AI data when design changes to encourage regeneration
      if (aiData) setAiData(null); 
    }
  };

  const handleResetOffsets = () => {
    setDesign(prev => ({ ...prev, manualOffsetX: 0, manualOffsetY: 0, manualOffsetZ: 0 }));
  };

  const handleGenerateDescription = async () => {
    setIsLoading(true);
    try {
      const result = await generateDesignDescription(design);
      setAiData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
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
          {/* Pass '?' as fallback if letters are empty so 3D viewer doesn't break */}
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

        {/* Floating Backdrop Switcher */}
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
             <div className="grid grid-cols-1 gap-2">
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

          {/* Texture Intensity Slider */}
          <div className="space-y-4">
             <label className="text-xs font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
               <Layers className="w-3 h-3" /> {t('Hammered Finish', 'Hamrad Yta')}
             </label>
             <div className="flex items-center gap-4">
               <input 
                 type="range" 
                 min="0" 
                 max="3" 
                 step="0.1"
                 value={design.textureIntensity}
                 onChange={(e) => setDesign(prev => ({ ...prev, textureIntensity: parseFloat(e.target.value) }))}
                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
               />
               <span className="text-sm font-medium text-gray-600 w-8 text-right">
                 {design.textureIntensity.toFixed(1)}
               </span>
             </div>
          </div>

          {/* Manual Alignment Sliders */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
                  <Move className="w-3 h-3" /> {t('Fine Tune Position', 'Finjustera Position')}
                </label>
                <button 
                  onClick={handleResetOffsets}
                  className="text-xs text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
             </div>
             
             {/* X Axis Slider */}
             <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Left</span>
                  <span>Center (X)</span>
                  <span>Right</span>
                </div>
                <input 
                   type="range" 
                   min="-4" 
                   max="4" 
                   step="0.05"
                   value={design.manualOffsetX || 0}
                   onChange={(e) => setDesign(prev => ({ ...prev, manualOffsetX: parseFloat(e.target.value) }))}
                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                />
                <div className="text-center text-xs font-mono text-gray-400">
                  {(design.manualOffsetX || 0) > 0 ? '+' : ''}{(design.manualOffsetX || 0).toFixed(2)}
                </div>
             </div>

             {/* Y Axis Slider (Up/Down) */}
             <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Down</span>
                  <span>Height (Y)</span>
                  <span>Up</span>
                </div>
                <input 
                   type="range" 
                   min="-4" 
                   max="4" 
                   step="0.05"
                   value={design.manualOffsetY || 0}
                   onChange={(e) => setDesign(prev => ({ ...prev, manualOffsetY: parseFloat(e.target.value) }))}
                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                />
                <div className="text-center text-xs font-mono text-gray-400">
                  {(design.manualOffsetY || 0) > 0 ? '+' : ''}{(design.manualOffsetY || 0).toFixed(2)}
                </div>
             </div>

             {/* Z Axis Slider */}
             <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Front</span>
                  <span>Depth (Z)</span>
                  <span>Back</span>
                </div>
                <input 
                   type="range" 
                   min="-4" 
                   max="4" 
                   step="0.05"
                   value={design.manualOffsetZ || 0}
                   onChange={(e) => setDesign(prev => ({ ...prev, manualOffsetZ: parseFloat(e.target.value) }))}
                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                />
                <div className="text-center text-xs font-mono text-gray-400">
                  {(design.manualOffsetZ || 0) > 0 ? '+' : ''}{(design.manualOffsetZ || 0).toFixed(2)}
                </div>
             </div>
          </div>

          {/* AI Analysis Section */}
          <div className="pt-6 border-t border-gray-100">
            {!aiData ? (
              <button
                onClick={handleGenerateDescription}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border border-yellow-200 text-yellow-800 rounded-xl flex items-center justify-center gap-2 transition-all group"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span className="font-medium">{t('Reveal Design Story', 'Avslöja Designhistorian')}</span>
              </button>
            ) : (
              <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Curator
                  </span>
                  <button onClick={() => setAiData(null)} className="text-gray-400 hover:text-gray-600">
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="text-xl serif text-gray-900">{aiData.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  "{aiData.description}"
                </p>
                <div className="pt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    {/* We can stick with AI price or calculate roughly */}
                    {aiData.priceEstimate.replace('$', '') !== 'TBD' 
                       ? getPrice(parseInt(aiData.priceEstimate.replace(/\D/g,'')) || 1200) 
                       : 'Price on Request'}
                  </span>
                  <span className="text-xs text-gray-400">{t('Est. Retail', 'Uppskattat Pris')}</span>
                </div>
              </div>
            )}
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
               <span className="font-bold">
                 <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="bg-transparent border-none outline-none font-bold cursor-pointer hover:text-gray-800"
                 >
                   <option value="SEK">SEK</option>
                   <option value="USD">USD</option>
                   <option value="EUR">EUR</option>
                 </select>
               </span>
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