import React, { useState, useEffect, useRef } from 'react';
import { SiteBranding, Lead } from '../types';
import { addLead } from '../services/storage';
import { 
  X, 
  Send, 
  MessageCircle, 
  Check, 
  CheckCheck, 
  Phone, 
  ExternalLink, 
  Sparkles,
  Building2,
  FileText,
  ShieldCheck,
  Minimize2,
  ArrowRight
} from 'lucide-react';

interface WhatsAppChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  branding: SiteBranding;
  onOpenQuoteModal: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  options?: { label: string; action: string }[];
  isLeadCapture?: boolean;
}

export const WhatsAppChatbot: React.FC<WhatsAppChatbotProps> = ({
  isOpen,
  onClose,
  branding,
  onOpenQuoteModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Marhaba! 👋 Welcome to Simply Biz UAE Corporate Concierge.\n\nI am your automated business setup advisor. How can I assist you with your UAE company formation, investor residence visas, or corporate banking today?',
      time: 'Just now',
      options: [
        { label: '🏢 Free Zone vs Mainland', action: 'fz_vs_mainland' },
        { label: '💰 Setup Cost Breakdown', action: 'cost_breakdown' },
        { label: '🛂 Investor & Partner Visas', action: 'visas_info' },
        { label: '🏦 Corporate Bank Accounts', action: 'banking_info' },
        { label: '📝 Get Free Instant Quote', action: 'get_quote' },
        { label: '💬 Chat on Real WhatsApp', action: 'external_whatsapp' },
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadCaptureStep, setLeadCaptureStep] = useState<'none' | 'name' | 'email' | 'phone'>('none');
  const [capturedData, setCapturedData] = useState<{ name?: string; email?: string; phone?: string }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanPhone = branding.whatsappNumber.replace(/[^0-9]/g, '');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, isTyping]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Process logic
    setTimeout(() => {
      handleBotResponse(text);
      setIsTyping(false);
    }, 750);
  };

  const handleBotResponse = async (userText: string) => {
    const lower = userText.toLowerCase();

    // 1. If currently in interactive lead capture
    if (leadCaptureStep === 'name') {
      setCapturedData(prev => ({ ...prev, name: userText }));
      setLeadCaptureStep('email');
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Pleased to meet you, ${userText}! What is your work email address so we can email your itemized quotation proposal?`,
          time: getCurrentTime(),
        }
      ]);
      return;
    }

    if (leadCaptureStep === 'email') {
      const email = userText.trim();
      setCapturedData(prev => ({ ...prev, email }));
      setLeadCaptureStep('phone');
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Got it: ${email}. Lastly, please share your phone or WhatsApp number (with country code) so our senior consultant can confirm any specific visa requirements:`,
          time: getCurrentTime(),
        }
      ]);
      return;
    }

    if (leadCaptureStep === 'phone') {
      const phone = userText.trim();
      const finalName = capturedData.name || 'WhatsApp Prospect';
      const finalEmail = capturedData.email || 'prospect@simply-biz.com';

      // Automatically register lead into Admin Panel & trigger emails!
      try {
        const res = await addLead({
          name: finalName,
          email: finalEmail,
          phone,
          jurisdiction: 'Undecided',
          activityType: 'Consulting / Tech / Commercial',
          visasNeeded: 1,
          budget: 'AED 15,000 - 30,000',
          message: 'Inquiry captured via Simply Biz Automated WhatsApp Chatbot on website.',
        });

        setLeadCaptureStep('none');
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🎉 Congratulations ${finalName}! Your quote request has been officially recorded with Reference ID #${res.lead.id}.\n\n✓ Confirmation email dispatched to: ${finalEmail}\n✓ Transmitted to Simply Biz Corporate Team (info@simply-biz.com)\n\nA senior advisor will review your jurisdiction requirements and reach out within 2 hours.`,
            time: getCurrentTime(),
            options: [
              { label: '💬 Chat with Advisor on WhatsApp', action: 'external_whatsapp' },
              { label: '🏢 Compare Free Zone vs Mainland', action: 'fz_vs_mainland' },
              { label: '💰 Check Setup Costs', action: 'cost_breakdown' },
            ]
          }
        ]);
      } catch (err) {
        console.error('Failed to submit captured lead:', err);
      }
      return;
    }

    // 2. Pre-defined responses for actions / keywords
    if (lower.includes('free zone') || lower.includes('mainland') || lower.includes('difference') || lower === 'fz_vs_mainland') {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Here is the difference between UAE Free Zone & Mainland setups:\n\n• **Free Zone Company**: Best for 100% foreign ownership, 0% corporate tax on qualifying international revenue, and remote incorporation (DMCC, DIFC, Meydan, Shams). Packages start from AED 9,999.\n\n• **Mainland LLC**: Allows unrestricted trading across all 7 emirates directly with UAE retail consumers and government bidding. 100% foreign ownership available for 1,000+ activities. Starting from AED 14,500.\n\nWould you like a tailored quote for your business activity?`,
          time: getCurrentTime(),
          options: [
            { label: '📝 Get Free Quote Now', action: 'get_quote' },
            { label: '💰 Cost Breakdown', action: 'cost_breakdown' },
            { label: '🛂 Residence Visas', action: 'visas_info' },
          ]
        }
      ]);
      return;
    }

    if (lower.includes('cost') || lower.includes('price') || lower.includes('fee') || lower.includes('how much') || lower === 'cost_breakdown') {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `💰 **Transparent UAE Setup Cost Overview**:\n\n• Free Zone License: from AED 9,999 (0 visas) to AED 16,500 (1-2 visas)\n• Mainland LLC License: from AED 14,500 (plus Ejari lease)\n• Investor Residence Visa: from AED 3,850 per visa (2-year renewable)\n• Immigration Establishment Card: AED 2,200\n• VIP Medical & Emirates ID Biometrics: Included in our concierge packages.\n\nAt Simply Biz, we guarantee fixed, itemized quotes with zero hidden surprises.`,
          time: getCurrentTime(),
          options: [
            { label: '📝 Request Exact Itemized Quote', action: 'get_quote' },
            { label: '🏦 Corporate Bank Account', action: 'banking_info' },
            { label: '💬 Talk to Consultant on WhatsApp', action: 'external_whatsapp' },
          ]
        }
      ]);
      return;
    }

    if (lower.includes('visa') || lower.includes('residence') || lower.includes('emirates id') || lower === 'visas_info') {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `🛂 **UAE Investor & Residence Visas**:\n\n• **2-Year Investor / Partner Visa**: Issued through your UAE company with full family sponsorship eligibility.\n• **5-Year Green Residence**: For qualifying business investments and executives.\n• **Turnaround**: 5 to 10 working days total.\n• **VIP Concierge**: We escort you through medical fitness and Emirates ID biometrics with priority VIP lanes.\n\nHow many visas will your company require?`,
          time: getCurrentTime(),
          options: [
            { label: '1 Partner Visa', action: 'quote_1_visa' },
            { label: '2-3 Visas', action: 'quote_3_visas' },
            { label: '4+ Corporate Visas', action: 'quote_4_visas' },
          ]
        }
      ]);
      return;
    }

    if (lower.includes('bank') || lower.includes('account') || lower === 'banking_info') {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `🏦 **Corporate Bank Account Advisory**:\n\nWe assist you in opening corporate accounts with premier UAE banks including Emirates NBD, FAB, Mashreq, CBD, and Wio Business.\n\n• We maintain a **96% approval rate** because our advisors perform strict Anti-Money Laundering pre-audits of your business plan and invoice trail before formal submission.\n• Multi-currency accounts: AED, USD, EUR, and GBP.`,
          time: getCurrentTime(),
          options: [
            { label: '📝 Get Setup + Banking Quote', action: 'get_quote' },
            { label: '💬 Chat on WhatsApp with Banker', action: 'external_whatsapp' },
          ]
        }
      ]);
      return;
    }

    if (lower.includes('quote') || lower === 'get_quote' || lower.includes('quote_')) {
      setLeadCaptureStep('name');
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `I will prepare your free itemized proposal right now! 📄\n\nTo start, what is your **Full Name**?`,
          time: getCurrentTime(),
        }
      ]);
      return;
    }

    if (lower.includes('whatsapp') || lower.includes('human') || lower.includes('call') || lower === 'external_whatsapp') {
      const waUrl = `https://wa.me/${cleanPhone || '971527104488'}?text=${encodeURIComponent(
        'Hello Simply Biz Team, I am chatting on your website and would like to speak directly with an incorporation specialist.'
      )}`;
      window.open(waUrl, '_blank');
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Opening our official WhatsApp channel (+971 52 710 4488) now! Our senior consultant is ready to answer your questions directly.`,
          time: getCurrentTime(),
        }
      ]);
      return;
    }

    // Default intelligent conversational fallback
    setMessages(prev => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Thank you for your message. As your corporate concierge, I can help you incorporate in over 40+ Free Zones, set up a 100% foreign-owned Mainland LLC, arrange investor residence visas, and open your corporate bank account.\n\nWould you like me to generate a free itemized quote for your company, or connect you directly with a senior advisor on WhatsApp?`,
        time: getCurrentTime(),
        options: [
          { label: '📝 Get Free Instant Quote', action: 'get_quote' },
          { label: '💬 Direct WhatsApp (+971 52 710 4488)', action: 'external_whatsapp' },
          { label: '🏢 Compare Free Zone vs Mainland', action: 'fz_vs_mainland' },
          { label: '💰 Check Setup Costs', action: 'cost_breakdown' },
        ]
      }
    ]);
  };

  const handleOptionClick = (option: { label: string; action: string }) => {
    if (option.action === 'external_whatsapp') {
      const waUrl = `https://wa.me/${cleanPhone || '971527104488'}?text=${encodeURIComponent(
        'Hello Simply Biz Team, I am chatting with your website advisor and would like to speak with a specialist.'
      )}`;
      window.open(waUrl, '_blank');
      return;
    }

    if (option.action === 'open_quote_modal') {
      onOpenQuoteModal();
      return;
    }

    handleSendMessage(option.label);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[410px] max-w-[420px] h-[580px] max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/60 bg-[#efeae2] transition-all animate-in fade-in slide-in-from-bottom-6 duration-200">
      
      {/* WhatsApp Official Style Header */}
      <div className="bg-[#075E54] text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          
          {/* Avatar with Online Badge */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white text-[#00106b] flex items-center justify-center font-extrabold text-sm shadow-inner">
              SB
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm leading-tight">
              <span>Simply Biz Concierge</span>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 text-[#075E54] flex items-center justify-center text-[9px] font-black" title="Verified UAE Business">
                ✓
              </span>
            </div>
            <div className="text-[11px] text-emerald-100 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span>Online • Automated UAE Setup Advisor</span>
            </div>
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${cleanPhone || '971527104488'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Open in Official WhatsApp App"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WhatsApp Chat Body */}
      <div 
        className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 0.75px, transparent 0.75px)`,
          backgroundSize: '16px 16px',
        }}
      >
        {/* Encrypted Notice Banner */}
        <div className="flex justify-center">
          <span className="text-[10px] bg-amber-100/90 text-amber-900 border border-amber-200/60 px-3 py-1 rounded-lg text-center shadow-xs font-medium">
            🔒 Official Simply Biz automated concierge. Instant quotes with 0 hidden fees.
          </span>
        </div>

        {/* Messages Loop */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-[13px] leading-relaxed shadow-xs relative ${
                  isUser
                    ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-xs'
                    : 'bg-white text-slate-800 rounded-tl-xs border border-slate-100'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[9px] mt-1.5 flex items-center gap-1 ${
                    isUser ? 'text-emerald-700 justify-end' : 'text-slate-400 justify-end'
                  }`}
                >
                  <span>{msg.time}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                </div>
              </div>

              {/* Action Chips */}
              {msg.options && msg.options.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
                  {msg.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionClick(opt)}
                      className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-white text-[#00106b] hover:bg-[#00106b] hover:text-white border border-slate-200 shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-1 bg-white p-2.5 rounded-2xl rounded-tl-xs shadow-xs w-20">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-300" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input Bar */}
      <div className="bg-[#f0f2f5] p-2.5 sm:p-3 border-t border-slate-200 flex items-center gap-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder={
            leadCaptureStep !== 'none'
              ? 'Type your reply here...'
              : 'Ask about Free Zone, Visas, Pricing...'
          }
          className="flex-1 bg-white rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none border border-slate-200 shadow-xs"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim()}
          className="w-9 h-9 rounded-full bg-[#075E54] hover:bg-[#064e46] text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shadow-sm shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Switch to Official WhatsApp Bar */}
      <div className="bg-[#00106b] text-white px-3 py-1.5 text-center text-[11px] flex items-center justify-between">
        <span className="truncate">Official WhatsApp: <strong>{branding.whatsappNumber}</strong></span>
        <a
          href={`https://wa.me/${cleanPhone || '971527104488'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#f85508] hover:underline font-bold text-[10px] shrink-0 ml-2"
        >
          Open App &rarr;
        </a>
      </div>

    </div>
  );
};
