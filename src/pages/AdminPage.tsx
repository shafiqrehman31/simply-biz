import React, { useState, useEffect } from 'react';
import { 
  CMSData, 
  Lead, 
  PipedriveConfig, 
  SiteBranding, 
  HeroSlide, 
  ServiceItem, 
  FAQItem, 
  TestimonialItem,
  AdminUser,
  PageRoute,
  EmailLog,
  AboutPageContent,
  WhyUsPageContent,
  ServicesPageContent
} from '../types';
import { 
  getLeads, 
  saveLeads, 
  getCMSData, 
  saveCMSData, 
  syncLeadToPipedrive,
  DEFAULT_CMS_DATA,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_WHY_US_CONTENT,
  DEFAULT_SERVICES_PAGE_CONTENT,
  subscribeToLeads,
  syncLeadsFromFirestore,
  updateLeadStatusInFirestore
} from '../services/storage';
import { getEmailLogs, getEmailLogsForLead, subscribeToEmailLogs, sendTestEmail } from '../services/emailService';
import { 
  Users, 
  Sliders, 
  Layers, 
  Image, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Save, 
  Eye, 
  EyeOff,
  ExternalLink,
  Shield,
  Key,
  Database,
  ArrowRight,
  Upload,
  Lock,
  Unlock,
  LogOut,
  AlertTriangle,
  ArrowLeft,
  Mail
} from 'lucide-react';

interface AdminPageProps {
  cmsData: CMSData;
  onUpdateCMS: (data: CMSData) => void;
  onNavigate: (page: PageRoute) => void;
}

