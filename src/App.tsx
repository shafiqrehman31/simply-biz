/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageRoute, CMSData } from './types';
import { getCMSData, saveCMSData } from './services/storage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { WhyChooseUsPage } from './pages/WhyChooseUsPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { RefundPage } from './pages/RefundPage';
import { DisclaimerPage } from './pages/DisclaimerPage';

export default function App() {
  const [cmsData, setCmsData] = useState<CMSData>(getCMSData());
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [initialInterest, setInitialInterest] = useState<{
    serviceTitle?: string;
    details?: string;
  } | undefined>(undefined);

  // Sync route with URL hash on load and popstate
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageRoute;
      const validRoutes: PageRoute[] = [
        'home', 'about', 'services', 'why-us', 'contact', 'admin',
        'terms', 'privacy', 'refund', 'disclaimer'
      ];
      if (validRoutes.includes(hash)) {
        setCurrentPage(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: PageRoute) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectServiceForQuote = (serviceTitle: string, details: string) => {
    setInitialInterest({ serviceTitle, details });
  };

  const handleUpdateCMS = (updated: CMSData) => {
    setCmsData(updated);
    saveCMSData(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8] text-[#1e293b]">
      {/* Top Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        branding={cmsData.branding}
      />

      {/* Main Multi-Page Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            cmsData={cmsData}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            branding={cmsData.branding}
          />
        )}

        {currentPage === 'services' && (
          <ServicesPage
            services={cmsData.services}
            onNavigate={handleNavigate}
            onSelectServiceForQuote={handleSelectServiceForQuote}
          />
        )}

        {currentPage === 'why-us' && (
          <WhyChooseUsPage
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage
            branding={cmsData.branding}
            onNavigate={handleNavigate}
            initialInterest={initialInterest}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPage
            cmsData={cmsData}
            onUpdateCMS={handleUpdateCMS}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'terms' && (
          <TermsPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'privacy' && (
          <PrivacyPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'refund' && (
          <RefundPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'disclaimer' && (
          <DisclaimerPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Floating Bottom-to-Top Tab & Floating WhatsApp Concierge */}
      <FloatingActions branding={cmsData.branding} />

      {/* Footer with branding, contacts, and legal policy pages */}
      <Footer
        onNavigate={handleNavigate}
        branding={cmsData.branding}
      />
    </div>
  );
}
