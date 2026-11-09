import React, { useState } from 'react';
import { PageRoute, SiteBranding } from '../types';
import { Menu, X, ArrowUpRight, ShieldCheck, Settings } from 'lucide-react';
import { SIMPLY_BIZ_LOGO_COLOR } from '../assets/images';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  branding: SiteBranding;
  onOpenQuoteModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  branding,
  onOpenQuoteModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Robust logo resolver: Uses custom CMS data URI if uploaded, otherwise uses the embedded 0-margin high-res logo
  const logoSrc = (branding.logoUrl && (branding.logoUrl.startsWith('data:') || branding.logoUrl.startsWith('blob:')))
    ? branding.logoUrl
    : SIMPLY_BIZ_LOGO_COLOR;

  const navLinks: { label: string; route: PageRoute }[] = [
    { label: 'Home', route: 'home' },
    { label: 'About Us', route: 'about' },
    { label: 'Services', route: 'services' },
    { label: 'Why Choose Us', route: 'why-us' },
    { label: 'Contact Us', route: 'contact' },
  ];

  const handleNavClick = (route: PageRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#f0f4f8]/95 backdrop-blur-md border-b border-white/60 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22 gap-8">
          
          {/* Zone 1: Standard Brand Logo with perfect responsive sizing across mobile, tablet & desktop */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 focus:outline-none group text-left cursor-pointer"
              title="Simply Biz - Home"
            >
{logoSrc ? ( <img src={logoSrc} alt={branding.siteName} className="h-110 sm:h-111 md:h-12 lg:h-[120px] w-auto max-w-[120px] sm:max-w-[140px] md:max-w-[160px] object-contain transition-transform group-hover:scale-105 drop-shadow-xs" style={{ aspectRatio: '1342 / 772' }} /> ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-xl neo-box flex items-center justify-center font-bold text-xl text-[#00106b]">
                    SB
                  </div>
                  <span className="text-2xl font-extrabold tracking-tight text-[#00106b]">
                    Simply<span className="text-[#f85508]">Biz</span>
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Zone 2: 4-5 Clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = currentPage === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => handleNavClick(link.route)}
                  className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#00106b] font-bold'
                      : 'text-slate-600 hover:text-[#00106b]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f85508] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action (Admin button removed as requested) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenQuoteModal ? onOpenQuoteModal : () => handleNavClick('contact')}
              className="neo-btn-primary px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
            >
              <span>Get Free Quote</span>
              <ArrowUpRight className="w-4 h-4 text-[#f85508]" />
            </button>
          </div>

          {/* Mobile hamburger toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl neo-box-sm text-[#00106b] cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-[#f0f4f8] px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = currentPage === link.route;
            return (
              <button
                key={link.route}
                onClick={() => handleNavClick(link.route)}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? 'neo-inset text-[#00106b] font-bold'
                    : 'text-slate-700 hover:bg-white/50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <div className="pt-3">
            <button
              onClick={() => {
                if (onOpenQuoteModal) {
                  onOpenQuoteModal();
                  setMobileMenuOpen(false);
                } else {
                  handleNavClick('contact');
                }
              }}
              className="w-full neo-btn-primary py-3 rounded-xl text-center font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Free Quote</span>
              <ArrowUpRight className="w-4 h-4 text-[#f85508]" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
