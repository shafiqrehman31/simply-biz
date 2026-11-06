import React, { useState } from 'react';
import { PageRoute, CMSData } from '../types';
import { HeroCarousel } from '../components/HeroCarousel';
import { 
  Building2, 
  Globe, 
  ShieldCheck, 
  CreditCard, 
  FileSpreadsheet, 
  Briefcase, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Clock,
  Sparkles,
  Award,
  Users,
  MessageCircle
} from 'lucide-react';

interface HomePageProps {
  cmsData: CMSData;
  onNavigate: (page: PageRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ cmsData, onNavigate }) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Building2': return <Building2 className="w-6 h-6 text-[#00106b]" />;
      case 'Globe': return <Globe className="w-6 h-6 text-[#00106b]" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-[#00106b]" />;
      case 'CreditCard': return <CreditCard className="w-6 h-6 text-[#00106b]" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-6 h-6 text-[#00106b]" />;
      default: return <Briefcase className="w-6 h-6 text-[#00106b]" />;
    }
  };

  const nextTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev + 1) % cmsData.testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev - 1 + cmsData.testimonials.length) % cmsData.testimonials.length);
  };

  const currentTestimonial = cmsData.testimonials[activeTestimonialIdx] || cmsData.testimonials[0];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Carousel */}
      <HeroCarousel slides={cmsData.heroSlides} onNavigate={onNavigate} />

      {/* Trust & Proof Strip (Tactile Neomorphic Bar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30">
        <div className="neo-box rounded-2xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl neo-inset flex items-center justify-center shrink-0 text-[#f85508]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#00106b] tabular-nums">40+</div>
              <div className="text-xs text-slate-500 font-medium">UAE Free Zones Covered</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl neo-inset flex items-center justify-center shrink-0 text-[#00106b]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#00106b] tabular-nums">100%</div>
              <div className="text-xs text-slate-500 font-medium">Foreign Ownership Ready</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl neo-inset flex items-center justify-center shrink-0 text-[#f85508]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#00106b] tabular-nums">2-5 Days</div>
              <div className="text-xs text-slate-500 font-medium">Average License Turnaround</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl neo-inset flex items-center justify-center shrink-0 text-[#00106b]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#00106b] tabular-nums">1,200+</div>
              <div className="text-xs text-slate-500 font-medium">Visas & Companies Formed</div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Quick Connect Banner on Home Screen */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="neo-box rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/80 bg-gradient-to-r from-emerald-50/60 via-[#f0f4f8] to-slate-50">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#00106b]">
                Need Immediate Answers on UAE Jurisdiction or Visa Quotas?
              </div>
              <div className="text-xs text-slate-500">
                Direct chat with our Dubai PRO concierge on WhatsApp ({cmsData.branding.whatsappNumber}). Fast 5-minute response.
              </div>
            </div>
          </div>
          <a
            href={`https://wa.me/${cmsData.branding.whatsappNumber.replace(/[^0-9]/g, '') || '971527104488'}?text=${encodeURIComponent(
              'Hello Simply Biz Team, I am browsing your website and would like an itemized quote for UAE company formation.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap hover:scale-102 shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Featured Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
              Core Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00106b] tracking-tight">
              Comprehensive UAE Business Setup & Concierge Solutions
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Every detail handled from initial name reservation to official trade license, residence permits, and banking.
            </p>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="neo-btn-neutral px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4 text-[#f85508]" />
          </button>
        </div>

        {/* Tactile Neomorphic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cmsData.services.slice(0, 6).map((service) => (
            <div
              key={service.id}
              className="neo-box neo-box-hover rounded-2xl p-7 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl neo-inset flex items-center justify-center">
                    {getServiceIcon(service.iconName)}
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {service.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#00106b] group-hover:text-[#f85508] transition-colors">
                  {service.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {service.shortDesc}
                </p>

                <ul className="space-y-2 pt-2 border-t border-slate-200/60">
                  {service.features.slice(0, 3).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-[#f85508] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Turnaround</span>
                  <span className="text-xs font-bold text-[#00106b]">{service.timeline}</span>
                </div>
                <button
                  onClick={() => onNavigate('services')}
                  className="neo-btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#f85508]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Focus: Mainland vs Free Zone (Inspired by Section 2 in attached guide) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="neo-box rounded-3xl p-8 sm:p-12 overflow-hidden relative">
          <div className="max-w-3xl mb-10 space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
              Decision Matrix
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#00106b]">
              Mainland vs. Free Zone: Choosing Your Ideal UAE Jurisdiction
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Based on official UAE Department of Economy & Tourism regulations, selecting the right jurisdiction impacts local market access, physical lease requirements, and banking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mainland Column */}
            <div className="neo-inset rounded-2xl p-6 sm:p-8 space-y-5 bg-white/40">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#00106b] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#f85508]" />
                  <span>Mainland Company</span>
                </h3>
                <span className="text-xs font-semibold text-slate-500">Dubai DET / Abu Dhabi TAMM</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ideal for businesses wishing to sell directly to consumers anywhere in the UAE, bid for government tenders, or operate physical retail/dining storefronts.
              </p>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>100% Foreign Ownership</strong> for most commercial activities.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Direct unrestricted trading across all 7 emirates and internationally.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Flexible office options: registered Ejari lease or compliant instant virtual office.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Scalable visa quotas tied to physical premises size.</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('contact')}
                className="w-full neo-btn-primary py-2.5 rounded-xl text-xs font-bold text-center mt-4 cursor-pointer"
              >
                Inquire for Mainland Setup
              </button>
            </div>

            {/* Free Zone Column */}
            <div className="neo-inset rounded-2xl p-6 sm:p-8 space-y-5 bg-white/40">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#00106b] flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#f85508]" />
                  <span>Free Zone Company</span>
                </h3>
                <span className="text-xs font-semibold text-slate-500">DMCC, DIFC, Meydan, Shams</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tailored for international trade, digital consultants, SaaS, global media, and holding entities requiring high cost-efficiency and quick remote formation.
              </p>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>0% Corporate Tax</strong> on qualifying income (QFZP conditions apply).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>100% foreign ownership and 100% capital and profit repatriation.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Flexi-desk packages from 0 to 15+ investor & employee visas.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>No physical presence required during initial electronic licensing.</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('contact')}
                className="w-full neo-btn-orange py-2.5 rounded-xl text-xs font-bold text-center mt-4 cursor-pointer"
              >
                Inquire for Free Zone Packages
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonial Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
              Proven Results
            </span>
            <h2 className="text-3xl font-extrabold text-[#00106b] tracking-tight">
              What Global Founders Say About Simply Biz
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-xl neo-box flex items-center justify-center text-[#00106b] hover:text-[#f85508] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextTestimonial}
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-xl neo-box flex items-center justify-center text-[#00106b] hover:text-[#f85508] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Testimonial Card */}
        <div className="neo-box rounded-3xl p-8 sm:p-12 relative overflow-hidden transition-all duration-300">
          <div className="flex items-center gap-1 mb-6">
            {[...Array(currentTestimonial.rating || 5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-[#f85508] text-[#f85508]" />
            ))}
          </div>

          <blockquote className="text-lg sm:text-xl md:text-2xl font-medium text-slate-800 leading-relaxed mb-8">
            "{currentTestimonial.quote}"
          </blockquote>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200/60 flex-wrap gap-4">
            <div>
              <div className="text-base font-bold text-[#00106b]">
                {currentTestimonial.clientName}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {currentTestimonial.role} · {currentTestimonial.companyName}
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-full neo-inset text-xs font-semibold text-[#00106b]">
              {currentTestimonial.jurisdiction}
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (Neomorphic Accordion) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
            Clarity & Insights
          </span>
          <h2 className="text-3xl font-extrabold text-[#00106b]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Essential facts on UAE company registration, residence visas, and banking procedures.
          </p>
        </div>

        <div className="space-y-4">
          {cmsData.faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl transition-all ${
                  isOpen ? 'neo-inset p-6 bg-white/60' : 'neo-box p-6'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="text-base sm:text-lg font-bold text-[#00106b]">
                    {faq.question}
                  </span>
                  <div className="w-8 h-8 rounded-lg neo-box flex items-center justify-center shrink-0 text-[#f85508]">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-200/60 text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="neo-box rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-[#f0f4f8] via-[#e8eff6] to-[#dce5f0] flex flex-col lg:flex-row items-center justify-between gap-8 border border-white">
          <div className="space-y-4 max-w-2xl">
            <span className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
              Start Your UAE Journey
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#00106b] tracking-tight">
              Ready for an Itemized, Transparent Quotation?
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Connect with our senior incorporation specialists. We evaluate your business activity, visa requirements, and banking goals to structure the optimal corporate solution.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto neo-btn-orange px-6 py-3.5 rounded-xl font-bold text-sm text-center shadow-lg cursor-pointer"
            >
              Request Free Consultation
            </button>
            <a
              href={`https://wa.me/${cmsData.branding.whatsappNumber.replace(/[^0-9]/g, '') || '971527104488'}?text=${encodeURIComponent(
                'Hello Simply Biz Team, I am requesting a consultation for setting up my UAE business.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
              <span>WhatsApp Direct</span>
            </a>
            <button
              onClick={() => onNavigate('services')}
              className="w-full sm:w-auto neo-btn-neutral px-5 py-3.5 rounded-xl font-bold text-sm text-center cursor-pointer"
            >
              Explore Pricing & Visas
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