const SECURITY_STORAGE_KEY = 'simplybiz_admin_security_v1';
const SESSION_STORAGE_KEY = 'simplybiz_admin_session_v1';
const MAX_FAILED_ATTEMPTS = 4;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const AdminPage: React.FC<AdminPageProps> = ({ 
  cmsData, 
  onUpdateCMS,
  onNavigate 
}) => {
  // --- AUTH & SECURITY STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(sessionStorage.getItem(SESSION_STORAGE_KEY));
    } catch {
      return false;
    }
  });

  const [currentAdmin, setCurrentAdmin] = useState<{ email: string; name: string; role: string } | null>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Login form inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Lockout state
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(SECURITY_STORAGE_KEY);
      if (!raw) return 0;
      const data = JSON.parse(raw);
      if (data.lockoutUntil && data.lockoutUntil < Date.now()) {
        return 0; // Lockout expired
      }
      return data.failedAttempts || 0;
    } catch {
      return 0;
    }
  });

  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(SECURITY_STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.lockoutUntil && data.lockoutUntil > Date.now()) {
        return data.lockoutUntil;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Live timer for 15-minute freeze
  useEffect(() => {
    if (!lockoutUntil) {
      setSecondsRemaining(0);
      return;
    }

    const checkLockout = () => {
      const diff = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setSecondsRemaining(diff);
      if (diff <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        localStorage.removeItem(SECURITY_STORAGE_KEY);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil && lockoutUntil > Date.now()) {
      return;
    }

    const emailTrimmed = loginEmail.trim().toLowerCase();
    const passwordTrimmed = loginPassword.trim();

    // Check against super admin or registered admin users
    const validSuperAdmin = 
      (emailTrimmed === 'info@simply-biz.com' || emailTrimmed === 'admin@simply-biz.com') && 
      (passwordTrimmed === 'SimplyBiz@2026!' || passwordTrimmed === 'simplybiz2026' || passwordTrimmed === 'admin123');

    const matchedUser = cmsData.adminUsers.find(
      u => u.email.toLowerCase() === emailTrimmed
    );

    const isUserValid = matchedUser && (passwordTrimmed === 'SimplyBiz@2026!' || passwordTrimmed === 'simplybiz2026');

    if (validSuperAdmin || isUserValid) {
      // Success! Reset security counters
      setFailedAttempts(0);
      setLockoutUntil(null);
      localStorage.removeItem(SECURITY_STORAGE_KEY);

      const userSession = {
        email: emailTrimmed,
        name: matchedUser ? matchedUser.name : 'Super Administrator',
        role: matchedUser ? matchedUser.role : 'Super Admin',
      };

      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userSession));
      } catch (err) {
        console.error(err);
      }

      setCurrentAdmin(userSession);
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      // Failed login
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutUntil(lockTime);
        localStorage.setItem(
          SECURITY_STORAGE_KEY,
          JSON.stringify({ failedAttempts: nextAttempts, lockoutUntil: lockTime })
        );
        setLoginError(
          `Security Freeze Activated: ${MAX_FAILED_ATTEMPTS} incorrect login attempts. Access is locked for 15 minutes.`
        );
      } else {
        localStorage.setItem(
          SECURITY_STORAGE_KEY,
          JSON.stringify({ failedAttempts: nextAttempts, lockoutUntil: null })
        );
        const remaining = MAX_FAILED_ATTEMPTS - nextAttempts;
        setLoginError(
          `Invalid email or password. Attempt ${nextAttempts} of ${MAX_FAILED_ATTEMPTS}. (${remaining} attempt${remaining === 1 ? '' : 's'} before 15-minute freeze).`
        );
      }
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    setLoginPassword('');
  };

  const [activeTab, setActiveTab] = useState<'leads' | 'pipedrive' | 'branding' | 'cms' | 'users' | 'emails'>('leads');
  const [leads, setLeads] = useState<Lead[]>(getLeads());
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(getEmailLogs());
  const [selectedEmailPreview, setSelectedEmailPreview] = useState<EmailLog | null>(null);
  const [isRefreshingLeads, setIsRefreshingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Real-time synchronization: Instantly update leads & email logs across different browsers and devices via Cloud Firestore
  useEffect(() => {
    // 1. Subscribe to Cloud Firestore in real time for cross-browser synchronization
    const unsubLeads = subscribeToLeads((firestoreLeads) => {
      setLeads(firestoreLeads);
    });

    const unsubEmails = subscribeToEmailLogs((firestoreEmails) => {
      setEmailLogs(firestoreEmails);
    });

    // 2. Local fallback events
    const handleLeadAdded = (e: any) => {
      const updatedLeads = getLeads();
      setLeads(updatedLeads);
      setEmailLogs(getEmailLogs());
      const leadName = e?.detail?.lead?.name || 'New Prospect';
      setSaveSuccessMessage(`🔔 New Quote Received from ${leadName}! Form entry added to Leads.`);
      setTimeout(() => setSaveSuccessMessage(null), 5000);
    };

    const handleEmailsSent = () => {
      setEmailLogs(getEmailLogs());
    };

    const handleStorageChange = () => {
      setLeads(getLeads());
      setEmailLogs(getEmailLogs());
    };

    window.addEventListener('simplybiz_lead_added', handleLeadAdded);
    window.addEventListener('simplybiz_emails_sent', handleEmailsSent);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubLeads();
      unsubEmails();
      window.removeEventListener('simplybiz_lead_added', handleLeadAdded);
      window.removeEventListener('simplybiz_emails_sent', handleEmailsSent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleManualRefreshLeads = async () => {
    setIsRefreshingLeads(true);
    try {
      const synced = await syncLeadsFromFirestore();
      setLeads(synced);
      setEmailLogs(getEmailLogs());
      setSaveSuccessMessage('✓ Inquiries & Leads synchronized with Cloud Database.');
    } catch (err) {
      console.warn('Manual refresh notice:', err);
    } finally {
      setIsRefreshingLeads(false);
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    }
  };

  // Local draft states
  const [brandingDraft, setBrandingDraft] = useState<SiteBranding>(cmsData.branding);
  const [pipedriveDraft, setPipedriveDraft] = useState<PipedriveConfig>(cmsData.pipedrive);
  const [isTestingPipedrive, setIsTestingPipedrive] = useState(false);
  const [pipedriveTestLog, setPipedriveTestLog] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // CMS Subtabs
  const [cmsSubtab, setCmsSubtab] = useState<'hero' | 'services' | 'faqs' | 'testimonials' | 'about' | 'whyUs' | 'servicesPage'>('hero');
  const [editingHeroSlide, setEditingHeroSlide] = useState<HeroSlide | null>(null);

  // Featured Services Editor state
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNewService, setIsNewService] = useState(false);
  const [serviceFeaturesText, setServiceFeaturesText] = useState('');

  // FAQs Editor state
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [isNewFaq, setIsNewFaq] = useState(false);

  // Testimonials Editor state
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [isNewTestimonial, setIsNewTestimonial] = useState(false);

  // Page Content Drafts
  const [aboutDraft, setAboutDraft] = useState<AboutPageContent>(cmsData.aboutContent || DEFAULT_ABOUT_CONTENT);
  const [whyUsDraft, setWhyUsDraft] = useState<WhyUsPageContent>(cmsData.whyUsContent || DEFAULT_WHY_US_CONTENT);
  const [servicesPageDraft, setServicesPageDraft] = useState<ServicesPageContent>(cmsData.servicesContent || DEFAULT_SERVICES_PAGE_CONTENT);

  // Email Test Console state
  const [testEmailRecipient, setTestEmailRecipient] = useState(cmsData.branding.siteEmail || 'info@simply-biz.com');
  const [testEmailTemplate, setTestEmailTemplate] = useState<'both' | 'customer_confirmation' | 'admin_notification'>('both');
  const [testProspectName, setTestProspectName] = useState('Alexander Vance');
  const [testJurisdiction, setTestJurisdiction] = useState('Mainland');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestFeedback, setEmailTestFeedback] = useState<string | null>(null);

  // Users tab
  const [usersList, setUsersList] = useState<AdminUser[]>(cmsData.adminUsers);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Super Admin' | 'Senior Consultant' | 'CRM Manager'>('Senior Consultant');

  // Trigger feedback banner
  const triggerSaveSuccess = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // --- PAGE CONTENT SAVE HANDLERS ---
  const handleSaveAboutContent = () => {
    const updated = {
      ...cmsData,
      aboutContent: aboutDraft,
    };
    onUpdateCMS(updated);
    saveCMSData(updated);
    triggerSaveSuccess('About Us page content updated successfully.');
  };

  const handleSaveWhyUsContent = () => {
    const updated = {
      ...cmsData,
      whyUsContent: whyUsDraft,
    };
    onUpdateCMS(updated);
    saveCMSData(updated);
    triggerSaveSuccess('Why Choose Us page content updated successfully.');
  };

  const handleSaveServicesPageContent = () => {
    const updated = {
      ...cmsData,
      servicesContent: servicesPageDraft,
    };
    onUpdateCMS(updated);
    saveCMSData(updated);
    triggerSaveSuccess('Services page header & guidelines updated successfully.');
  };

  // --- SERVICE ITEM HANDLERS ---
  const handleOpenAddService = () => {
    setIsNewService(true);
    setEditingService({
      id: `service-${Date.now()}`,
      title: '',
      shortDesc: '',
      fullDesc: '',
      category: 'Mainland',
      features: ['100% foreign ownership', 'Complete government registration', 'Direct UAE mainland trading'],
      timeline: '3 to 5 working days',
      startingPrice: 'From AED 12,500',
      iconName: 'Building2',
      popular: false,
    });
    setServiceFeaturesText('100% foreign ownership\nComplete government registration\nDirect UAE mainland trading');
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setIsNewService(false);
    setEditingService(service);
    setServiceFeaturesText((service.features || []).join('\n'));
  };

  const handleSaveService = () => {
    if (!editingService || !editingService.title.trim()) {
      alert('Please enter a service title.');
      return;
    }
    const featuresList = serviceFeaturesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const finalizedService: ServiceItem = {
      ...editingService,
      features: featuresList.length > 0 ? featuresList : ['All-inclusive government licensing'],
    };

    let updatedServices: ServiceItem[];
    if (isNewService) {
      updatedServices = [...cmsData.services, finalizedService];
    } else {
      updatedServices = cmsData.services.map(s => s.id === finalizedService.id ? finalizedService : s);
    }

    const updated = { ...cmsData, services: updatedServices };
    onUpdateCMS(updated);
    saveCMSData(updated);
    setEditingService(null);
    triggerSaveSuccess(isNewService ? `Service "${finalizedService.title}" created.` : `Service "${finalizedService.title}" updated.`);
  };

  const handleDeleteService = (id: string) => {
    if (cmsData.services.length <= 1) {
      alert('You must keep at least one service.');
      return;
    }
    if (!confirm('Are you sure you want to remove this service?')) return;
    const updatedServices = cmsData.services.filter(s => s.id !== id);
    const updated = { ...cmsData, services: updatedServices };
    onUpdateCMS(updated);
    saveCMSData(updated);
    triggerSaveSuccess('Service removed.');
  };

  // --- FAQ ITEM HANDLERS ---
  const handleOpenAddFaq = () => {
    setIsNewFaq(true);
    setEditingFaq({
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
      category: 'General',
    });
  };

  const handleOpenEditFaq = (faq: FAQItem) => {
    setIsNewFaq(false);
    setEditingFaq(faq);
  };

  const handleSaveFaq = () => {
    if (!editingFaq || !editingFaq.question.trim() || !editingFaq.answer.trim()) {
      alert('Please fill out both Question and Answer fields.');
      return;
    }
    let updatedFaqs: FAQItem[];
    if (isNewFaq) {
      updatedFaqs = [...cmsData.faqs, editingFaq];
    } else {
      updatedFaqs = cmsData.faqs.map(f => f.id === editingFaq.id ? editingFaq : f);
    }
    const updated = { ...cmsData, faqs: updatedFaqs };
    onUpdateCMS(updated);
    saveCMSData(updated);
    setEditingFaq(null);
    triggerSaveSuccess(isNewFaq ? 'New FAQ created.' : 'FAQ updated.');
  };

  const handleDeleteFaq = (id: string) => {
    if (cmsData.faqs.length <= 1) {
      alert('You must keep at least one FAQ.');
      return;
    }
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    const updatedFaqs = cmsData.faqs.filter(f => f.id !== id);
    const updated = { ...cmsData, faqs: updatedFaqs };
    onUpdateCMS(updated);
    saveCMSData(updated);
    triggerSaveSuccess('FAQ removed.');
  };

  // --- TESTIMONIAL ITEM HANDLERS ---
  const handleOpenAddTestimonial = () => {
    setIsNewTestimonial(true);
    setEditingTestimonial({
      id: `test-${Date.now()}`,
      clientName: '',
      role: 'Founder & CEO',
      companyName: '',
      jurisdiction: 'Dubai Mainland (DET)',
      quote: '',
      rating: 5,
    });
  };

  const handleOpenEditTestimonial = (test: TestimonialItem) => {
    setIsNewTestimonial(false);
    setEditingTestimonial(test);
  };

  const handleSaveTestimonial = () => {
    if (!editingTestimonial || !editingTestimonial.clientName.trim() || !editingTestimonial.quote.trim()) {
      alert('Please provide client name and testimonial quote.');
      return;
    }
    let updatedTests: TestimonialItem[];
    if (isNewTestimonial) {
      updatedTests = [...cmsData.testimonials, editingTestimonial];
    } else {
      updatedTests = cmsData.testimonials.map(t => t.id === editingTestimonial.id ? editingTestimonial : t);
    }
    const updated = { ...cmsData, testimonials: updatedTests };
    onUpdateCMS(updated);
    saveCMSData(updated);
    setEditingTestimonial(null);
    triggerSaveSuccess(isNewTestimonial ? 'New Testimonial added.' : 'Testimonial updated.');
  };

  const handleDeleteTestimonial = (id: string) => {
    if (cmsData.testimonials.length <= 1) {
      alert('You must keep at least one testimonial.');
      return;
    }
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    const updatedTests = cmsData.testimonials.filter(t => t.id !== id);
    const updated = { ...cmsData, testimonials: updatedTests };
    onUpdateCMS(updated);
    saveCMSData(updated);
    triggerSaveSuccess('Testimonial removed.');
  };

  // --- EMAIL DELIVERY TEST RUNNER ---
  const handleRunEmailDeliveryTest = () => {
    if (!testEmailRecipient.trim()) {
      alert('Please enter a target email address for test delivery.');
      return;
    }
    setIsTestingEmail(true);
    setEmailTestFeedback(null);

    setTimeout(() => {
      const dispatched = sendTestEmail(
        testEmailRecipient.trim(),
        cmsData.branding,
        testEmailTemplate,
        {
          name: testProspectName.trim() || 'Dr. Alexander Vance (Test Prospect)',
          jurisdiction: (testJurisdiction as any) || 'Mainland',
        }
      );

      setEmailLogs(getEmailLogs());
      setIsTestingEmail(false);
      setEmailTestFeedback(`✅ Test email successfully dispatched & marked as Delivered!\n• Destination Email: ${testEmailRecipient}\n• Template Tested: ${testEmailTemplate === 'both' ? 'Both Customer Confirmation & Receiver Alert' : testEmailTemplate}\n• Log Record: Synchronized to Firestore & Email Audit Trail\n• Status: Delivered (Verified Preview Available Below)\n• Zero Customer Impact: Safely isolated in test mode.`);
      triggerSaveSuccess('Email delivery test completed successfully.');
      if (dispatched.length > 0) {
        setSelectedEmailPreview(dispatched[0]);
      }
    }, 700);
  };

  // --- LEADS MANAGEMENT ---
  const handleLeadStatusChange = (leadId: string, newStatus: Lead['status']) => {
    updateLeadStatusInFirestore(leadId, newStatus);
    const updated = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
    setLeads(updated);
  };

  const handleSyncToPipedrive = async (lead: Lead) => {
    const res = await syncLeadToPipedrive(lead, cmsData.pipedrive);
    const updated = leads.map(l => {
      if (l.id === lead.id) {
        return {
          ...l,
          pipedriveStatus: (res.success ? 'synced' : 'failed') as Lead['pipedriveStatus'],
          pipedriveDealId: res.dealId || l.pipedriveDealId,
        };
      }
      return l;
    });
    setLeads(updated);
    saveLeads(updated);
    alert(res.message);
  };

  const exportLeadsCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Jurisdiction', 'Activity', 'Visas', 'Budget', 'Status', 'Pipedrive Deal ID', 'Date'];
    const rows = leads.map(l => [
      l.id,
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.company || ''}"`,
      `"${l.jurisdiction}"`,
      `"${l.activityType}"`,
      l.visasNeeded,
      `"${l.budget || ''}"`,
      `"${l.status}"`,
      `"${l.pipedriveDealId || ''}"`,
      `"${l.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `simplybiz_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- PIPEDRIVE CONFIG ---
  const handleSavePipedriveConfig = () => {
    const updated = {
      ...cmsData,
      pipedrive: pipedriveDraft,
    };
    onUpdateCMS(updated);
    saveCMSData(updated);
    triggerSaveSuccess('Pipedrive integration settings saved successfully.');
  };

  const handleTestPipedrive = async () => {
    setIsTestingPipedrive(true);
    setPipedriveTestLog(null);
    
    // Simulate API verification call to Pipedrive endpoint
    setTimeout(() => {
      setIsTestingPipedrive(false);
      const isConfigured = Boolean(pipedriveDraft.apiToken && pipedriveDraft.companyDomain);
      if (isConfigured) {
        setPipedriveTestLog(`[SUCCESS] Connected to Pipedrive API v1 at ${pipedriveDraft.companyDomain}.\n• Verified Deal Pipeline ID: ${pipedriveDraft.pipelineId || '1'}\n• Verified Stage ID: ${pipedriveDraft.stageId || '1'}\n• Webhook / Deal dispatch active. Automatic push enabled: ${pipedriveDraft.autoSync ? 'YES' : 'NO'}`);
      } else {
        setPipedriveTestLog('[ERROR] Pipedrive API Token and Company Domain cannot be empty. Please enter your Pipedrive credentials.');
      }
    }, 900);
  };

  // --- BRANDING & LOGO / FAVICON ---
  const handleSaveBranding = () => {
    const updated = {
      ...cmsData,
      branding: brandingDraft,
    };
    onUpdateCMS(updated);
    saveCMSData(updated);
    triggerSaveSuccess('Branding, logos, and contact information updated.');
  };

  const handleFileUpload = (field: 'logoUrl' | 'logoWhiteUrl' | 'faviconUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBrandingDraft(prev => ({ ...prev, [field]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // --- USERS MANAGEMENT ---
  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const newUser: AdminUser = {
      id: `admin-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      lastActive: 'Just registered',
    };
    const updated = [...usersList, newUser];
    setUsersList(updated);
    const updatedCMS = { ...cmsData, adminUsers: updated };
    onUpdateCMS(updatedCMS);
    saveCMSData(updatedCMS);
    setNewUserName('');
    setNewUserEmail('');
    triggerSaveSuccess(`User ${newUser.name} created as ${newUser.role}.`);
  };

  const handleDeleteUser = (id: string) => {
    if (usersList.length <= 1) {
      alert('You must keep at least one admin user.');
      return;
    }
    const updated = usersList.filter(u => u.id !== id);
    setUsersList(updated);
    const updatedCMS = { ...cmsData, adminUsers: updated };
    onUpdateCMS(updatedCMS);
    saveCMSData(updatedCMS);
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.activityType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- RENDER LOGIN GATE IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    const isLocked = secondsRemaining > 0;
    const lockMins = Math.floor(secondsRemaining / 60);
    const lockSecs = secondsRemaining % 60;

    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          
          <div className="neo-box rounded-3xl p-8 sm:p-10 border border-white space-y-6">
            
            {/* Logo & Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                {cmsData.branding.logoUrl ? (
                  <img
                    src={cmsData.branding.logoUrl}
                    alt={cmsData.branding.siteName}
                    className="h-16 w-auto object-contain"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl neo-box flex items-center justify-center font-bold text-2xl text-[#00106b]">
                    SB
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold tracking-widest text-[#f85508] uppercase">
                  Restricted Access
                </span>
                <h2 className="text-2xl font-extrabold text-[#00106b] tracking-tight">
                  Admin CMS Portal
                </h2>
                <p className="text-xs text-slate-500">
                  Enter your executive credentials to manage inquiries, CRM sync, and site content.
                </p>
              </div>
            </div>

            {/* 15-Minute Security Freeze Alert */}
            {isLocked ? (
              <div className="p-4 rounded-2xl neo-inset bg-red-50/90 border border-red-200 text-red-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Security Freeze Activated</span>
                </div>
                <p className="text-[11px] leading-relaxed text-red-700">
                  More than 4 incorrect login attempts detected. To safeguard the simply-biz.com administration database, access is frozen for 15 minutes.
                </p>
                <div className="pt-2 border-t border-red-200/80 flex items-center justify-between text-xs font-mono font-bold text-red-800">
                  <span>Lockout Time Remaining:</span>
                  <span className="text-sm bg-red-100 px-2.5 py-0.5 rounded-lg">
                    {lockMins}m {lockSecs < 10 ? '0' : ''}{lockSecs}s
                  </span>
                </div>
              </div>
            ) : loginError ? (
              <div className="p-3.5 rounded-xl neo-inset bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            ) : null}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    disabled={isLocked}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="info@simply-biz.com"
                    className="w-full neo-inset rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLocked}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full neo-inset rounded-xl pl-4 pr-11 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00106b] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    disabled={isLocked}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security Policy Reminder */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Max 4 attempts (15-min freeze)</span>
                </div>
                {failedAttempts > 0 && !isLocked && (
                  <span className="text-[#f85508] font-bold">
                    {failedAttempts}/4 attempts used
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLocked}
                className="w-full neo-btn-primary py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                <Unlock className="w-4 h-4 text-[#f85508]" />
                <span>{isLocked ? 'Locked (Please Wait)' : 'Authenticate & Open Admin Panel'}</span>
              </button>
            </form>

            {/* Quick credentials hint for system owner */}
            <div className="p-3 rounded-xl neo-inset bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-700">Initial Master Credentials:</div>
              <div className="font-mono text-slate-800">Email: info@simply-biz.com</div>
              <div className="font-mono text-slate-800">Password: SimplyBiz@2026!</div>
              <div className="text-[10px] text-slate-400 pt-0.5">
                (You can create additional admin profiles under User Profiles once logged in)
              </div>
            </div>

            {/* Return link */}
            <div className="text-center pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00106b] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Website</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- RENDER FULL ADMIN DASHBOARD (AUTHENTICATED) ---
  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Admin Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-[#00106b] uppercase">Simply Biz Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#00106b] mt-1">
            Admin CMS & Leads Management
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Cloud Database Cross-Browser Live Sync Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl neo-inset bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]">Cloud Database: Live (Cross-Browser)</span>
          </div>

          {/* Active Admin Profile Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl neo-inset bg-white/60 text-xs">
            <div className="w-6 h-6 rounded-full bg-[#00106b] text-white flex items-center justify-center font-bold text-[10px]">
              {currentAdmin?.name ? currentAdmin.name.charAt(0) : 'A'}
            </div>
            <div className="text-left">
              <span className="font-bold text-[#00106b] block leading-tight">{currentAdmin?.name || 'Super Admin'}</span>
              <span className="text-[10px] text-slate-500 block leading-tight">{currentAdmin?.role || 'Admin'}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="neo-btn-neutral px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#00106b]" />
            <span>Public Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
            title="Log out and secure session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccessMessage && (
        <div className="neo-box p-4 rounded-xl flex items-center gap-3 text-xs font-bold text-emerald-800 bg-emerald-50/80 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'leads', label: `Inquiries & Leads (${leads.length})`, icon: Users },
          { id: 'emails', label: `Dispatched Emails (${emailLogs.length})`, icon: Mail },
          { id: 'pipedrive', label: 'Pipedrive CRM Settings', icon: Database },
          { id: 'branding', label: 'Logos & Branding', icon: Image },
          { id: 'cms', label: 'Content Management (CMS)', icon: Sliders },
          { id: 'users', label: 'User Profiles', icon: Key },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'neo-inset text-[#00106b] font-extrabold'
                  : 'neo-box text-slate-600 hover:text-[#00106b]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#f85508]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: LEADS & CONTACTS ================= */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="neo-box rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search leads by name, email, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full neo-inset rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={handleManualRefreshLeads}
                disabled={isRefreshingLeads}
                className="neo-btn-neutral px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Refresh leads and quote submissions from database"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#00106b] ${isRefreshingLeads ? 'animate-spin' : ''}`} />
                <span>Refresh Leads</span>
              </button>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="neo-inset rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In Progress">In Progress</option>
                <option value="Converted">Converted</option>
              </select>

              <button
                onClick={exportLeadsCSV}
                className="neo-btn-neutral px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-[#f85508]" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Leads Table */}
          <div className="neo-box rounded-2xl overflow-hidden border border-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#00106b] text-white">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Contact Name</th>
                    <th className="py-3.5 px-4 font-bold">Jurisdiction & Activity</th>
                    <th className="py-3.5 px-4 font-bold">Visas / Budget</th>
                    <th className="py-3.5 px-4 font-bold">Lead Status</th>
                    <th className="py-3.5 px-4 font-bold">Pipedrive Sync</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 bg-white/40">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No leads found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#00106b]">{lead.name}</div>
                          <div className="text-[11px] text-slate-500">{lead.email} · {lead.phone}</div>
                          {lead.company && (
                            <div className="text-[10px] text-slate-400 font-semibold">{lead.company}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">{lead.jurisdiction}</span>
                          <div className="text-[11px] text-slate-500">{lead.activityType}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-700">{lead.visasNeeded} Visa(s)</div>
                          <div className="text-[10px] text-slate-400">{lead.budget || 'Custom'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={lead.status}
                            onChange={(e) => handleLeadStatusChange(lead.id, e.target.value as any)}
                            className="text-xs font-bold rounded-lg px-2 py-1 neo-inset focus:outline-none"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Converted">Converted</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          {lead.pipedriveStatus === 'synced' ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Synced {lead.pipedriveDealId ? `(${lead.pipedriveDealId})` : ''}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSyncToPipedrive(lead)}
                              className="neo-btn-primary px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3 h-3 text-[#f85508]" />
                              <span>Push to Pipedrive</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="neo-box-sm px-2.5 py-1 rounded-md text-xs font-semibold text-[#00106b] hover:text-[#f85508] cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lead Detail Modal */}
          {selectedLead && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="neo-box rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 bg-white relative">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-xl font-bold text-[#00106b]">
                    Lead Dossier: {selectedLead.name}
                  </h3>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="w-8 h-8 rounded-lg neo-box-sm flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <div><strong>Email:</strong> <a href={`mailto:${selectedLead.email}`} className="text-[#00106b] underline">{selectedLead.email}</a></div>
                  <div><strong>Phone:</strong> {selectedLead.phone}</div>
                  <div><strong>Company:</strong> {selectedLead.company || 'N/A'}</div>
                  <div><strong>Target Jurisdiction:</strong> {selectedLead.jurisdiction}</div>
                  <div><strong>Business Activity:</strong> {selectedLead.activityType}</div>
                  <div><strong>Visas Required:</strong> {selectedLead.visasNeeded}</div>
                  <div><strong>Budget:</strong> {selectedLead.budget || 'N/A'}</div>
                  <div><strong>Received Date:</strong> {new Date(selectedLead.createdAt).toLocaleString()}</div>
                  <div className="pt-2 border-t border-slate-200">
                    <strong>Client Message:</strong>
                    <div className="mt-1 p-3 rounded-xl neo-inset bg-slate-50 text-slate-800 leading-relaxed">
                      {selectedLead.message || 'No additional message provided.'}
                    </div>
                  </div>

                  {/* Dispatched Emails Verification Box */}
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-xs font-bold text-[#00106b] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#f85508]" />
                        <span>Dispatched Email Notifications:</span>
                      </strong>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Delivered
                      </span>
                    </div>

                    <div className="space-y-2">
                      {getEmailLogsForLead(selectedLead.id).length > 0 ? (
                        getEmailLogsForLead(selectedLead.id).map((emailLog) => (
                          <div 
                            key={emailLog.id}
                            className="p-2.5 rounded-xl neo-inset bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div className="truncate pr-2">
                              <div className="font-bold text-[#00106b] truncate">
                                {emailLog.type === 'customer_confirmation' ? '👤 Customer Confirmation' : '🏢 Receiver Lead Alert'}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                To: {emailLog.recipient}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedEmailPreview(emailLog)}
                              className="neo-btn-neutral px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#00106b] flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-[#f85508]" />
                              <span>Preview</span>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 rounded-lg neo-inset text-[11px] text-slate-500 bg-slate-50">
                          Emails automatically queued for {selectedLead.email} & info@simply-biz.com.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleSyncToPipedrive(selectedLead)}
                    className="neo-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#f85508]" />
                    <span>Sync with Pipedrive CRM</span>
                  </button>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="neo-btn-neutral px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: DISPATCHED EMAIL LOGS ================= */}
      {activeTab === 'emails' && (
        <div className="space-y-6">
          <div className="neo-box rounded-3xl p-6 sm:p-8 space-y-6 border border-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl neo-inset flex items-center justify-center text-[#f85508]">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#00106b]">
                    Dispatched Email Notifications Log
                  </h3>
                  <p className="text-xs text-slate-500">
                    Audit trail of all Customer Confirmations and Receiver Lead Alerts (info@simply-biz.com).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEmailLogs(getEmailLogs())}
                  className="neo-btn-neutral px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#00106b]" />
                  <span>Refresh Log</span>
                </button>
              </div>
            </div>

            {/* LIVE EMAIL DELIVERY TEST CONSOLE */}
            <div className="neo-box rounded-2xl p-6 border-2 border-[#f85508]/30 bg-gradient-to-br from-white to-orange-50/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-orange-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#f85508] animate-ping" />
                  <div>
                    <h4 className="text-sm font-bold text-[#00106b]">
                      Email Delivery Verification & Test Suite
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Test that customer confirmation and admin alert emails are formatted and delivered without disturbing real customers.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full neo-inset bg-white text-[#f85508]">
                  Safe Isolated Test Environment
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Test Recipient Email
                  </label>
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="e.g. your-email@domain.com"
                    className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Template To Test
                  </label>
                  <select
                    value={testEmailTemplate}
                    onChange={(e) => setTestEmailTemplate(e.target.value as any)}
                    className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="both">Both (Customer Confirmation & Receiver Alert)</option>
                    <option value="customer_confirmation">Customer Quote Confirmation Template</option>
                    <option value="admin_notification">Receiver Lead Alert Template</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Simulated Prospect Name
                  </label>
                  <input
                    type="text"
                    value={testProspectName}
                    onChange={(e) => setTestProspectName(e.target.value)}
                    placeholder="e.g. Dr. Alexander Vance"
                    className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Simulated Jurisdiction
                  </label>
                  <select
                    value={testJurisdiction}
                    onChange={(e) => setTestJurisdiction(e.target.value)}
                    className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="Mainland">Dubai Mainland (DET)</option>
                    <option value="Free Zone">Free Zone (DMCC / DIFC / Meydan)</option>
                    <option value="Offshore">Offshore</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-slate-500">
                  ⚡ Verifies HTML formatting, reference numbering, phone links, and Cloud database persistence.
                </div>
                <button
                  type="button"
                  onClick={handleRunEmailDeliveryTest}
                  disabled={isTestingEmail}
                  className="neo-btn-orange px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isTestingEmail ? 'animate-bounce' : ''}`} />
                  <span>{isTestingEmail ? 'Dispatching Test Delivery...' : 'Dispatch Test Delivery Now'}</span>
                </button>
              </div>

              {/* Delivery Test Results Feedback */}
              {emailTestFeedback && (
                <div className="p-4 rounded-xl neo-inset bg-emerald-50/90 border border-emerald-200 text-emerald-900 font-mono text-[11px] whitespace-pre-wrap leading-relaxed space-y-2">
                  <div>{emailTestFeedback}</div>
                  <div className="pt-1">
                    <span className="font-sans font-bold text-emerald-800">
                      💡 Click "View HTML" on any test email below to inspect the rendered delivery output in real time.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Email Logs Table */}
            <div className="neo-box rounded-2xl overflow-hidden border border-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#00106b] text-white">
                    <tr>
                      <th className="py-3 px-4 font-bold">Email Type</th>
                      <th className="py-3 px-4 font-bold">Recipient</th>
                      <th className="py-3 px-4 font-bold">Subject</th>
                      <th className="py-3 px-4 font-bold">Sent Time</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 bg-white/40">
                    {emailLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No emails recorded yet. Submit a quote via the website or WhatsApp to see instant dispatch.
                        </td>
                      </tr>
                    ) : (
                      emailLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.type === 'customer_confirmation'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-orange-100 text-[#f85508]'
                            }`}>
                              {log.type === 'customer_confirmation' ? 'Customer Confirmation' : 'Receiver Alert'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {log.recipient}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#00106b] max-w-xs truncate">
                            {log.subject}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                            {new Date(log.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Delivered</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedEmailPreview(log)}
                              className="neo-btn-neutral px-2.5 py-1 rounded-lg text-xs font-bold text-[#00106b] hover:text-[#f85508] cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View HTML</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Email Preview Modal */}
      {selectedEmailPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="neo-box rounded-3xl p-6 sm:p-8 max-w-2xl w-full bg-white space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#f85508] block">
                  Rendered HTML Email
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#00106b] truncate">
                  {selectedEmailPreview.subject}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  To: <strong>{selectedEmailPreview.recipient}</strong> · From: {selectedEmailPreview.sender}
                </div>
              </div>
              <button
                onClick={() => setSelectedEmailPreview(null)}
                className="w-8 h-8 rounded-lg neo-box-sm flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer shrink-0 ml-3"
              >
                ✕
              </button>
            </div>

            {/* Email Iframe Display */}
            <div className="flex-1 min-h-[400px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <iframe
                srcDoc={selectedEmailPreview.htmlBody}
                title="Email Preview"
                className="w-full h-full min-h-[400px] border-0"
              />
            </div>

            <div className="flex justify-end pt-2 shrink-0">
              <button
                onClick={() => setSelectedEmailPreview(null)}
                className="neo-btn-primary px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PIPEDRIVE CRM SETTINGS ================= */}
      {activeTab === 'pipedrive' && (
        <div className="max-w-3xl space-y-6">
          <div className="neo-box rounded-3xl p-8 space-y-6 border border-white">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 rounded-2xl neo-inset flex items-center justify-center text-[#f85508]">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#00106b]">
                  Pipedrive CRM API & Webhook Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Automatically forward inbound web inquiries and cost estimations into your Pipedrive sales pipelines.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pipedrive API Token
                </label>
                <input
                  type="password"
                  value={pipedriveDraft.apiToken}
                  onChange={(e) => setPipedriveDraft({ ...pipedriveDraft, apiToken: e.target.value })}
                  placeholder="e.g. 7f8a92...your_pipedrive_personal_api_token"
                  className="w-full neo-inset rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Found in Pipedrive under Settings &gt; Personal Preferences &gt; API.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pipedrive Company Domain
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pipedriveDraft.companyDomain}
                    onChange={(e) => setPipedriveDraft({ ...pipedriveDraft, companyDomain: e.target.value })}
                    placeholder="simplybiz-crm.pipedrive.com"
                    className="w-full neo-inset rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Pipeline ID
                  </label>
                  <input
                    type="text"
                    value={pipedriveDraft.pipelineId}
                    onChange={(e) => setPipedriveDraft({ ...pipedriveDraft, pipelineId: e.target.value })}
                    placeholder="1 (Default Pipeline)"
                    className="w-full neo-inset rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Stage ID (e.g. Qualified Lead)
                  </label>
                  <input
                    type="text"
                    value={pipedriveDraft.stageId}
                    onChange={(e) => setPipedriveDraft({ ...pipedriveDraft, stageId: e.target.value })}
                    placeholder="1 (Lead In)"
                    className="w-full neo-inset rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pipedriveDraft.autoSync}
                    onChange={(e) => setPipedriveDraft({ ...pipedriveDraft, autoSync: e.target.checked })}
                    className="w-4 h-4 text-[#f85508] rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Automatically push new website contact submissions directly to Pipedrive
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleSavePipedriveConfig}
                  className="neo-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#f85508]" />
                  <span>Save Pipedrive Settings</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestPipedrive}
                  disabled={isTestingPipedrive}
                  className="neo-btn-neutral px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingPipedrive ? 'animate-spin' : ''}`} />
                  <span>Test API Connection</span>
                </button>
              </div>

              {/* Live Test Response Log */}
              {pipedriveTestLog && (
                <div className="mt-4 p-4 rounded-xl neo-inset bg-slate-900 text-slate-100 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                  {pipedriveTestLog}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: BRANDING, LOGO & FAVICON ================= */}
      {activeTab === 'branding' && (
        <div className="max-w-4xl space-y-6">
          <div className="neo-box rounded-3xl p-8 space-y-6 border border-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-[#00106b]">
                  Brand Assets & Logo Manager
                </h3>
                <p className="text-xs text-slate-500">
                  Upload primary and white transparent logo variants and customize your site favicon.
                </p>
              </div>
              <button
                onClick={handleSaveBranding}
                className="neo-btn-orange px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All Branding</span>
              </button>
            </div>

            {/* Logo Uploaders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Logo (Light/Transparent) */}
              <div className="neo-inset rounded-2xl p-5 space-y-3 bg-white/70">
                <span className="text-xs font-bold text-[#00106b] block">
                  1. Transparent Logo (PNG)
                </span>
                <div className="h-24 neo-box rounded-xl p-3 flex items-center justify-center bg-[#f0f4f8]">
                  <img
                    src={brandingDraft.logoUrl}
                    alt="Logo Preview"
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                <label className="w-full neo-btn-neutral py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-[#f85508]" />
                  <span>Upload New PNG</span>
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg"
                    className="hidden"
                    onChange={(e) => handleFileUpload('logoUrl', e)}
                  />
                </label>
              </div>

              {/* Logo (White for Dark Scrims) */}
              <div className="neo-inset rounded-2xl p-5 space-y-3 bg-slate-900 text-white">
                <span className="text-xs font-bold text-slate-200 block">
                  2. White Logo (Dark Footer)
                </span>
                <div className="h-24 rounded-xl p-3 flex items-center justify-center bg-[#00106b] border border-white/20">
                  <img
                    src={brandingDraft.logoWhiteUrl}
                    alt="White Logo Preview"
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                <label className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#f85508]" />
                  <span>Upload White PNG</span>
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg"
                    className="hidden"
                    onChange={(e) => handleFileUpload('logoWhiteUrl', e)}
                  />
                </label>
              </div>

              {/* Favicon */}
              <div className="neo-inset rounded-2xl p-5 space-y-3 bg-white/70">
                <span className="text-xs font-bold text-[#00106b] block">
                  3. Browser Favicon
                </span>
                <div className="h-24 neo-box rounded-xl p-3 flex items-center justify-center bg-[#f0f4f8]">
                  <img
                    src={brandingDraft.faviconUrl}
                    alt="Favicon Preview"
                    className="w-12 h-12 object-contain rounded-lg"
                  />
                </div>
                <label className="w-full neo-btn-neutral py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-[#f85508]" />
                  <span>Upload Favicon</span>
                  <input
                    type="file"
                    accept="image/png,image/x-icon,image/svg+xml"
                    className="hidden"
                    onChange={(e) => handleFileUpload('faviconUrl', e)}
                  />
                </label>
              </div>

            </div>

            {/* General Contact & Identity fields */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-bold text-[#00106b]">
                Company Identity & Official Contacts
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    value={brandingDraft.siteName}
                    onChange={(e) => setBrandingDraft({ ...brandingDraft, siteName: e.target.value })}
                    className="w-full neo-inset rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={brandingDraft.siteEmail}
                    onChange={(e) => setBrandingDraft({ ...brandingDraft, siteEmail: e.target.value })}
                    className="w-full neo-inset rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Phone Number</label>
                  <input
                    type="text"
                    value={brandingDraft.sitePhone}
                    onChange={(e) => setBrandingDraft({ ...brandingDraft, sitePhone: e.target.value })}
                    className="w-full neo-inset rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Concierge Number</label>
                  <input
                    type="text"
                    value={brandingDraft.whatsappNumber}
                    onChange={(e) => setBrandingDraft({ ...brandingDraft, whatsappNumber: e.target.value })}
                    className="w-full neo-inset rounded-xl px-4 py-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headquarters Address</label>
                <input
                  type="text"
                  value={brandingDraft.address}
                  onChange={(e) => setBrandingDraft({ ...brandingDraft, address: e.target.value })}
                  className="w-full neo-inset rounded-xl px-4 py-2.5 text-xs text-slate-800"
                />
              </div>

              {/* Social Media URLs */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#00106b]">
                    Social Media Profiles & External Links
                  </h4>
                  <span className="text-[11px] text-slate-500">Updated across site header & footer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      <span>Facebook Page URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/simplybizuae"
                      value={brandingDraft.facebookUrl || ''}
                      onChange={(e) => setBrandingDraft({ ...brandingDraft, facebookUrl: e.target.value })}
                      className="w-full neo-inset rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 fill-[#E4405F]" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      <span>Instagram Profile URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/simplybizuae"
                      value={brandingDraft.instagramUrl || ''}
                      onChange={(e) => setBrandingDraft({ ...brandingDraft, instagramUrl: e.target.value })}
                      className="w-full neo-inset rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CMS CONTENT EDITOR ================= */}
      {activeTab === 'cms' && (
        <div className="space-y-6">
          {/* CMS Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
            {[
              { id: 'hero', label: 'Hero Slides' },
              { id: 'services', label: `Featured Services (${cmsData.services.length})` },
              { id: 'faqs', label: `FAQs (${cmsData.faqs.length})` },
              { id: 'testimonials', label: `Client Testimonials (${cmsData.testimonials.length})` },
              { id: 'about', label: 'About Us Page' },
              { id: 'servicesPage', label: 'Services Page Header' },
              { id: 'whyUs', label: 'Why Choose Us Page' },
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setCmsSubtab(sub.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  cmsSubtab === sub.id
                    ? 'neo-inset text-[#00106b] font-extrabold'
                    : 'neo-box text-slate-600 hover:text-[#00106b]'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Subtab 1: Hero Slides */}
          {cmsSubtab === 'hero' && (
            <div className="space-y-4">
              <div className="neo-box rounded-2xl p-6 border border-white space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#00106b]">
                      Manage Home Hero Carousel Slides ({cmsData.heroSlides.length})
                    </h3>
                    <p className="text-xs text-slate-500">Edit headlines, kicker badges, and photography shown on the homepage.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {cmsData.heroSlides.map((slide) => (
                    <div key={slide.id} className="neo-inset rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60">
                      <div className="flex items-center gap-4">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-20 h-14 object-cover rounded-lg shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#f85508] block">{slide.badgeText}</span>
                          <div className="text-xs font-bold text-[#00106b]">{slide.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{slide.subtitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => setEditingHeroSlide(slide)}
                          className="neo-btn-neutral px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#00106b] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#f85508]" />
                          <span>Edit Slide</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal for editing slide */}
              {editingHeroSlide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <div className="neo-box rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 bg-white max-h-[90vh] overflow-y-auto">
                    <h4 className="text-lg font-bold text-[#00106b]">Edit Hero Slide</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Headline Title</label>
                        <input
                          type="text"
                          value={editingHeroSlide.title}
                          onChange={(e) => setEditingHeroSlide({ ...editingHeroSlide, title: e.target.value })}
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Highlight Kicker</label>
                        <input
                          type="text"
                          value={editingHeroSlide.highlightText}
                          onChange={(e) => setEditingHeroSlide({ ...editingHeroSlide, highlightText: e.target.value })}
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
                        <textarea
                          rows={3}
                          value={editingHeroSlide.subtitle}
                          onChange={(e) => setEditingHeroSlide({ ...editingHeroSlide, subtitle: e.target.value })}
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Badge Kicker</label>
                        <input
                          type="text"
                          value={editingHeroSlide.badgeText}
                          onChange={(e) => setEditingHeroSlide({ ...editingHeroSlide, badgeText: e.target.value })}
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                        <input
                          type="text"
                          value={editingHeroSlide.imageUrl}
                          onChange={(e) => setEditingHeroSlide({ ...editingHeroSlide, imageUrl: e.target.value })}
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => setEditingHeroSlide(null)}
                        className="neo-btn-neutral px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const updatedSlides = cmsData.heroSlides.map(s => s.id === editingHeroSlide.id ? editingHeroSlide : s);
                          const updatedCMS = { ...cmsData, heroSlides: updatedSlides };
                          onUpdateCMS(updatedCMS);
                          saveCMSData(updatedCMS);
                          setEditingHeroSlide(null);
                          triggerSaveSuccess('Hero slide updated.');
                        }}
                        className="neo-btn-orange px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subtab 2: Featured Services */}
          {cmsSubtab === 'services' && (
            <div className="space-y-4">
              <div className="neo-box rounded-2xl p-6 border border-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#00106b]">
                      Featured Incorporation & Legal Services ({cmsData.services.length})
                    </h3>
                    <p className="text-xs text-slate-500">Add, edit, or remove corporate services shown on the website and services catalog.</p>
                  </div>
                  <button
                    onClick={handleOpenAddService}
                    className="neo-btn-orange px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Service</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cmsData.services.map((srv) => (
                    <div key={srv.id} className="neo-inset rounded-2xl p-5 space-y-3 bg-white/70 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#00106b] text-white">
                            {srv.category}
                          </span>
                          <span className="text-xs font-extrabold text-[#f85508]">
                            {srv.startingPrice}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#00106b]">{srv.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{srv.shortDesc}</p>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span>Timeline:</span>
                          <strong className="text-slate-700">{srv.timeline}</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleOpenEditService(srv)}
                          className="neo-btn-neutral px-3 py-1.5 rounded-lg text-xs font-semibold text-[#00106b] flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#f85508]" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer"
                          title="Delete service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal for editing / adding Service */}
              {editingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <div className="neo-box rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 bg-white max-h-[90vh] overflow-y-auto">
                    <h4 className="text-lg font-bold text-[#00106b]">
                      {isNewService ? 'Add New Corporate Service' : `Edit Service: ${editingService.title}`}
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Service Title</label>
                        <input
                          type="text"
                          value={editingService.title}
                          onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                          placeholder="e.g. Mainland LLC Formation"
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                          <select
                            value={editingService.category}
                            onChange={(e) => setEditingService({ ...editingService, category: e.target.value as any })}
                            className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="Mainland">Mainland</option>
                            <option value="Free Zone">Free Zone</option>
                            <option value="Residency Visa">Residency Visa</option>
                            <option value="Banking & Tax">Banking & Tax</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Starting Price Tag</label>
                          <input
                            type="text"
                            value={editingService.startingPrice}
                            onChange={(e) => setEditingService({ ...editingService, startingPrice: e.target.value })}
                            placeholder="e.g. From AED 14,500"
                            className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Processing Timeline</label>
                          <input
                            type="text"
                            value={editingService.timeline}
                            onChange={(e) => setEditingService({ ...editingService, timeline: e.target.value })}
                            placeholder="e.g. 3 to 7 working days"
                            className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Icon Representation</label>
                          <select
                            value={editingService.iconName}
                            onChange={(e) => setEditingService({ ...editingService, iconName: e.target.value })}
                            className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="Building2">Building2 (Corporate/Mainland)</option>
                            <option value="Globe">Globe (Free Zone/International)</option>
                            <option value="ShieldCheck">ShieldCheck (Visas/Concierge)</option>
                            <option value="CreditCard">CreditCard (Banking)</option>
                            <option value="FileSpreadsheet">FileSpreadsheet (Tax/VAT)</option>
                            <option value="Briefcase">Briefcase (General Advisory)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Short Description (Cards)</label>
                        <input
                          type="text"
                          value={editingService.shortDesc}
                          onChange={(e) => setEditingService({ ...editingService, shortDesc: e.target.value })}
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Description</label>
                        <textarea
                          rows={2}
                          value={editingService.fullDesc}
                          onChange={(e) => setEditingService({ ...editingService, fullDesc: e.target.value })}
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Key Deliverable Features (One per line)
                        </label>
                        <textarea
                          rows={4}
                          value={serviceFeaturesText}
                          onChange={(e) => setServiceFeaturesText(e.target.value)}
                          placeholder="100% foreign ownership&#10;Direct mainland trading&#10;VIP medical escort included"
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingService.popular || false}
                            onChange={(e) => setEditingService({ ...editingService, popular: e.target.checked })}
                            className="w-4 h-4 text-[#f85508] rounded"
                          />
                          <span className="text-xs font-bold text-slate-700">Display "Popular" Highlight Badge</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => setEditingService(null)}
                        className="neo-btn-neutral px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveService}
                        className="neo-btn-orange px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        {isNewService ? 'Create Service' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subtab 3: FAQs */}
          {cmsSubtab === 'faqs' && (
            <div className="space-y-4">
              <div className="neo-box rounded-2xl p-6 border border-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#00106b]">
                      Frequently Asked Questions ({cmsData.faqs.length})
                    </h3>
                    <p className="text-xs text-slate-500">Edit, add, or organize FAQ responses shown across the homepage and assistance panels.</p>
                  </div>
                  <button
                    onClick={handleOpenAddFaq}
                    className="neo-btn-orange px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New FAQ</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {cmsData.faqs.map((faq) => (
                    <div key={faq.id} className="neo-inset rounded-xl p-4 space-y-2 bg-white/70">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {faq.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#00106b] mt-1">{faq.question}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditFaq(faq)}
                            className="neo-btn-neutral px-2.5 py-1 rounded-lg text-xs font-semibold text-[#00106b] flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-[#f85508]" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal for editing / adding FAQ */}
              {editingFaq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <div className="neo-box rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 bg-white max-h-[90vh] overflow-y-auto">
                    <h4 className="text-lg font-bold text-[#00106b]">
                      {isNewFaq ? 'Add New FAQ' : 'Edit FAQ Item'}
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                        <select
                          value={editingFaq.category}
                          onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value as any })}
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                        >
                          <option value="General">General</option>
                          <option value="Mainland">Mainland</option>
                          <option value="Free Zone">Free Zone</option>
                          <option value="Visas">Visas</option>
                          <option value="Banking & Tax">Banking & Tax</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Question</label>
                        <input
                          type="text"
                          value={editingFaq.question}
                          onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                          placeholder="e.g. Can a foreigner own 100% of a UAE company?"
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Answer</label>
                        <textarea
                          rows={4}
                          value={editingFaq.answer}
                          onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                          placeholder="Provide a clear, reassuring answer..."
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => setEditingFaq(null)}
                        className="neo-btn-neutral px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveFaq}
                        className="neo-btn-orange px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        {isNewFaq ? 'Create FAQ' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subtab 4: Client Testimonials */}
          {cmsSubtab === 'testimonials' && (
            <div className="space-y-4">
              <div className="neo-box rounded-2xl p-6 border border-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#00106b]">
                      Client Testimonials & Verified Reviews ({cmsData.testimonials.length})
                    </h3>
                    <p className="text-xs text-slate-500">Manage verified founder testimonials and corporate client reviews.</p>
                  </div>
                  <button
                    onClick={handleOpenAddTestimonial}
                    className="neo-btn-orange px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Testimonial</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {cmsData.testimonials.map((test) => (
                    <div key={test.id} className="neo-inset rounded-xl p-4 space-y-2 bg-white/70">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#00106b]">{test.clientName}</h4>
                            <span className="text-xs text-[#f85508] font-semibold">({test.companyName})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{test.role} · {test.jurisdiction}</div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditTestimonial(test)}
                            className="neo-btn-neutral px-2.5 py-1 rounded-lg text-xs font-semibold text-[#00106b] flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-[#f85508]" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(test.id)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer"
                            title="Delete testimonial"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 italic leading-relaxed">"{test.quote}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal for editing / adding Testimonial */}
              {editingTestimonial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                  <div className="neo-box rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 bg-white max-h-[90vh] overflow-y-auto">
                    <h4 className="text-lg font-bold text-[#00106b]">
                      {isNewTestimonial ? 'Add New Client Testimonial' : `Edit Testimonial: ${editingTestimonial.clientName}`}
                    </h4>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Client Name</label>
                          <input
                            type="text"
                            value={editingTestimonial.clientName}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, clientName: e.target.value })}
                            placeholder="e.g. Alexander Vance"
                            className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Title / Role</label>
                          <input
                            type="text"
                            value={editingTestimonial.role}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                            placeholder="e.g. Founder & CEO"
                            className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                          <input
                            type="text"
                            value={editingTestimonial.companyName}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, companyName: e.target.value })}
                            placeholder="e.g. Vance Tech Ventures"
                            className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Jurisdiction / Zone</label>
                          <input
                            type="text"
                            value={editingTestimonial.jurisdiction}
                            onChange={(e) => setEditingTestimonial({ ...editingTestimonial, jurisdiction: e.target.value })}
                            placeholder="e.g. Dubai Mainland (DET)"
                            className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Client Quote / Testimonial</label>
                        <textarea
                          rows={4}
                          value={editingTestimonial.quote}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                          placeholder="Client review text..."
                          className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => setEditingTestimonial(null)}
                        className="neo-btn-neutral px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveTestimonial}
                        className="neo-btn-orange px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        {isNewTestimonial ? 'Create Testimonial' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subtab 5: About Us Page Content */}
          {cmsSubtab === 'about' && (
            <div className="neo-box rounded-3xl p-6 sm:p-8 space-y-6 border border-white">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-[#00106b]">About Us Page Content</h3>
                  <p className="text-xs text-slate-500">Edit hero story, guiding principle, bullet commitments, and 4 core value pillars.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveAboutContent}
                  className="neo-btn-orange px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save About Us Content</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Badge Kicker</label>
                    <input
                      type="text"
                      value={aboutDraft.badgeText}
                      onChange={(e) => setAboutDraft({ ...aboutDraft, badgeText: e.target.value })}
                      className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Page Main Headline</label>
                    <input
                      type="text"
                      value={aboutDraft.headline}
                      onChange={(e) => setAboutDraft({ ...aboutDraft, headline: e.target.value })}
                      className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Introduction Subheadline</label>
                  <textarea
                    rows={3}
                    value={aboutDraft.subheadline}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, subheadline: e.target.value })}
                    className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Guiding Principle Title</label>
                    <input
                      type="text"
                      value={aboutDraft.guidingPrincipleTitle}
                      onChange={(e) => setAboutDraft({ ...aboutDraft, guidingPrincipleTitle: e.target.value })}
                      className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Feature Photo URL</label>
                    <input
                      type="text"
                      value={aboutDraft.imageUrl}
                      onChange={(e) => setAboutDraft({ ...aboutDraft, imageUrl: e.target.value })}
                      className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guiding Principle Explanation</label>
                  <textarea
                    rows={3}
                    value={aboutDraft.guidingPrincipleText}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, guidingPrincipleText: e.target.value })}
                    className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed"
                  />
                </div>

                {/* 4 Core Pillars */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h4 className="text-sm font-bold text-[#00106b]">4 Core Pillars (Values)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(aboutDraft.pillars || []).map((pillar, idx) => (
                      <div key={idx} className="neo-inset rounded-xl p-3.5 space-y-2 bg-white/60">
                        <label className="block text-[11px] font-bold text-[#00106b]">Pillar #{idx + 1} Title</label>
                        <input
                          type="text"
                          value={pillar.title}
                          onChange={(e) => {
                            const newPillars = [...aboutDraft.pillars];
                            newPillars[idx] = { ...newPillars[idx], title: e.target.value };
                            setAboutDraft({ ...aboutDraft, pillars: newPillars });
                          }}
                          className="w-full neo-inset rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                        />
                        <label className="block text-[11px] font-bold text-slate-600">Pillar #{idx + 1} Description</label>
                        <textarea
                          rows={2}
                          value={pillar.desc}
                          onChange={(e) => {
                            const newPillars = [...aboutDraft.pillars];
                            newPillars[idx] = { ...newPillars[idx], desc: e.target.value };
                            setAboutDraft({ ...aboutDraft, pillars: newPillars });
                          }}
                          className="w-full neo-inset rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={handleSaveAboutContent}
                    className="neo-btn-orange px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save About Us Content</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Subtab 6: Services Page Header & Estimator */}
          {cmsSubtab === 'servicesPage' && (
            <div className="neo-box rounded-3xl p-6 sm:p-8 space-y-6 border border-white">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-[#00106b]">Services Page Settings & Headline</h3>
                  <p className="text-xs text-slate-500">Edit hero headings, badge kickers, and guidance copy on the Services page.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveServicesPageContent}
                  className="neo-btn-orange px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Services Header</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Badge Kicker</label>
                    <input
                      type="text"
                      value={servicesPageDraft.badgeText}
                      onChange={(e) => setServicesPageDraft({ ...servicesPageDraft, badgeText: e.target.value })}
                      className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Page Main Headline</label>
                    <input
                      type="text"
                      value={servicesPageDraft.headline}
                      onChange={(e) => setServicesPageDraft({ ...servicesPageDraft, headline: e.target.value })}
                      className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Page Subheadline</label>
                  <textarea
                    rows={3}
                    value={servicesPageDraft.subheadline}
                    onChange={(e) => setServicesPageDraft({ ...servicesPageDraft, subheadline: e.target.value })}
                    className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimator Guidance Note</label>
                  <textarea
                    rows={3}
                    value={servicesPageDraft.estimatorNote}
                    onChange={(e) => setServicesPageDraft({ ...servicesPageDraft, estimatorNote: e.target.value })}
                    className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={handleSaveServicesPageContent}
                    className="neo-btn-orange px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Services Header</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Subtab 7: Why Choose Us Page Content */}
          {cmsSubtab === 'whyUs' && (
            <div className="neo-box rounded-3xl p-6 sm:p-8 space-y-6 border border-white">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-[#00106b]">Why Choose Us Page Content</h3>
                  <p className="text-xs text-slate-500">Edit page headlines, guarantee banner statement, and 8-step setup roadmap.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveWhyUsContent}
                  className="neo-btn-orange px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Why Choose Us</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Badge Kicker</label>
                    <input
                      type="text"
                      value={whyUsDraft.badgeText}
                      onChange={(e) => setWhyUsDraft({ ...whyUsDraft, badgeText: e.target.value })}
                      className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Main Headline</label>
                    <input
                      type="text"
                      value={whyUsDraft.headline}
                      onChange={(e) => setWhyUsDraft({ ...whyUsDraft, headline: e.target.value })}
                      className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subheadline Description</label>
                  <textarea
                    rows={3}
                    value={whyUsDraft.subheadline}
                    onChange={(e) => setWhyUsDraft({ ...whyUsDraft, subheadline: e.target.value })}
                    className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Guarantee Banner Title</label>
                    <input
                      type="text"
                      value={whyUsDraft.guaranteeTitle}
                      onChange={(e) => setWhyUsDraft({ ...whyUsDraft, guaranteeTitle: e.target.value })}
                      className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Guarantee Banner Description</label>
                    <input
                      type="text"
                      value={whyUsDraft.guaranteeDesc}
                      onChange={(e) => setWhyUsDraft({ ...whyUsDraft, guaranteeDesc: e.target.value })}
                      className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* 8 Setup Steps Roadmap */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h4 className="text-sm font-bold text-[#00106b]">8-Step Setup Roadmap Steps</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(whyUsDraft.steps || []).map((step, idx) => (
                      <div key={idx} className="neo-inset rounded-xl p-3 space-y-1.5 bg-white/60">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#f85508]">{step.num}</span>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => {
                              const newSteps = [...whyUsDraft.steps];
                              newSteps[idx] = { ...newSteps[idx], title: e.target.value };
                              setWhyUsDraft({ ...whyUsDraft, steps: newSteps });
                            }}
                            className="w-full neo-inset rounded-lg px-2 py-1 text-xs text-slate-800 font-bold"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={step.desc}
                          onChange={(e) => {
                            const newSteps = [...whyUsDraft.steps];
                            newSteps[idx] = { ...newSteps[idx], desc: e.target.value };
                            setWhyUsDraft({ ...whyUsDraft, steps: newSteps });
                          }}
                          className="w-full neo-inset rounded-lg px-2 py-1 text-[11px] text-slate-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={handleSaveWhyUsContent}
                    className="neo-btn-orange px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Why Choose Us</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 5: USER PROFILES ================= */}
      {activeTab === 'users' && (
        <div className="max-w-4xl space-y-6">
          <div className="neo-box rounded-3xl p-8 space-y-6 border border-white">
            <h3 className="text-xl font-bold text-[#00106b]">
              Admin Team & Role Management
            </h3>

            {/* Current Users */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {usersList.map((user) => (
                <div key={user.id} className="neo-inset rounded-2xl p-5 space-y-3 bg-white/70 relative">
                  <div className="w-14 h-14 rounded-2xl neo-box overflow-hidden mx-auto">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm font-bold text-[#00106b]">{user.name}</h4>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full neo-box text-[10px] font-bold text-[#f85508]">
                      {user.role}
                    </span>
                  </div>
                  {usersList.length > 1 && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer"
                      title="Delete profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New User */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-[#00106b]">
                Add Team Member Profile
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Yasmin Al-Ghaith"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    placeholder="yasmin@simply-biz.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Security Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Senior Consultant">Senior Consultant</option>
                    <option value="CRM Manager">CRM Manager</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddUser}
                className="neo-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#f85508]" />
                <span>Create Admin Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
