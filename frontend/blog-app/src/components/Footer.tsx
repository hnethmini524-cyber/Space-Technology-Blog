import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full mt-auto py-3 px-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* The Red Warning Bar from your screenshot */}
        <div className="w-full p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-center">
          <p className="text-red-400/90 text-[11px] uppercase tracking-[0.2em] font-medium">
            Warning: Please ensure all transmissions relate to Astrophysics & Exploration, Rocketry & Aerospace, Space History & Science Fiction.
            Earth-bound politics or off-topic noise will be jettisoned.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;