import React from 'react';
import { PageRoute, WhyUsPageContent } from '../types';
import { DEFAULT_WHY_US_CONTENT } from '../services/storage';
import { 
  Check, 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  FileCheck2, 
  Award,
  ArrowRight
} from 'lucide-react';

interface WhyChooseUsPageProps {
  onNavigate: (page: PageRoute) => void;
  whyUsContent?: WhyUsPageContent;
}

export const WhyChooseUsPage: React.FC<WhyChooseUsPageProps> = ({ onNavigate, whyUsContent }) => {
  const content = whyUsContent || DEFAULT_WHY_US_CONTENT;
  const comparisonRows = [
    {
      feature: 'Written Itemized Quote Guarantee',
      simplyBiz: 'Yes, full transparent breakdown before payment',
      broker: 'Usually hidden, added later at visa stage',
      diy: 'Surprise fees emerge across multiple ministries',
    },
    {
      feature: 'Immigration & Establishment Card Included',
      simplyBiz: 'Fully accounted for in quote',
      broker: 'Often billed as an extra AED 2,000–3,000',
      diy: 'Must register separately with GDRFA/ICP',
    },
    {
      feature: 'VIP Medical & Biometrics Escort',
      simplyBiz: 'Dedicated PRO skips regular public lines',
      broker: 'Client left to wait at health centres',
      diy: 'Self-booking and long queues',
    },
    {
      feature: 'Corporate Bank Account Pre-Vetting',
      simplyBiz: '96% success rate with top UAE tier-1 banks',
      broker: 'No guarantee, generic introductions only',
      diy: 'High rejection rates without profile auditing',
    },
    {
      feature: 'Jurisdiction Neutrality (40+ Free Zones + Mainland)',
      simplyBiz: 'Unbiased match to your business activity & budget',
      broker: 'Pushes whatever zone pays the highest commission',
      diy: 'Overwhelming research without insider knowledge',
    },
    {
      feature: 'Tax & VAT FTA Registration Advisory',
      simplyBiz: 'Included to ensure 0% Qualifying Person status',
      broker: 'Rarely handled or outsourced at high fees',
      diy: 'Risk of fines from FTA non-compliance',
    },
  ];

  const steps = (content.steps && content.steps.length > 0) ? content.steps : [
    {
      num: '01',
      title: 'Jurisdiction & Activity Match',
      desc: 'Select approved activity codes, commercial legal forms (LLC, FZE, FZCO), and optimize share capital structure.',
    },
    {
      num: '02',
      title: 'Trade Name Reservation',
      desc: 'Clear and reserve compliant company names through Dubai DET or relevant Free Zone authority.',
    },
    {
      num: '03',
      title: 'Initial Approval & MOA Drafting',
      desc: 'Submit shareholder KYC, draft bilingual Memorandum of Association, and complete legal electronic notary.',
    },
    {
      num: '04',
      title: 'Office Premise / Ejari Attestation',
      desc: 'Secure compliant lease (virtual flexi-desk, dedicated workspace, or commercial office).',
    },
    {
      num: '05',
      title: 'Trade License Issuance',
      desc: 'Official company documents, certificate of formation, and commercial register issued by the government.',
    },
    {
      num: '06',
      title: 'Establishment Card & Immigration File',
      desc: 'Activate company immigration file with GDRFA or ICP to open residency visa allocations.',
    },
    {
      num: '07',
      title: 'VIP Visa, Medical & Emirates ID',
      desc: 'Fast-track entry permit / status change, priority VIP blood test & X-ray, and biometrics escort.',
    },
    {
      num: '08',
      title: 'Corporate Bank Account & Tax Filing',
      desc: 'Audit business plan, introduce to tier-1 relationship managers, and register for UAE Corporate Tax TRN.',
    },
  ];

  return (
    <div className="space-y-20 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
          {content.badgeText || 'The Simply Biz Standard'}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#00106b] tracking-tight">
          {content.headline || 'Why Discerning Entrepreneurs Choose Simply Biz'}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {content.subheadline}
        </p>
      </div>

      {/* The Problem We Solve (Warning from PDF Guide) */}
      <div className="neo-box rounded-3xl p-8 sm:p-10 border border-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neo-inset text-[#f85508] text-xs font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>The Industry Pitfall</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#00106b]">
              The Danger of Misleading "Starting From" Advertisements
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              As documented in official government setup advisories, a company trade license alone does <strong>not</strong> grant residence. Many agencies quote only the bare minimum base fee, withholding mandatory charges until after you are legally committed.
            </p>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-500 shrink-0" />
                <span>Hidden establishment card & immigration file activation</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-500 shrink-0" />
                <span>Exorbitant markups on mandatory VIP medical tests and biometrics</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-500 shrink-0" />
                <span>Unspecified annual renewal fees that double in year two</span>
              </div>
            </div>
          </div>

          <div className="neo-inset rounded-2xl p-6 sm:p-8 space-y-4 bg-white/70">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>The Simply Biz Guarantee</span>
            </div>
            <h3 className="text-xl font-bold text-[#00106b]">
              Itemized Quotations. Total Peace of Mind.
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every Simply Biz client receives a comprehensive financial statement detailing government statutory fees, PRO handling, visa allocations, medical test options, and annual renewal projections before executing any contract.
            </p>
            <div className="p-3.5 rounded-xl neo-box text-xs font-semibold text-[#00106b] flex items-center justify-between">
              <span>Client Transparency Index</span>
              <span className="text-[#f85508] font-bold">100% Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
            Side-By-Side Comparison
          </span>
          <h2 className="text-3xl font-extrabold text-[#00106b] tracking-tight">
            How Simply Biz Compares
          </h2>
        </div>

        <div className="neo-box rounded-2xl overflow-hidden border border-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#00106b] text-white">
                <tr>
                  <th className="py-4 px-6 font-bold">Feature / Standard</th>
                  <th className="py-4 px-6 font-bold text-[#f85508] bg-[#000a45]">Simply Biz Concierge</th>
                  <th className="py-4 px-6 font-medium text-slate-300">Typical Broker</th>
                  <th className="py-4 px-6 font-medium text-slate-300">Self-Application (DIY)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white/40">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#00106b]">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 font-bold text-[#00106b] bg-orange-50/30">
                      <div className="flex items-start gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.simplyBiz}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span>{row.broker}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      <span>{row.diy}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Step-by-Step Roadmap (8 Steps) */}
      <div className="space-y-8">
        <div>
          <span className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
            Execution Excellence
          </span>
          <h2 className="text-3xl font-extrabold text-[#00106b] tracking-tight">
            Our 8-Step Turnkey Setup Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl">
            A frictionless pathway engineered to take your venture from legal entity concept to operational corporate bank account and UAE residence in days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => (
            <div key={st.num} className="neo-box rounded-2xl p-6 space-y-3 relative group">
              <div className="text-2xl font-extrabold text-[#f85508] tabular-nums">
                {st.num}
              </div>
              <h4 className="text-base font-bold text-[#00106b] group-hover:text-[#f85508] transition-colors">
                {st.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="neo-box rounded-3xl p-8 sm:p-12 text-center space-y-5 bg-gradient-to-br from-white/90 to-[#f0f4f8]">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#00106b]">
          Experience Seamless UAE Company Formation
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Contact our senior consultants today to obtain an official itemized quotation for your business activity.
        </p>
        <button
          onClick={() => onNavigate('contact')}
          className="neo-btn-orange px-8 py-3.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <span>Get Your Itemized Quote</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
