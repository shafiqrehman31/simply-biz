import React from 'react';
import { PageRoute, SiteBranding } from '../types';
import { Mail, Phone, MapPin, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { SIMPLY_BIZ_LOGO_WHITE } from '../assets/images';

interface FooterProps {
  onNavigate: (page: PageRoute) => void;
  branding: SiteBranding;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, branding }) => {
  const handleNav = (page: PageRoute) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Robust logo resolver: Uses custom CMS data URI if uploaded, otherwise uses the embedded 0-margin high-res white logo
  const logoWhiteSrc = (branding.logoWhiteUrl && (branding.logoWhiteUrl.startsWith('data:') || branding.logoWhiteUrl.startsWith('blob:')))
    ? branding.logoWhiteUrl
    : SIMPLY_BIZ_LOGO_WHITE;

  return (
    <footer className="bg-[#00106b] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {logoWhiteSrc ? (
                <img
                  src={logoWhiteSrc}
                  alt={branding.siteName}
                  className="h-10 sm:h-11 md:h-12 w-auto max-w-[150px] object-contain drop-shadow-sm"
                  style={{ aspectRatio: '1342 / 772' }}
                />
              ) : (
                <span className="text-2xl font-extrabold tracking-tight text-white">
                  Simply<span className="text-[#f85508]">Biz</span>
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Your trusted concierge for UAE company formation, free zone licensing, mainland expansion, and investor residence visas in Dubai and across all seven emirates.
            </p>
            
            <div className="pt-2 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#f85508] shrink-0" />
                <a href={`mailto:${branding.siteEmail}`} className="hover:text-white transition-colors">
                  {branding.siteEmail}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#f85508] shrink-0" />
                <a href={`tel:${branding.sitePhone}`} className="hover:text-white transition-colors">
                  {branding.sitePhone}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#f85508] shrink-0 mt-0.5" />
                <span>{branding.address}</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Connect With Us</span>
              <div className="flex items-center gap-2">
                <a
                  href={branding.facebookUrl || 'https://facebook.com/simplybizuae'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all hover:scale-105"
                  title="Simply Biz on Facebook"
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
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-white flex items-center justify-center transition-all hover:scale-105"
                  title="Simply Biz on Instagram"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-white transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition-colors text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('services')}
                  className="hover:text-white transition-colors text-left"
                >
                  Our Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('why-us')}
                  className="hover:text-white transition-colors text-left"
                >
                  Why Choose Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors text-left"
                >
                  Contact & Location
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('admin')}
                  className="text-slate-400 hover:text-white transition-colors text-left text-xs"
                >
                  Admin CMS Panel
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Principal Jurisdictions */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              UAE Jurisdictions
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleNav('services')}
                  className="hover:text-white transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>Dubai Mainland (DET)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('services')}
                  className="hover:text-white transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>DMCC Free Zone</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('services')}
                  className="hover:text-white transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>DIFC & ADGM</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('services')}
                  className="hover:text-white transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>Meydan & Shams</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('services')}
                  className="hover:text-white transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>Creative City Fujairah</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('services')}
                  className="hover:text-white transition-colors text-left flex items-center justify-between w-full"
                >
                  <span>RAKEZ & SPC Free Zone</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Regulatory */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              Legal & Policies
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleNav('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('refund')}
                  className="hover:text-white transition-colors text-left"
                >
                  Refund & Fee Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('disclaimer')}
                  className="hover:text-white transition-colors text-left"
                >
                  Regulatory Disclaimer
                </button>
              </li>
            </ul>

            <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#f85508]" />
                <span>Zero Hidden Fees</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Itemized quotes provided prior to payment. No undisclosed visa, medical, or establishment charges.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} simply-biz.com. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => handleNav('terms')} className="hover:text-white transition-colors">
              Terms
            </button>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <button onClick={() => handleNav('privacy')} className="hover:text-white transition-colors">
              Privacy
            </button>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <button onClick={() => handleNav('disclaimer')} className="hover:text-white transition-colors">
              Immigration & Legal Disclaimer
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
