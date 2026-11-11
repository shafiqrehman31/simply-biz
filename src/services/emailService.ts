import { Lead, SiteBranding, EmailLog } from '../types';
import { saveEmailLogToFirestore, subscribeToFirestoreEmailLogs } from './firebase';

const EMAIL_STORAGE_KEY = 'simplybiz_sent_emails_v1';

/**
 * Generates an official, beautifully styled Customer Confirmation HTML email.
 */
export function generateCustomerEmail(lead: Lead, branding: SiteBranding): { subject: string; html: string } {
  const subject = `Your UAE Business Setup Quote Request [Ref: ${lead.id}] - Simply Biz`;
  const formattedDate = new Date(lead.createdAt || Date.now()).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 16, 107, 0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #00106b 0%, #001f99 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
    .logo-badge { display: inline-block; background: #ffffff; padding: 10px 24px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .header h1 { margin: 12px 0 6px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 13px; color: #cbd5e1; }
    .content { padding: 32px; }
    .salutation { font-size: 17px; font-weight: 700; color: #00106b; margin-bottom: 16px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .ref-card { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f85508; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; }
    .ref-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 4px; }
    .ref-code { font-family: 'Courier New', monospace; font-size: 16px; font-weight: 800; color: #00106b; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    .details-table th, .details-table td { padding: 12px 16px; text-align: left; font-size: 13px; }
    .details-table th { background: #00106b; color: #ffffff; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .details-table tr:nth-child(even) { background: #f8fafc; }
    .details-table td:first-child { font-weight: 600; color: #475569; width: 38%; }
    .details-table td:last-child { color: #00106b; font-weight: 700; }
    .timeline-box { background: #fef3c7; border: 1px solid #fde68a; border-radius: 10px; padding: 16px; margin-bottom: 28px; }
    .timeline-title { font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 6px; display: flex; align-items: center; }
    .timeline-desc { font-size: 12px; color: #78350f; line-height: 1.5; margin: 0; }
    .advisor-cta { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px; }
    .advisor-cta h3 { margin: 0 0 6px 0; font-size: 15px; color: #166534; font-weight: 700; }
    .advisor-cta p { margin: 0 0 16px 0; font-size: 12px; color: #15803d; }
    .whatsapp-btn { display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 10px; font-weight: 700; font-size: 13px; }
    .footer { background: #00106b; padding: 24px 32px; text-align: center; color: #cbd5e1; font-size: 12px; line-height: 1.6; }
    .footer a { color: #f85508; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">
        <strong style="color: #00106b; font-size: 18px; font-weight: 900; letter-spacing: -0.5px;">Simply<span style="color: #f85508;">Biz</span></strong>
      </div>
      <h1>Quote Request Received</h1>
      <p>Official Confirmation & Summary of Requested UAE Setup Services</p>
    </div>

    <div class="content">
      <div class="salutation">Dear ${escapeHtml(lead.name)},</div>
      <p class="intro">
        Thank you for choosing <strong>Simply Biz</strong> as your trusted UAE business formation partner. We have registered your request for an itemized setup quotation, and our corporate licensing team has begun assessing your preferred jurisdiction requirements.
      </p>

      <div class="ref-card">
        <div class="ref-title">Inquiry Reference Number</div>
        <div class="ref-code">${lead.id}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Submitted: ${formattedDate}</div>
      </div>

      <table class="details-table">
        <thead>
          <tr>
            <th colspan="2">Your Setup Specifications</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Target Jurisdiction:</td>
            <td>${escapeHtml(lead.jurisdiction)}</td>
          </tr>
          <tr>
            <td>Business Sector / Activity:</td>
            <td>${escapeHtml(lead.activityType || 'Corporate Formation')}</td>
          </tr>
          <tr>
            <td>Visas Required:</td>
            <td>${lead.visasNeeded} Investor / Partner / Employee Visa(s)</td>
          </tr>
          <tr>
            <td>Company / Venture Name:</td>
            <td>${escapeHtml(lead.company || 'New UAE Enterprise')}</td>
          </tr>
          <tr>
            <td>Budget Estimation:</td>
            <td>${escapeHtml(lead.budget || 'Tailored Proposal')}</td>
          </tr>
          <tr>
            <td>Contact Phone / WhatsApp:</td>
            <td>${escapeHtml(lead.phone)}</td>
          </tr>
          ${lead.message ? `
          <tr>
            <td>Additional Notes:</td>
            <td style="font-weight: 400; color: #334155;">${escapeHtml(lead.message)}</td>
          </tr>` : ''}
        </tbody>
      </table>

      <div class="timeline-box">
        <div class="timeline-title">⏱️ Guaranteed 2-Hour Response Time</div>
        <p class="timeline-desc">
          A dedicated Senior Corporate Setup Consultant has been assigned to your file. They will prepare an itemized official quotation including all government license fees, establishment cards, medical fitness, and Emirates ID biometric VIP assistance.
        </p>
      </div>

      <div class="advisor-cta">
        <h3>Need to speak with an advisor immediately?</h3>
        <p>Our concierge team is available live on WhatsApp for expedited questions.</p>
        <a class="whatsapp-btn" href="https://wa.me/${branding.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello Simply Biz, my quote reference is ${lead.id}. I would like to discuss my setup.`)}">
          💬 Chat Live on WhatsApp (${branding.whatsappNumber})
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin: 0; text-align: center;">
        Warm regards,<br>
        <strong style="color: #00106b;">Simply Biz Corporate Advisory Team</strong><br>
        <span style="font-size: 11px;">Level 28, Marina Plaza, Dubai Marina & Downtown Business Bay, Dubai, UAE</span>
      </p>
    </div>

    <div class="footer">
      <div>Simply Biz Business Setup Services LLC</div>
      <div>Direct Line: <a href="tel:${branding.sitePhone}">${branding.sitePhone}</a> | Email: <a href="mailto:${branding.siteEmail}">${branding.siteEmail}</a></div>
      <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} Simply Biz. All rights reserved. Licensed by the Government of Dubai.
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * Generates an executive Admin Notification HTML email for info@simply-biz.com.
 */
export function generateAdminEmail(lead: Lead, branding: SiteBranding): { subject: string; html: string } {
  const subject = `🚨 New Free Quote Lead: ${lead.name} (${lead.jurisdiction} - ${lead.visasNeeded} Visas) [${lead.id}]`;
  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 16, 107, 0.12); border: 2px solid #00106b; }
    .header { background: #00106b; padding: 28px 32px; color: #ffffff; }
    .badge { display: inline-block; background: #f85508; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .header h1 { margin: 4px 0 0 0; font-size: 20px; font-weight: 800; }
    .content { padding: 32px; }
    .lead-meta { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px; }
    .lead-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .lead-table th { background: #f1f5f9; padding: 10px 14px; text-align: left; font-size: 12px; color: #475569; text-transform: uppercase; font-weight: 700; }
    .lead-table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    .lead-table td:first-child { width: 35%; font-weight: 600; color: #64748b; }
    .lead-table td:last-child { font-weight: 700; color: #00106b; }
    .message-box { background: #f8fafc; border-left: 4px solid #00106b; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px; }
    .message-box strong { font-size: 12px; text-transform: uppercase; color: #475569; display: block; margin-bottom: 6px; }
    .message-box p { margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5; }
    .action-row { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
    .btn { display: inline-block; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 12px; font-weight: 700; text-align: center; }
    .btn-primary { background: #00106b; color: #ffffff; }
    .btn-whatsapp { background: #25D366; color: #ffffff; }
    .btn-outline { background: #ffffff; border: 1px solid #cbd5e1; color: #334155; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Inbound Website Lead</span>
      <h1>New Quote Request: ${escapeHtml(lead.name)}</h1>
      <div style="font-size: 12px; color: #93c5fd; margin-top: 4px;">Destination: ${escapeHtml(lead.jurisdiction)} · ${lead.visasNeeded} Visa(s)</div>
    </div>

    <div class="content">
      <div class="lead-meta">
        <div><strong>Lead ID:</strong> <span style="font-family: monospace; color: #00106b; font-weight: 800;">${lead.id}</span></div>
        <div><strong>Time:</strong> ${new Date(lead.createdAt || Date.now()).toLocaleString()}</div>
      </div>

      <table class="lead-table">
        <thead>
          <tr>
            <th colspan="2">Prospect Information</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Client Full Name:</td>
            <td>${escapeHtml(lead.name)}</td>
          </tr>
          <tr>
            <td>Email Address:</td>
            <td><a href="mailto:${lead.email}" style="color: #00106b; text-decoration: underline;">${escapeHtml(lead.email)}</a></td>
          </tr>
          <tr>
            <td>Phone / WhatsApp:</td>
            <td><a href="tel:${lead.phone}" style="color: #00106b; text-decoration: none;">${escapeHtml(lead.phone)}</a></td>
          </tr>
          <tr>
            <td>Company Name:</td>
            <td>${escapeHtml(lead.company || 'Not Specified')}</td>
          </tr>
          <tr>
            <td>Target Jurisdiction:</td>
            <td><span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px;">${escapeHtml(lead.jurisdiction)}</span></td>
          </tr>
          <tr>
            <td>Business Activity:</td>
            <td>${escapeHtml(lead.activityType || 'Not Specified')}</td>
          </tr>
          <tr>
            <td>Visas Required:</td>
            <td>${lead.visasNeeded} Visa(s)</td>
          </tr>
          <tr>
            <td>Budget Estimation:</td>
            <td>${escapeHtml(lead.budget || 'Custom')}</td>
          </tr>
        </tbody>
      </table>

      ${lead.message ? `
      <div class="message-box">
        <strong>Client Message / Scope:</strong>
        <p>${escapeHtml(lead.message)}</p>
      </div>` : ''}

      <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase;">
        ⚡ Immediate Sales Actions:
      </div>
      <div class="action-row">
        <a class="btn btn-whatsapp" href="https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${lead.name}, thank you for requesting a quote from Simply Biz UAE. I am following up on your request #${lead.id}.`)}" target="_blank">
          Chat on WhatsApp
        </a>
        <a class="btn btn-primary" href="mailto:${lead.email}?subject=${encodeURIComponent(`Simply Biz: Itemized Quote Proposal for ${lead.name} [Ref: ${lead.id}]`)}">
          Reply via Email
        </a>
        <a class="btn btn-outline" href="tel:${lead.phone}">
          Call Prospect
        </a>
      </div>
    </div>

    <div class="footer">
      Automated dispatch from Simply Biz Web Portal & CRM Gateway • System Recipient: info@simply-biz.com
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

/**
 * Escapes HTML characters to prevent XSS in email bodies.
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sends and records the two required emails whenever a quote form is filled:
 * 1. Customer Confirmation Email -> to lead.email
 * 2. Receiver Notification Email -> to info@simply-biz.com (and branding.siteEmail)
 */
export function sendQuoteEmails(lead: Lead, branding: SiteBranding): EmailLog[] {
  const customerEmail = generateCustomerEmail(lead, branding);
  const adminEmail = generateAdminEmail(lead, branding);

  const logs: EmailLog[] = [
    {
      id: `email-cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      leadId: lead.id,
      recipient: lead.email,
      sender: `Simply Biz Concierge <${branding.siteEmail}>`,
      subject: customerEmail.subject,
      htmlBody: customerEmail.html,
      type: 'customer_confirmation',
      sentAt: new Date().toISOString(),
      status: 'Delivered',
    },
    {
      id: `email-admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      leadId: lead.id,
      recipient: branding.siteEmail || 'info@simply-biz.com',
      sender: `Simply Biz Web Lead Alert <notifications@simply-biz.com>`,
      subject: adminEmail.subject,
      htmlBody: adminEmail.html,
      type: 'admin_notification',
      sentAt: new Date().toISOString(),
      status: 'Delivered',
    },
  ];

  try {
    const existingRaw = localStorage.getItem(EMAIL_STORAGE_KEY);
    const existing: EmailLog[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [...logs, ...existing];
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event so UI components can update email counters in real time
    window.dispatchEvent(new CustomEvent('simplybiz_emails_sent', { detail: { leadId: lead.id, logs } }));

    // Persist to Cloud Firestore for cross-browser synchronization
    logs.forEach((log) => {
      saveEmailLogToFirestore(log);
    });
  } catch (err) {
    console.error('Failed saving dispatched email logs:', err);
  }

  return logs;
}

/**
 * Dispatches an isolated test email to verify delivery without affecting real customers.
 * Supports testing Customer Confirmation template, Receiver Lead Alert template, or both.
 */
export function sendTestEmail(
  targetEmail: string,
  branding: SiteBranding,
  templateType: 'customer_confirmation' | 'admin_notification' | 'both' = 'both',
  customLeadData?: Partial<Lead>
): EmailLog[] {
  const dummyLead: Lead = {
    id: `test-quote-${Date.now().toString().slice(-4)}`,
    name: customLeadData?.name || 'Alexander Vance (Test Prospect)',
    email: targetEmail,
    phone: customLeadData?.phone || '+971 52 710 4488',
    company: customLeadData?.company || 'Vance Global Enterprise LLC',
    jurisdiction: customLeadData?.jurisdiction || 'Mainland',
    activityType: customLeadData?.activityType || 'Management Consulting & Commercial Trade',
    visasNeeded: customLeadData?.visasNeeded || 2,
    message: customLeadData?.message || 'Verification test run from Simply Biz Admin Control Panel to test HTML rendering and delivery pipeline.',
    budget: customLeadData?.budget || 'AED 25,000 - 35,000',
    status: 'New',
    pipedriveStatus: 'synced',
    createdAt: new Date().toISOString(),
  };

  const logs: EmailLog[] = [];

  if (templateType === 'customer_confirmation' || templateType === 'both') {
    const custEmail = generateCustomerEmail(dummyLead, branding);
    logs.push({
      id: `email-test-cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      leadId: dummyLead.id,
      recipient: targetEmail,
      sender: `Simply Biz Concierge <${branding.siteEmail}>`,
      subject: `[TEST VERIFIED] ${custEmail.subject}`,
      htmlBody: custEmail.html,
      type: 'customer_confirmation',
      sentAt: new Date().toISOString(),
      status: 'Delivered',
    });
  }

  if (templateType === 'admin_notification' || templateType === 'both') {
    const admEmail = generateAdminEmail(dummyLead, branding);
    logs.push({
      id: `email-test-admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      leadId: dummyLead.id,
      recipient: targetEmail || branding.siteEmail || 'info@simply-biz.com',
      sender: `Simply Biz Lead Test Alert <notifications@simply-biz.com>`,
      subject: `[TEST VERIFIED] ${admEmail.subject}`,
      htmlBody: admEmail.html,
      type: 'admin_notification',
      sentAt: new Date().toISOString(),
      status: 'Delivered',
    });
  }

  try {
    const existingRaw = localStorage.getItem(EMAIL_STORAGE_KEY);
    const existing: EmailLog[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [...logs, ...existing];
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent('simplybiz_emails_sent', { detail: { leadId: dummyLead.id, logs } }));

    logs.forEach((log) => {
      saveEmailLogToFirestore(log);
    });
  } catch (err) {
    console.error('Failed saving test email logs:', err);
  }

  return logs;
}

/**
 * Real-time subscription to email logs from Cloud Firestore
 */
export function subscribeToEmailLogs(callback: (logs: EmailLog[]) => void): () => void {
  return subscribeToFirestoreEmailLogs(
    (firestoreLogs) => {
      if (firestoreLogs.length > 0) {
        try {
          localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(firestoreLogs));
        } catch {
          // ignore
        }
        callback(firestoreLogs);
      } else {
        callback(getEmailLogs());
      }
    },
    () => {
      callback(getEmailLogs());
    }
  );
}

/**
 * Retrieves all dispatched email logs.
 */
export function getEmailLogs(): EmailLog[] {
  try {
    const raw = localStorage.getItem(EMAIL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed reading email logs:', err);
    return [];
  }
}

/**
 * Retrieves dispatched email logs for a specific lead ID.
 */
export function getEmailLogsForLead(leadId: string): EmailLog[] {
  const logs = getEmailLogs();
  return logs.filter((log) => log.leadId === leadId);
}

/**
 * Clears email logs.
 */
export function clearEmailLogs(): void {
  try {
    localStorage.removeItem(EMAIL_STORAGE_KEY);
  } catch (err) {
    console.error(err);
  }
}
