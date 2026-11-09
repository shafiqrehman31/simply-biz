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
                  className="h-[80px] sm:h-111 md:h-12 lg:h-[120px] w-auto max-w-[150px] object-contain drop-shadow-sm"
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
