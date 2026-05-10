import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

const Footer: React.FC = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (location.pathname === '/posts/new') {
      setIsVisible(true);
    } else {
      const isDismissed = localStorage.getItem('warning-dismissed');
      if (isDismissed === 'true') {
        setIsVisible(false);
      }
    }
  }, [location.pathname]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (location.pathname !== '/posts/new') {
      localStorage.setItem('warning-dismissed', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 py-3 px-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {/* The red warning bar */}
        <div className="flex-1 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-center">
          <p className="text-red-400/90 text-[11px] uppercase tracking-[0.2em] font-medium leading-tight">
            Warning: Please ensure all transmissions relate to Astrophysics & Exploration, Rocketry & Aerospace, Space related content.
          </p>
        </div>

        {/* Dismiss button */}
        <button 
          onClick={handleDismiss}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-red-400/50 hover:text-red-400"
          title="Dismiss for this session"
        >
          <X size={16} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;