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
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={branding.siteName}
                  className="h-110 sm:h-111 md:h-12 lg:h-[120px] w-auto max-w-[120px] sm:max-w-[140px] md:max-w-[160px] object-contain transition-transform group-hover:scale-105 drop-shadow-xs"
                  style={{ aspectRatio: '1342 / 772' }}
                />
              ) : (
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

          {/* Zone 3: Social Media Links & Primary Action */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Social Icons */}
            <div className="flex items-center gap-1.5 mr-1">
              <a
                href={branding.facebookUrl || 'https://facebook.com/simplybizuae'}
                target="_blank"
                rel="noopener noreferrer"
                title="Follow Simply Biz on Facebook"
                className="w-9 h-9 rounded-xl neo-box flex items-center justify-center text-[#00106b] hover:text-[#f85508] transition-all hover:scale-105"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href={branding.instagramUrl || 'https://instagram.com/simplybizuae'}
                target="_blank"
                rel="noopener noreferrer"
                title="Follow Simply Biz on Instagram"
                className="w-9 h-9 rounded-xl neo-box flex items-center justify-center text-[#00106b] hover:text-[#f85508] transition-all hover:scale-105"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            <button
              onClick={onOpenQuoteModal ? onOpenQuoteModal : () => handleNavClick('contact')}
              className="neo-btn-primary px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
            >
              <span>Get Free Quote</span>
              <ArrowUpRight className="w-4 h-4 text-[#f85508]" />
            </button>
          </div>

          {/* Mobile hamburger toggle */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={branding.facebookUrl || 'https://facebook.com/simplybizuae'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl neo-box-sm text-[#00106b] hover:text-[#f85508]"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href={branding.instagramUrl || 'https://instagram.com/simplybizuae'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl neo-box-sm text-[#00106b] hover:text-[#f85508]"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
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
          
          {/* Mobile Socials */}
          <div className="pt-2 pb-1 flex items-center justify-center gap-3">
            <a
              href={branding.facebookUrl || 'https://facebook.com/simplybizuae'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl neo-box flex items-center gap-2 text-xs font-bold text-[#00106b]"
            >
              <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </a>
            <a
              href={branding.instagramUrl || 'https://instagram.com/simplybizuae'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl neo-box flex items-center gap-2 text-xs font-bold text-[#00106b]"
            >
              <svg className="w-4 h-4 fill-current text-[#E4405F]" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>
          </div>

          <div className="pt-2">
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
