import { Lead, SiteBranding, EmailLog, EmailSettings } from '../types';
import { saveEmailLogToFirestore, subscribeToFirestoreEmailLogs } from './firebase';

const EMAIL_STORAGE_KEY = 'simplybiz_sent_emails_v1';

export interface RealEmailDispatchResult {
  ok: boolean;
  status: EmailLog['status'];
  note: string;
}

/**
 * Parses comma, semicolon, or whitespace-separated email lists into clean unique addresses.
 */
export function parseNotificationEmails(raw?: string, fallback = 'info@simply-biz.com'): string[] {
  const source = (raw || '').trim() || fallback;
  const parts = source
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));

  if (parts.length > 0) {
    return Array.from(new Set(parts));
  }
  return fallback ? [fallback] : [];
}

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
 * Generates an executive Admin Notification HTML email for the configured recipient address(es).
 */
export function generateAdminEmail(
  lead: Lead,
  _branding: SiteBranding,
  recipientSummary = 'info@simply-biz.com',
  subjectPrefix = '[Simply Biz Quote]'
): { subject: string; html: string } {
  const prefix = subjectPrefix.trim() ? `${subjectPrefix.trim()} ` : '';
  const subject = `${prefix}New Quote Lead: ${lead.name} (${lead.jurisdiction} - ${lead.visasNeeded} Visas) [${lead.id}]`;
  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
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
      <span class="badge">Inbound Website Quote</span>
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
      Automated dispatch from Simply Biz Quote Gateway • Recipient(s): ${escapeHtml(recipientSummary)}
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function dispatchViaFormSubmit(
  recipients: string[],
  lead: Lead,
  subject: string,
  settings?: EmailSettings
): Promise<RealEmailDispatchResult> {
  const primary = recipients[0];
  if (!primary) {
    return { ok: false, status: 'Failed', note: 'No notification email address configured.' };
  }

  const payload: Record<string, string> = {
    _subject: subject,
    _replyto: lead.email,
    _template: 'table',
    _captcha: 'false',
    name: lead.name,
    email: lead.email,
    'Lead Reference': lead.id,
    'Client Name': lead.name,
    'Client Email': lead.email,
    'Phone / WhatsApp': lead.phone,
    'Company Name': lead.company || 'Not Specified',
    Jurisdiction: lead.jurisdiction,
    'Business Activity': lead.activityType || 'Not Specified',
    'Visas Needed': String(lead.visasNeeded),
    Budget: lead.budget || 'Tailored Proposal',
    Message: lead.message || 'No additional notes',
    'Submitted At': new Date(lead.createdAt || Date.now()).toLocaleString(),
    'Sent By': settings?.fromName || 'Simply Biz Quote Desk',
  };

  if (recipients.length > 1) {
    payload._cc = recipients.slice(1).join(',');
  }

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(primary)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    const isSuccess = data?.success === true || data?.success === 'true';
    const message = String(data?.message || '');

    if (isSuccess) {
      return {
        ok: true,
        status: 'Delivered',
        note: `Dispatched to ${recipients.join(', ')} via FormSubmit.`,
      };
    }

    if (/activat|confirm|verify/i.test(message)) {
      return {
        ok: false,
        status: 'Pending Activation',
        note: `Activation required: check ${primary} (and spam folder) and click FormSubmit's confirmation link once.`,
      };
    }

    return {
      ok: false,
      status: 'Failed',
      note: message || `FormSubmit returned status ${response.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      status: 'Failed',
      note: err instanceof Error ? err.message : 'Network error reaching FormSubmit.',
    };
  }
}

async function dispatchViaWeb3Forms(
  recipients: string[],
  lead: Lead,
  subject: string,
  settings: EmailSettings
): Promise<RealEmailDispatchResult> {
  if (!settings.web3formsAccessKey.trim()) {
    return {
      ok: false,
      status: 'Failed',
      note: 'Web3Forms Access Key is missing in Admin -> Email Settings.',
    };
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: settings.web3formsAccessKey.trim(),
        subject,
        from_name: settings.fromName || 'Simply Biz Quote Desk',
        replyto: lead.email,
        'Configured Recipient(s)': recipients.join(', '),
        'Lead ID': lead.id,
        'Client Name': lead.name,
        'Client Email': lead.email,
        'Phone / WhatsApp': lead.phone,
        'Company Name': lead.company || 'Not Specified',
        Jurisdiction: lead.jurisdiction,
        'Business Activity': lead.activityType,
        'Visas Required': String(lead.visasNeeded),
        Budget: lead.budget || 'Custom',
        Message: lead.message || 'No additional notes',
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (data?.success === true) {
      return {
        ok: true,
        status: 'Delivered',
        note: `Delivered via Web3Forms to ${recipients.join(', ')}.`,
      };
    }

    return {
      ok: false,
      status: 'Failed',
      note: String(data?.message || `Web3Forms error (${response.status}).`),
    };
  } catch (err) {
    return {
      ok: false,
      status: 'Failed',
      note: err instanceof Error ? err.message : 'Network error reaching Web3Forms.',
    };
  }
}

async function dispatchViaEmailJS(
  toEmail: string,
  templateId: string,
  lead: Lead,
  subject: string,
  htmlBody: string,
  settings: EmailSettings
): Promise<RealEmailDispatchResult> {
  if (!settings.emailjsServiceId.trim() || !templateId.trim() || !settings.emailjsPublicKey.trim()) {
    return {
      ok: false,
      status: 'Failed',
      note: 'EmailJS Service ID, Template ID, or Public Key is missing in Admin -> Email Settings.',
    };
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: settings.emailjsServiceId.trim(),
        template_id: templateId.trim(),
        user_id: settings.emailjsPublicKey.trim(),
        template_params: {
          to_email: toEmail,
          from_name: settings.fromName || 'Simply Biz Quote Desk',
          reply_to: lead.email,
          subject,
          lead_id: lead.id,
          client_name: lead.name,
          client_email: lead.email,
          client_phone: lead.phone,
          company: lead.company || 'Not Specified',
          jurisdiction: lead.jurisdiction,
          activity: lead.activityType || 'Not Specified',
          visas_needed: String(lead.visasNeeded),
          budget: lead.budget || 'Custom',
          message: lead.message || 'No additional notes',
          submitted_at: new Date(lead.createdAt || Date.now()).toLocaleString(),
          html_message: htmlBody,
        },
      }),
    });

    if (response.ok) {
      return {
        ok: true,
        status: 'Delivered',
        note: `Delivered to ${toEmail} via EmailJS.`,
      };
    }

    const errText = await response.text().catch(() => '');
    return {
      ok: false,
      status: 'Failed',
      note: errText || `EmailJS returned status ${response.status}.`,
    };
  } catch (err) {
    return {
      ok: false,
      status: 'Failed',
      note: err instanceof Error ? err.message : 'Network error reaching EmailJS.',
    };
  }
}

async function dispatchViaWebhook(
  recipients: string[],
  lead: Lead,
  subject: string,
  htmlBody: string,
  settings: EmailSettings
): Promise<RealEmailDispatchResult> {
  if (!settings.webhookUrl.trim()) {
    return {
      ok: false,
      status: 'Failed',
      note: 'Webhook URL is missing in Admin -> Email Settings.',
    };
  }

  try {
    const response = await fetch(settings.webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'simplybiz_new_quote',
        recipients,
        fromName: settings.fromName || 'Simply Biz Quote Desk',
        subject,
        lead,
        htmlBody,
        sentAt: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      return {
        ok: true,
        status: 'Delivered',
        note: `Forwarded quote JSON to webhook for ${recipients.join(', ')}.`,
      };
    }

    return {
      ok: false,
      status: 'Failed',
      note: `Webhook returned HTTP ${response.status}.`,
    };
  } catch (err) {
    return {
      ok: false,
      status: 'Failed',
      note: err instanceof Error ? err.message : 'Network error calling webhook.',
    };
  }
}

async function executeExternalEmailDelivery(
  recipients: string[],
  lead: Lead,
  subject: string,
  htmlBody: string,
  settings?: EmailSettings
): Promise<RealEmailDispatchResult> {
  const provider = settings?.deliveryProvider || 'formsubmit';

  if (provider === 'web3forms' && settings) {
    return dispatchViaWeb3Forms(recipients, lead, subject, settings);
  }
  if (provider === 'emailjs' && settings) {
    return dispatchViaEmailJS(
      recipients.join(','),
      settings.emailjsTemplateId,
      lead,
      subject,
      htmlBody,
      settings
    );
  }
  if (provider === 'webhook' && settings) {
    return dispatchViaWebhook(recipients, lead, subject, htmlBody, settings);
  }
  return dispatchViaFormSubmit(recipients, lead, subject, settings);
}

function persistEmailLogs(leadId: string, logs: EmailLog[]): void {
  try {
    const existingRaw = localStorage.getItem(EMAIL_STORAGE_KEY);
    const existing: EmailLog[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [...logs, ...existing];
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(
      new CustomEvent('simplybiz_emails_sent', { detail: { leadId, logs } })
    );

    logs.forEach((log) => {
      saveEmailLogToFirestore(log);
    });
  } catch (err) {
    console.error('Failed saving dispatched email logs:', err);
  }
}

/**
 * Dispatches Quote Notification & Customer Confirmation records whenever a quote form is submitted.
 */
export async function sendQuoteEmails(
  lead: Lead,
  branding: SiteBranding,
  emailSettings?: EmailSettings
): Promise<EmailLog[]> {
  const recipientList = parseNotificationEmails(
    emailSettings?.notificationEmails,
    branding.siteEmail || 'info@simply-biz.com'
  );
  const recipientSummary = recipientList.join(', ');
  const subjectPrefix = emailSettings?.subjectPrefix || '[Simply Biz Quote]';
  const fromName = emailSettings?.fromName || 'Simply Biz Quote Desk';

  const customerEmail = generateCustomerEmail(lead, branding);
  const adminEmail = generateAdminEmail(lead, branding, recipientSummary, subjectPrefix);

  let adminDeliveryResult: RealEmailDispatchResult = {
    ok: false,
    status: 'Sent',
    note: 'Email forwarding is paused in Admin -> Email Settings.',
  };

  if (emailSettings?.enabled !== false && recipientList.length > 0) {
    adminDeliveryResult = await executeExternalEmailDelivery(
      recipientList,
      lead,
      adminEmail.subject,
      adminEmail.html,
      emailSettings
    );
  }

  let customerDeliveryStatus: EmailLog['status'] = 'Sent';
  let customerDeliveryNote =
    'Confirmation summary displayed on screen and logged in Cloud Database.';

  if (
    emailSettings?.enabled !== false &&
    emailSettings?.deliveryProvider === 'emailjs' &&
    emailSettings?.emailjsCustomerTemplateId?.trim()
  ) {
    const custRes = await dispatchViaEmailJS(
      lead.email,
      emailSettings.emailjsCustomerTemplateId.trim(),
      lead,
      customerEmail.subject,
      customerEmail.html,
      emailSettings
    );
    customerDeliveryStatus = custRes.status;
    customerDeliveryNote = custRes.note;
  }

  const now = new Date().toISOString();
  const logs: EmailLog[] = [
    {
      id: `email-admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      leadId: lead.id,
      recipient: recipientSummary,
      sender: `${fromName} <${branding.siteEmail || 'info@simply-biz.com'}>`,
      subject: adminEmail.subject,
      htmlBody: adminEmail.html,
      type: 'admin_notification',
      sentAt: now,
      status: adminDeliveryResult.status,
      deliveryNote: adminDeliveryResult.note,
    },
    {
      id: `email-cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      leadId: lead.id,
      recipient: lead.email,
      sender: `Simply Biz Concierge <${branding.siteEmail || 'info@simply-biz.com'}>`,
      subject: customerEmail.subject,
      htmlBody: customerEmail.html,
      type: 'customer_confirmation',
      sentAt: now,
      status: customerDeliveryStatus,
      deliveryNote: customerDeliveryNote,
    },
  ];

  persistEmailLogs(lead.id, logs);
  return logs;
}

/**
 * Dispatches an isolated real test quote email to verify inbox delivery without affecting real customers.
 */
export async function sendTestEmail(
  targetEmail: string,
  branding: SiteBranding,
  templateType: 'customer_confirmation' | 'admin_notification' | 'both' = 'both',
  customLeadData?: Partial<Lead>,
  emailSettings?: EmailSettings
): Promise<{ logs: EmailLog[]; realResult: RealEmailDispatchResult }> {
  const recipients = parseNotificationEmails(
    targetEmail,
    emailSettings?.notificationEmails || branding.siteEmail || 'info@simply-biz.com'
  );
  const recipientSummary = recipients.join(', ');
  const primaryRecipient = recipients[0] || targetEmail;

  const dummyLead: Lead = {
    id: `test-quote-${Date.now().toString().slice(-4)}`,
    name: customLeadData?.name || 'Alexander Vance (Test Prospect)',
    email: primaryRecipient,
    phone: customLeadData?.phone || '+971 52 710 4488',
    company: customLeadData?.company || 'Vance Global Enterprise LLC',
    jurisdiction: customLeadData?.jurisdiction || 'Mainland',
    activityType: customLeadData?.activityType || 'Management Consulting & Commercial Trade',
    visasNeeded: customLeadData?.visasNeeded || 2,
    message:
      customLeadData?.message ||
      'Verification test quote from Simply Biz Admin Panel to verify inbox delivery.',
    budget: customLeadData?.budget || 'AED 25,000 - 35,000',
    status: 'New',
    pipedriveStatus: 'synced',
    createdAt: new Date().toISOString(),
  };

  const admEmail = generateAdminEmail(
    dummyLead,
    branding,
    recipientSummary,
    emailSettings?.subjectPrefix || '[TEST QUOTE]'
  );
  const realResult = await executeExternalEmailDelivery(
    recipients,
    dummyLead,
    `[TEST QUOTE] ${admEmail.subject}`,
    admEmail.html,
    emailSettings
  );

  const logs: EmailLog[] = [];
  const now = new Date().toISOString();

  if (templateType === 'customer_confirmation' || templateType === 'both') {
    const custEmail = generateCustomerEmail(dummyLead, branding);
    logs.push({
      id: `email-test-cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      leadId: dummyLead.id,
      recipient: primaryRecipient,
      sender: `Simply Biz Concierge <${branding.siteEmail || 'info@simply-biz.com'}>`,
      subject: `[TEST] ${custEmail.subject}`,
      htmlBody: custEmail.html,
      type: 'customer_confirmation',
      sentAt: now,
      status: realResult.status,
      deliveryNote: realResult.note,
    });
  }

  if (templateType === 'admin_notification' || templateType === 'both') {
    logs.push({
      id: `email-test-admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      leadId: dummyLead.id,
      recipient: recipientSummary,
      sender: `${emailSettings?.fromName || 'Simply Biz Quote Desk'} <${branding.siteEmail || 'info@simply-biz.com'}>`,
      subject: `[TEST] ${admEmail.subject}`,
      htmlBody: admEmail.html,
      type: 'admin_notification',
      sentAt: now,
      status: realResult.status,
      deliveryNote: realResult.note,
    });
  }

  persistEmailLogs(dummyLead.id, logs);
  return { logs, realResult };
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
