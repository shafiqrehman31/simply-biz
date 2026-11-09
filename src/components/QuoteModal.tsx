import React, { useState, useEffect } from 'react';
import { SiteBranding, JurisdictionType } from '../types';
import { addLead } from '../services/storage';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Building2, 
  Sparkles, 
  FileText, 
  MessageCircle, 
  ArrowRight,
  ShieldCheck,
  Eye
} from 'lucide-react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: SiteBranding;
  initialService?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  branding,
  initialService,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [jurisdiction, setJurisdiction] = useState<JurisdictionType>('Undecided');
  const [activityType, setActivityType] = useState('Consulting & Tech');
  const [visasNeeded, setVisasNeeded] = useState<number>(1);
  const [budget, setBudget] = useState('AED 15,000 - 30,000');
  const [message, setMessage] = useState(
    initialService ? `Inquiring about ${initialService} package and residence visas.` : ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<{
    id: string;
    email: string;
    name: string;
    previewHtml?: string;
  } | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addLead({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim() || undefined,
        jurisdiction,
        activityType,
        visasNeeded,
        budget,
        message: message.trim(),
      });

      // Find the customer email preview from emailsSent
      const customerEmailLog = res.emailsSent.find(e => e.type === 'customer_confirmation');

      setSubmittedLead({
        id: res.lead.id,
        email: res.lead.email,
        name: res.lead.name,
        previewHtml: customerEmailLog?.htmlBody,
      });
    } catch (err) {
      console.error('Failed to submit quote inquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedLead(null);
    setShowEmailPreview(false);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setMessage('');
    onClose();
  };

  const cleanPhone = branding.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
    >
      <div className="neo-box rounded-3xl max-w-xl w-full bg-[#f0f4f8] border border-white my-8 shadow-2xl relative overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Accent Strip */}
        <div className="h-2 w-full bg-gradient-to-r from-[#00106b] via-[#f85508] to-[#00106b]" />

        {/* Header */}
        <div className="p-6 sm:p-8 pb-4 flex items-start justify-between border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#f85508] text-[10px] font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Free Itemized Proposal</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#00106b] tracking-tight">
              Request Your Free Quote
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Guaranteed official cost breakdown with 0 hidden fees. Confirmation is sent to your email immediately.
            </p>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl neo-box-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0 ml-4"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 pt-6 max-h-[80vh] overflow-y-auto">
          {submittedLead ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl neo-inset mx-auto flex items-center justify-center text-emerald-600 bg-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-[#00106b]">
                  Quote Request Dispatched!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-[#00106b]">{submittedLead.name}</strong>. Your setup reference is <span className="font-mono font-bold text-[#00106b] bg-slate-200/80 px-2 py-0.5 rounded">{submittedLead.id}</span>.
                </p>
              </div>

              {/* Email Delivery Confirmation Cards */}
              <div className="space-y-2.5 text-left text-xs max-w-md mx-auto">
                <div className="neo-box p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-emerald-900 font-semibold">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Confirmation sent to: <strong>{submittedLead.email}</strong></span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Delivered
                  </span>
                </div>

                <div className="neo-box p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-blue-900 font-semibold">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Dispatched to Simply Biz CRM & info@simply-biz.com</span>
                  </div>
                  <span className="text-[10px] bg-blue-200 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    Recorded
                  </span>
                </div>
              </div>

              {/* Toggle to preview the customer email */}
              {submittedLead.previewHtml && (
                <div className="pt-2 text-left">
                  <button
                    type="button"
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="neo-btn-neutral w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#00106b] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-[#f85508]" />
                    <span>{showEmailPreview ? 'Hide Email Preview' : 'Preview Generated Email Template'}</span>
                  </button>

                  {showEmailPreview && (
                    <div className="mt-3 p-4 rounded-2xl neo-inset bg-white border border-slate-200 text-left text-xs max-h-64 overflow-y-auto">
                      <div className="font-bold text-[#00106b] border-b pb-2 mb-2 flex items-center justify-between">
                        <span>Customer Email Copy:</span>
                        <span className="text-[10px] text-slate-400 font-normal">To: {submittedLead.email}</span>
                      </div>
                      <iframe
                        srcDoc={submittedLead.previewHtml}
                        title="Customer Email Template Preview"
                        className="w-full h-80 border-0 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/${cleanPhone || '971527104488'}?text=${encodeURIComponent(
                    `Hello Simply Biz Team, I just submitted quote request #${submittedLead.id} on your website. I would like to speak with an advisor.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform hover:scale-102"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                  <span>Chat with Advisor on WhatsApp</span>
                </a>

                <button
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto neo-btn-primary px-6 py-3 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close & Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name <span className="text-[#f85508]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Michael Davies"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full neo-inset rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Work Email <span className="text-[#f85508]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full neo-inset rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Itemized proposal will be sent here
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / WhatsApp <span className="text-[#f85508]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+971 50 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full neo-inset rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company / Trade Name
                  </label>
                  <input
                    type="text"
                    placeholder="Proposed venture name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full neo-inset rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                  />
                </div>
              </div>

              {/* Jurisdiction & Visas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Jurisdiction
                  </label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value as JurisdictionType)}
                    className="w-full neo-inset rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Undecided">Undecided (Need Recommendation)</option>
                    <option value="Free Zone">Free Zone (DMCC, Meydan, Shams, DIFC)</option>
                    <option value="Mainland">Mainland LLC (100% Foreign Owned)</option>
                    <option value="Offshore">Offshore Holding Entity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Visas Needed
                  </label>
                  <select
                    value={visasNeeded}
                    onChange={(e) => setVisasNeeded(Number(e.target.value))}
                    className="w-full neo-inset rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value={0}>0 Visas (Trade License Only)</option>
                    <option value={1}>1 Investor / Partner Visa</option>
                    <option value={2}>2 Visas</option>
                    <option value={3}>3 Visas</option>
                    <option value={4}>4 Visas</option>
                    <option value={5}>5+ Visas (Corporate Office)</option>
                  </select>
                </div>
              </div>

              {/* Activity & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Sector
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IT Consulting, Trading, E-commerce"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full neo-inset rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Budget
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full neo-inset rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Under AED 15,000">Under AED 15,000</option>
                    <option value="AED 15,000 - 30,000">AED 15,000 - 30,000</option>
                    <option value="AED 30,000 - 60,000">AED 30,000 - 60,000</option>
                    <option value="AED 60,000+">AED 60,000+ (Full Mainland & Office)</option>
                  </select>
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specific Requirements or Questions
                </label>
                <textarea
                  rows={2}
                  placeholder="Need corporate bank account assistance, urgency, etc..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full neo-inset rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full neo-btn-orange py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Generating & Sending Quote...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Get Free Itemized Quote (Instant Email)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero spam guarantee. Itemized government tariff provided.</span>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
