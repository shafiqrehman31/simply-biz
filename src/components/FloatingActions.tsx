import React, { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { SiteBranding } from '../types';

interface FloatingActionsProps {
  branding: SiteBranding;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({ branding }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 260) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const cleanPhone = branding.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone || '971527104488'}?text=${encodeURIComponent(
    'Hello Simply Biz Team, I would like to inquire about UAE company setup, free zone packages, and investor residence visas.'
  )}`;

  return (
    <aside aria-label="Quick Actions" className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Bottom-to-Top Ink Tab / Elevator */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        className={`pointer-events-auto group flex items-center gap-2 px-3.5 py-2.5 rounded-full neo-box bg-[#f0f4f8] text-[#00106b] hover:text-[#f85508] border border-white/80 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <span className="text-xs font-bold tracking-wider uppercase hidden sm:inline">
          Top
        </span>
        <div className="w-6 h-6 rounded-full neo-inset flex items-center justify-center group-hover:-translate-y-0.5 transition-transform">
          <ArrowUp className="w-3.5 h-3.5 text-[#f85508]" />
        </div>
      </button>

      {/* Floating WhatsApp Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Simply Biz on WhatsApp"
        className="pointer-events-auto group flex items-center gap-3 p-3 sm:px-4 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer hover:scale-103 active:scale-97 border-2 border-white/90"
      >
        {/* WhatsApp Icon */}
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full" />
        </div>

        {/* Text Label on desktop */}
        <div className="hidden sm:flex flex-col text-left pr-1">
          <span className="text-[10px] font-bold tracking-wider uppercase opacity-90 leading-tight">
            WhatsApp Online
          </span>
          <span className="text-xs font-extrabold leading-tight">
            Chat with Advisor
          </span>
        </div>
      </a>
    </aside>
  );
};
