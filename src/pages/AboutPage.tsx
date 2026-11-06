import React from 'react';
import { PageRoute, SiteBranding } from '../types';
import { ShieldCheck, Award, Target, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageRoute) => void;
  branding: SiteBranding;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, branding }) => {
  return (
    <div className="space-y-20 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
          About Simply Biz
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#00106b] tracking-tight leading-tight">
          Pioneering Transparency in UAE Corporate Services
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Simply Biz was established to solve the greatest frustration facing international founders entering the UAE: opaque pricing, misleading headline promo packages, and surprise post-incorporation visa fees.
        </p>
      </div>

      {/* Main Photographic Feature */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 neo-box rounded-3xl overflow-hidden p-2">
          <img
            src="/src/assets/images/hero_executive_consulting_1793972136686.jpg"
            alt="Simply Biz Advisory Executive Boardroom"
            className="w-full h-[400px] object-cover rounded-2xl"
          />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="neo-box rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-2xl font-bold text-[#00106b]">
              Our Guiding Principle
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We provide fixed, written, itemized quotations before our clients transfer any funds. Our quotes detail everything—licence fee, trade name reservation, establishment card, immigration registration, medical VIP processing, Emirates ID, and bank account compliance assistance.
            </p>
            <div className="pt-2 border-t border-slate-200 space-y-2 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f85508]" />
                <span>Zero hidden immigration or establishment surcharges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f85508]" />
                <span>Direct integration with 40+ official Free Zone registrars</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#f85508]" />
                <span>Full compliance with UAE Corporate Tax and AML guidelines</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars (Tactile Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="neo-box rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl neo-inset flex items-center justify-center text-[#f85508]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-[#00106b]">Regulatory Integrity</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Directly aligned with Dubai DET, Abu Dhabi TAMM, and official federal ministries. We operate with strict adherence to UAE commercial laws.
          </p>
        </div>

        <div className="neo-box rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl neo-inset flex items-center justify-center text-[#00106b]">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-[#00106b]">Fixed Itemized Tariffs</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            No bait-and-switch advertising. We compare mainland vs free zone costs objectively to match your specific customer base and visa quota.
          </p>
        </div>

        <div className="neo-box rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl neo-inset flex items-center justify-center text-[#f85508]">
            <Target className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-[#00106b]">White-Glove VIP Concierge</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dedicated bilingual PROs escort you through priority medical exams and biometrics, saving your executives hours of queueing.
          </p>
        </div>

        <div className="neo-box rounded-2xl p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl neo-inset flex items-center justify-center text-[#00106b]">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-[#00106b]">Banking & Tax Synergy</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Formation is only step one. We assist with Corporate Tax TRN registration, VAT thresholds, and high-success bank introductions.
          </p>
        </div>
      </div>

      {/* Leadership & Strategic Advisory */}
      <div className="space-y-8">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
            Executive Leadership
          </span>
          <h2 className="text-3xl font-extrabold text-[#00106b] tracking-tight">
            Meet the Advisory Board
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="neo-box rounded-2xl p-6 space-y-4">
            <div className="w-20 h-20 rounded-2xl neo-inset overflow-hidden mx-auto">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                alt="Shafiq Rehman"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-[#00106b]">Shafiq Rehman</h4>
              <p className="text-xs font-semibold text-[#f85508]">Managing Director & Founder</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Over 14 years advising multinational enterprises, foreign direct investment initiatives, and tech startups expanding into the Gulf region.
              </p>
            </div>
          </div>

          <div className="neo-box rounded-2xl p-6 space-y-4">
            <div className="w-20 h-20 rounded-2xl neo-inset overflow-hidden mx-auto">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
                alt="Mariam Al-Hashemi"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-[#00106b]">Mariam Al-Hashemi</h4>
              <p className="text-xs font-semibold text-[#f85508]">Head of Government Relations (PRO)</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Specialist in Dubai Economy & Tourism regulatory authorizations, MoA notarizations, and specialized industry approvals.
              </p>
            </div>
          </div>

          <div className="neo-box rounded-2xl p-6 space-y-4">
            <div className="w-20 h-20 rounded-2xl neo-inset overflow-hidden mx-auto">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                alt="David Keller"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-[#00106b]">David Keller</h4>
              <p className="text-xs font-semibold text-[#f85508]">Director of Banking & Tax Advisory</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Former commercial banker with extensive expertise in UAE Central Bank AML compliance, source-of-funds validation, and corporate accounts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Bottom Banner */}
      <div className="neo-box rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/40">
        <div>
          <h3 className="text-2xl font-bold text-[#00106b]">
            Have Specific Business Setup Questions?
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Our advisors provide unbiased assessments of whether Mainland or Free Zone is right for your business model.
          </p>
        </div>
        <button
          onClick={() => onNavigate('contact')}
          className="neo-btn-primary px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
        >
          <span>Schedule an Advisory Call</span>
          <ArrowRight className="w-4 h-4 text-[#f85508]" />
        </button>
      </div>

    </div>
  );
};
