import React from 'react';
import { PageRoute } from '../types';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const RefundPage: React.FC<LegalPageProps> = ({ onNavigate }) => {
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
          <span className="text-xs font-bold text-[#f85508] tracking-widest uppercase">Financial Guidelines</span>
          <h1 className="text-3xl font-extrabold text-[#00106b] mt-1">Refund & Fee Schedule Policy</h1>
          <p className="text-xs text-slate-500 mt-1">simply-biz.com · Published November 2026</p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#00106b]">1. Government Statutory Fees vs. Consulting Retainers</h2>
          <p>
            Payments made towards official UAE government statutory fees (including but not limited to Department of Economy & Tourism initial approvals, trade name reservations, Free Zone registration invoices, GDRFA visa applications, and Emirates ID biometric processing) are remitted directly to the state and are non-refundable once processed by the respective public authority.
          </p>

          <h2 className="text-base font-bold text-[#00106b]">2. Consultancy & PRO Retainer Cancellation</h2>
          <p>
            If a client elects to terminate a company formation mandate prior to the lodgment of official documentation with the government or Free Zone authority, Simply Biz will refund the professional consultancy fee minus an administrative drafting fee of 15% to cover document preparation, MoA formulation, and initial KYC processing.
          </p>

          <h2 className="text-base font-bold text-[#00106b]">3. Bank Account Opening Reminders</h2>
          <p>
            In alignment with UAE Central Bank policies, commercial banks reserve the sovereign right to accept or decline business accounts based on independent internal risk appetites. Consulting fees for corporate bank introduction packages cover documentation auditing, profile preparation, and executive introductions; they do not constitute a purchase of guaranteed bank approval.
          </p>
        </div>
      </div>
    </div>
  );
};
