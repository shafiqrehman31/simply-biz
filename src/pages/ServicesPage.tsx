import React, { useState } from 'react';
import { PageRoute, ServiceItem } from '../types';
import { 
  Building2, 
  Globe, 
  ShieldCheck, 
  CreditCard, 
  FileSpreadsheet, 
  Briefcase, 
  Check, 
  ArrowRight, 
  Calculator,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface ServicesPageProps {
  services: ServiceItem[];
  onNavigate: (page: PageRoute) => void;
  onSelectServiceForQuote?: (serviceTitle: string, details: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ 
  services, 
  onNavigate,
  onSelectServiceForQuote 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Interactive Estimator State
  const [estimatorJurisdiction, setEstimatorJurisdiction] = useState<'freezone' | 'mainland'>('freezone');
  const [estimatorActivity, setEstimatorActivity] = useState<string>('tech');
  const [estimatorVisas, setEstimatorVisas] = useState<number>(1);
  const [estimatorOffice, setEstimatorOffice] = useState<string>('flexi');

  const categories = ['All', 'Mainland', 'Free Zone', 'Residency Visa', 'Banking & Tax'];

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Building2': return <Building2 className="w-7 h-7 text-[#00106b]" />;
      case 'Globe': return <Globe className="w-7 h-7 text-[#00106b]" />;
      case 'ShieldCheck': return <ShieldCheck className="w-7 h-7 text-[#00106b]" />;
      case 'CreditCard': return <CreditCard className="w-7 h-7 text-[#00106b]" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-7 h-7 text-[#00106b]" />;
      default: return <Briefcase className="w-7 h-7 text-[#00106b]" />;
    }
  };

  // Calculate Estimator Figures
  const baseLicense = estimatorJurisdiction === 'freezone' ? 12500 : 16500;
  const activityFee = estimatorActivity === 'trading' ? 2500 : estimatorActivity === 'tech' ? 1000 : 1500;
  const officeFee = estimatorOffice === 'private' ? 18000 : estimatorOffice === 'dedicated' ? 8000 : 0;
  const immigrationCard = 2200;
  const visaCostPerPerson = 3850;
  const totalVisasCost = estimatorVisas * visaCostPerPerson;
  const estimatedTotal = baseLicense + activityFee + officeFee + (estimatorVisas > 0 ? immigrationCard : 0) + totalVisasCost;

  const handleApplyEstimateToContact = () => {
    if (onSelectServiceForQuote) {
      onSelectServiceForQuote(
        `${estimatorJurisdiction === 'freezone' ? 'Free Zone' : 'Mainland'} Setup Package`,
        `Calculated Estimate: ~AED ${estimatedTotal.toLocaleString()} for ${estimatorVisas} visa(s), ${estimatorActivity} activity, and ${estimatorOffice} office.`
      );
    }
    onNavigate('contact');
  };

  return (
    <div className="space-y-20 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
          Corporate Solutions
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#00106b] tracking-tight">
          Tailored UAE Incorporation & Regulatory Services
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          From full 100% foreign-owned mainland enterprises to cost-effective free zone formations, investor residency permits, and corporate banking compliance.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'neo-inset text-[#00106b] font-bold'
                  : 'neo-box text-slate-600 hover:text-[#00106b]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="neo-box rounded-2xl p-7 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl neo-inset flex items-center justify-center">
                  {getServiceIcon(service.iconName)}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/60 text-slate-600">
                  {service.category}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#00106b]">
                  {service.title}
                </h3>
                <p className="text-xs text-[#f85508] font-bold mt-1">
                  {service.startingPrice}
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {service.fullDesc}
              </p>

              <div className="space-y-2 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  What's Included:
                </span>
                {service.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-[#f85508] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-[#00106b]" />
                <span className="font-semibold text-slate-700">{service.timeline}</span>
              </div>
              <button
                onClick={() => {
                  if (onSelectServiceForQuote) {
                    onSelectServiceForQuote(service.title, service.shortDesc);
                  }
                  onNavigate('contact');
                }}
                className="neo-btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Request Quote</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#f85508]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive UAE Business Setup Cost & Jurisdiction Estimator */}
      <section className="neo-box rounded-3xl p-8 sm:p-12 overflow-hidden border border-white">
        <div className="max-w-2xl space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#f85508] uppercase">
            <Calculator className="w-4 h-4" />
            <span>Interactive Cost Estimator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#00106b]">
            Transparent Budget Calculator
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Configure your intended business structure to see an itemized estimate, taking into account establishment card, visa quotas, and authority requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Jurisdiction Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                1. Select Target Jurisdiction
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEstimatorJurisdiction('freezone')}
                  className={`p-3.5 rounded-xl text-left transition-all ${
                    estimatorJurisdiction === 'freezone'
                      ? 'neo-inset text-[#00106b] font-bold border-l-2 border-l-[#f85508]'
                      : 'neo-box text-slate-600'
                  }`}
                >
                  <div className="text-sm font-bold">Free Zone Company</div>
                  <div className="text-[11px] text-slate-500">DMCC, Meydan, Shams, RAKEZ</div>
                </button>
                <button
                  type="button"
                  onClick={() => setEstimatorJurisdiction('mainland')}
                  className={`p-3.5 rounded-xl text-left transition-all ${
                    estimatorJurisdiction === 'mainland'
                      ? 'neo-inset text-[#00106b] font-bold border-l-2 border-l-[#f85508]'
                      : 'neo-box text-slate-600'
                  }`}
                >
                  <div className="text-sm font-bold">Mainland LLC</div>
                  <div className="text-[11px] text-slate-500">Dubai DET, Abu Dhabi TAMM</div>
                </button>
              </div>
            </div>

            {/* Business Activity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                2. Business Activity Type
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'tech', label: 'Tech, SaaS & AI' },
                  { id: 'consulting', label: 'Consulting & Media' },
                  { id: 'trading', label: 'General Trading' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setEstimatorActivity(act.id)}
                    className={`p-2.5 rounded-xl font-medium text-center transition-all ${
                      estimatorActivity === act.id
                        ? 'neo-inset text-[#00106b] font-bold'
                        : 'neo-box text-slate-600'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visas needed */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                3. Residence Visas Needed (Investor / Partner / Employee)
              </label>
              <div className="flex items-center gap-3">
                {[0, 1, 2, 3, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setEstimatorVisas(v)}
                    className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${
                      estimatorVisas === v
                        ? 'neo-inset text-[#f85508]'
                        : 'neo-box text-slate-700'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Includes entry permit, VIP medical fitness, and Emirates ID biometric processing.
              </p>
            </div>

            {/* Office Premises */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                4. Office Facility / Premises
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'flexi', label: 'Flexi-Desk / Virtual' },
                  { id: 'dedicated', label: 'Dedicated Desk' },
                  { id: 'private', label: 'Private Office' },
                ].map((off) => (
                  <button
                    key={off.id}
                    type="button"
                    onClick={() => setEstimatorOffice(off.id)}
                    className={`p-2.5 rounded-xl font-medium text-center transition-all ${
                      estimatorOffice === off.id
                        ? 'neo-inset text-[#00106b] font-bold'
                        : 'neo-box text-slate-600'
                    }`}
                  >
                    {off.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="lg:col-span-5 neo-inset rounded-2xl p-6 sm:p-8 space-y-5 bg-white/70">
            <h4 className="text-base font-bold text-[#00106b] border-b border-slate-200 pb-3">
              Itemized Estimate Breakdown
            </h4>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span>Base Authority License & Registration:</span>
                <span className="font-semibold text-slate-800">AED {baseLicense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Activity Approvals & Classification:</span>
                <span className="font-semibold text-slate-800">AED {activityFee.toLocaleString()}</span>
              </div>
              {officeFee > 0 && (
                <div className="flex justify-between items-center">
                  <span>Office Space & Lease Ejari:</span>
                  <span className="font-semibold text-slate-800">AED {officeFee.toLocaleString()}</span>
                </div>
              )}
              {estimatorVisas > 0 && (
                <div className="flex justify-between items-center">
                  <span>Immigration Establishment Card:</span>
                  <span className="font-semibold text-slate-800">AED {immigrationCard.toLocaleString()}</span>
                </div>
              )}
              {estimatorVisas > 0 && (
                <div className="flex justify-between items-center">
                  <span>Residence Visas ({estimatorVisas}x full processing):</span>
                  <span className="font-semibold text-slate-800">AED {totalVisasCost.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-300">
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase font-bold text-slate-500">Estimated Total:</span>
                <span className="text-2xl font-extrabold text-[#00106b]">
                  AED {estimatedTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                *Subject to official authority review and VAT where applicable. No surprise extras.
              </p>
            </div>

            <button
              onClick={handleApplyEstimateToContact}
              className="w-full neo-btn-orange py-3.5 rounded-xl font-bold text-xs sm:text-sm text-center shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Lock In This Itemized Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
