import React from 'react';
import { PageRoute } from '../types';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const TermsPage: React.FC<LegalPageProps> = ({ onNavigate }) => {
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
          <span className="text-xs font-bold text-[#f85508] tracking-widest uppercase">Legal Information</span>
          <h1 className="text-3xl font-extrabold text-[#00106b] mt-1">Terms of Service</h1>
          <p className="text-xs text-slate-500 mt-1">Effective Date: November 2026 · simply-biz.com</p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#00106b]">1. Nature of Corporate Services</h2>
          <p>
            Simply Biz ("simply-biz.com", "we", "our") is a specialized UAE corporate services and business setup consultancy. We assist domestic and international clients with commercial registration, trade licensing, investor and partner residence visa facilitation, and document liaison services with relevant UAE Free Zone authorities and economic departments.
          </p>

          <h2 className="text-base font-bold text-[#00106b]">2. Scope of Written Quotations</h2>
          <p>
            All quotations provided by Simply Biz itemize official government statutory fees (license issuance, trade name registration, immigration establishment cards) and consultancy fees. Official government fees are determined by the respective UAE emirate or Free Zone authority and may be subject to statutory revisions outside of our control.
          </p>

          <h2 className="text-base font-bold text-[#00106b]">3. Client Responsibilities & Know-Your-Customer (KYC)</h2>
          <p>
            Clients are obligated to supply authentic, valid, and legally attested documentation (including passport copies, educational degrees, and proof of residential address) as required under UAE Federal Law on Anti-Money Laundering (AML) and Counter-Terrorism Financing. Providing fraudulent or expired information will result in immediate termination of representation without liability.
          </p>

          <h2 className="text-base font-bold text-[#00106b]">4. Regulatory Approvals & Bank Accounts</h2>
          <p>
            The issuance of trade licenses, residence visas, establishment cards, and corporate bank accounts remains at the sole statutory discretion of the relevant UAE government authorities, the General Directorate of Residency and Foreigners Affairs (GDRFA), the Federal Authority for Identity, Citizenship, Customs and Port Security (ICP), and licensed commercial banks. Simply Biz acts as a professional facilitator and cannot usurp executive government discretion.
          </p>

          <h2 className="text-base font-bold text-[#00106b]">5. Contact & Official Notice</h2>
          <p>
            Any formal legal notices regarding these Terms may be directed to our legal department via <a href="mailto:info@simply-biz.com" className="text-[#00106b] font-bold underline">info@simply-biz.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
