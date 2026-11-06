import React, { useState } from 'react';
import { PageRoute, SiteBranding, JurisdictionType } from '../types';
import { addLead } from '../services/storage';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Building2, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ContactPageProps {
  branding: SiteBranding;
  onNavigate: (page: PageRoute) => void;
  initialInterest?: {
    serviceTitle?: string;
    details?: string;
  };
}

export const ContactPage: React.FC<ContactPageProps> = ({ 
  branding, 
  onNavigate,
  initialInterest 
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
    initialInterest?.details 
      ? `Inquiring about ${initialInterest.serviceTitle}: ${initialInterest.details}` 
      : ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    leadId: string;
    pipedriveSynced: boolean;
    dealId?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert('Please provide your name, email, and phone number.');
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

      setSubmittedResult({
        leadId: res.lead.id,
        pipedriveSynced: res.lead.pipedriveStatus === 'synced',
        dealId: res.lead.pipedriveDealId ? String(res.lead.pipedriveDealId) : undefined,
      });

      // Clear form
      setName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setMessage('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
          Direct Consultation
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#00106b] tracking-tight">
          Request Your Itemized Business Setup Proposal
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Speak directly with our senior UAE incorporation consultants. We respond within 2 business hours with an official breakdown of license, visa, and office costs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Contact Form (Neomorphic Tactile Card) */}
        <div className="lg:col-span-7 neo-box rounded-3xl p-8 sm:p-10 border border-white">
          {submittedResult ? (
            <div className="text-center py-12 space-y-6">
              <div className="w-16 h-16 rounded-2xl neo-inset mx-auto flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-[#00106b]">
                  Inquiry Successfully Received!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Reference: <span className="font-mono font-bold text-[#00106b]">{submittedResult.leadId}</span>. A senior corporate advisor has been assigned to your file and will contact you shortly.
                </p>
              </div>

              {submittedResult.pipedriveSynced && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl neo-inset text-xs font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Synchronized to Pipedrive CRM {submittedResult.dealId ? `(${submittedResult.dealId})` : ''}</span>
                </div>
              )}

              <div className="pt-6">
                <button
                  onClick={() => setSubmittedResult(null)}
                  className="neo-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Full Name <span className="text-[#f85508]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robert Hastings"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full neo-inset rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Official Email <span className="text-[#f85508]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full neo-inset rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Phone / WhatsApp <span className="text-[#f85508]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+971 50 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full neo-inset rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Company / Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="Proposed or existing entity"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full neo-inset rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                  />
                </div>
              </div>

              {/* Jurisdiction & Visas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Preferred Jurisdiction
                  </label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value as JurisdictionType)}
                    className="w-full neo-inset rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                  >
                    <option value="Undecided">Undecided (Need Advisory)</option>
                    <option value="Free Zone">Free Zone (DMCC, DIFC, Meydan, Shams)</option>
                    <option value="Mainland">Mainland LLC (Dubai DET / TAMM)</option>
                    <option value="Offshore">Offshore / Holding Entity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Investor & Partner Visas Needed
                  </label>
                  <select
                    value={visasNeeded}
                    onChange={(e) => setVisasNeeded(Number(e.target.value))}
                    className="w-full neo-inset rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                  >
                    <option value={0}>0 Visas (License Only)</option>
                    <option value={1}>1 Investor / Partner Visa</option>
                    <option value={2}>2 Visas</option>
                    <option value={3}>3 Visas</option>
                    <option value={4}>4 Visas</option>
                    <option value={5}>5+ Visas (Corporate Quota)</option>
                  </select>
                </div>
              </div>

              {/* Activity & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Business Activity Sector
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI & Software, General Trading, Media"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full neo-inset rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Estimated Budget Range
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full neo-inset rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                  >
                    <option value="Under AED 15,000">Under AED 15,000</option>
                    <option value="AED 15,000 - 30,000">AED 15,000 - 30,000</option>
                    <option value="AED 30,000 - 60,000">AED 30,000 - 60,000</option>
                    <option value="AED 60,000+">AED 60,000+ (Full Mainland & Office)</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Specific Requirements or Questions
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your target clients, corporate banking needs, or timeline..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full neo-inset rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full neo-btn-orange py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span>Processing & Syncing...</span>
                ) : (
                  <>
                    <span>Submit & Request Written Itemized Proposal</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-slate-500">
                🔒 Your confidential information is protected under UAE data privacy laws and processed via our encrypted CRM.
              </div>
            </form>
          )}
        </div>

        {/* Contact Info & Office (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Direct Contacts */}
          <div className="neo-box rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="text-xl font-bold text-[#00106b]">
              Direct Corporate Concierge
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl neo-inset flex items-center justify-center shrink-0 text-[#f85508]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Official Inquiry Email</div>
                  <a href={`mailto:${branding.siteEmail}`} className="font-bold text-[#00106b] hover:text-[#f85508] transition-colors">
                    {branding.siteEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl neo-inset flex items-center justify-center shrink-0 text-[#f85508]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Direct Telephone & WhatsApp</div>
                  <a href={`tel:${branding.sitePhone}`} className="font-bold text-[#00106b] block">
                    {branding.sitePhone}
                  </a>
                  <a href={`https://wa.me/${branding.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold hover:underline">
                    WhatsApp: {branding.whatsappNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl neo-inset flex items-center justify-center shrink-0 text-[#00106b]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Dubai Headquarters</div>
                  <div className="font-medium text-slate-700 leading-relaxed mt-0.5">
                    {branding.address}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl neo-inset flex items-center justify-center shrink-0 text-[#00106b]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Business Hours</div>
                  <div className="font-medium text-slate-700">
                    Monday – Friday: 8:30 AM – 6:30 PM (GST)
                  </div>
                  <div className="text-xs text-slate-500">
                    Saturday: VIP Consultations by Appointment
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Office Location Showcase Card */}
          <div className="neo-box rounded-3xl p-6 sm:p-8 space-y-4">
            <h4 className="text-base font-bold text-[#00106b]">
              Strategic Dubai Location
            </h4>
            <div className="rounded-2xl overflow-hidden neo-inset p-1">
              <img
                src="/images/service_corporate_banking_1793972136605.jpg"
                alt="Simply Biz Dubai Advisory Office"
                className="w-full h-44 object-cover rounded-xl"
              />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Centrally situated with convenient access to Dubai Department of Economy & Tourism (DET) and major Free Zone service centres.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
