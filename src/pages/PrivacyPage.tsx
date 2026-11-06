import React from 'react';
import { PageRoute } from '../types';
import { Shield, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const PrivacyPage: React.FC<LegalPageProps> = ({ onNavigate }) => {
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
          <span className="text-xs font-bold text-[#f85508] tracking-widest uppercase">Privacy & Data Governance</span>
          <h1 className="text-3xl font-extrabold text-[#00106b] mt-1">Privacy Policy</h1>
          <p className="text-xs text-slate-500 mt-1">Compliant with UAE Federal Decree-Law No. 45 of 2021 & Global Standards · simply-biz.com</p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#00106b]">1. Information We Collect</h2>
          <p>
            When you inquire via simply-biz.com or retain our incorporation services, we collect identifiable information including your full legal name, passport information, contact email, telephone/WhatsApp number, company activity descriptions, and related KYC records.
          </p>

          <h2 className="text-base font-bold text-[#00106b]">2. Purpose of Processing</h2>
          <p>
            We process your data strictly to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Assess suitability for Mainland or Free Zone corporate registration.</li>
            <li>Submit official incorporation and visa dossiers to UAE licensing departments and immigration channels.</li>
            <li>Maintain customer relationship history and synchronize with enterprise CRM systems (including Pipedrive).</li>
            <li>Comply with UAE anti-money laundering regulations and beneficial ownership filings.</li>
          </ul>

          <h2 className="text-base font-bold text-[#00106b]">3. Data Security & Confidentiality</h2>
          <p>
            All client files are stored on high-grade encrypted infrastructure with role-based access control. We never sell, rent, or lease your private corporate records to third-party commercial marketing brokers.
          </p>

          <h2 className="text-base font-bold text-[#00106b]">4. Exercise of Data Rights</h2>
          <p>
            You have the right to request access, rectification, or deletion of your stored records, subject to statutory UAE record-keeping retention mandates. Inquiries should be sent to <a href="mailto:info@simply-biz.com" className="text-[#00106b] font-bold underline">info@simply-biz.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
