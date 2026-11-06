import React from 'react';
import { PageRoute } from '../types';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface LegalPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const DisclaimerPage: React.FC<LegalPageProps> = ({ onNavigate }) => {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00106b] hover:text-[#f85508] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>

      <div className="neo-box rounded-3xl p-8 sm:p-12 space-y-6 border border-white">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-xs font-bold text-[#f85508] tracking-widest uppercase">Regulatory Notice</span>
          <h1 className="text-3xl font-extrabold text-[#00106b] mt-1">Regulatory & Immigration Disclaimer</h1>
          <p className="text-xs text-slate-500 mt-1">Important Scope & Pricing Disclosures · simply-biz.com</p>
        </div>

        <div className="p-4 rounded-2xl neo-inset bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Important Notice:</strong> Simply Biz is a commercial business setup, PRO, and corporate services consultancy. The materials, price indications, guides, and calculators provided on simply-biz.com are intended for general informative orientation and planning purposes only, and do not constitute formal legal, taxation, or immigration advice.
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#00106b]">1. Trade License vs. Residence Permit</h2>
          <p>
            A company trade license is not itself a residence visa. Establishing an entity confers legal commercial identity; securing residence requires subsequent immigration establishment file activation, entry permits, medical fitness examinations, Emirates ID issuance, and health insurance under GDRFA or ICP regulations.
          </p>

          <h2 className="text-base font-bold text-[#00106b]">2. Individual Circumstances & Regulated Sectors</h2>
          <p>
            Regulated activities (e.g., healthcare, education, legal advisory, architecture, transport, financial services, security) require statutory external approvals from respective ministries (e.g., DHA, MOHAP, KHDA, Central Bank). Furthermore, nationality security screenings and individual circumstances can change requirements and timelines.
          </p>

          <h2 className="text-base font-bold text-[#00106b]">3. Free Zone Authority Pricing Variations</h2>
          <p>
            There is no single official price list covering every UAE free zone. Fees differ based on emirate, activity count, legal form, office/flexi-desk lease, number of visa allocations, and whether applicants are inside or outside the country. Simply Biz always provides verified itemized written quotes directly aligned with authority tariffs prior to client payment.
          </p>

          <h2 className="text-base font-bold text-[#00106b]">4. Corporate Tax & Banking Disclaimers</h2>
          <p>
            A free zone company does not automatically guarantee that all income is tax-free. Under UAE Corporate Tax Law, the 0% rate applies strictly to Qualifying Income for Qualifying Free Zone Persons (QFZPs) maintaining adequate substance. Non-qualifying income is subject to standard statutory tax rates. Corporate bank account opening is subject to individual bank AML/KYC review.
          </p>
        </div>
      </div>
    </div>
  );
};
