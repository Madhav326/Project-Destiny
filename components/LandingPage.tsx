
import React from 'react';
import { ArrowRight, Star } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-orange-100 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-yellow-100 opacity-20 blur-3xl"></div>
      </div>

      {/* Navigation (Minimal) */}
      <nav className="relative z-10 p-8 flex justify-between items-center">
        <div className="text-2xl font-serif tracking-widest uppercase font-bold">Lumière</div>
        <div className="text-xs tracking-[0.2em] text-gray-400 hidden sm:block">EST. 2024 • PARIS • STOCKHOLM</div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="mb-6 animate-fade-in-up">
           <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs tracking-widest uppercase text-gray-500 shadow-sm">
             <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
             The Illusion Collection
           </span>
        </div>
        
        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl leading-tight mb-6 text-gray-900 animate-fade-in-up delay-100">
          Craft Your <br/>
          <span className="italic text-yellow-700">Duality</span>
        </h1>
        
        <p className="max-w-xl text-gray-600 text-lg md:text-xl leading-relaxed mb-12 animate-fade-in-up delay-200 font-light">
          A unique fusion of two initials, revealed only through a change in perspective. 
          Design a pendant that tells your hidden story.
        </p>

        <button 
          onClick={onEnter}
          className="group relative px-8 py-4 bg-gray-900 text-white overflow-hidden rounded-none transition-all hover:scale-105 hover:shadow-2xl animate-fade-in-up delay-300"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-700 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span className="relative flex items-center gap-3 text-sm font-bold tracking-[0.2em] uppercase">
            Design Your Piece <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-8 text-center text-gray-400 text-xs uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Lumière Jewelry Studio
      </footer>
    </div>
  );
};

export default LandingPage;
