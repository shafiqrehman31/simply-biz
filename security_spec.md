# Security Specification: Simply Biz Leads, Email Logs & Video Showcase

## 1. Data Invariants
- A lead must have a valid non-empty name, email, phone, jurisdiction, activityType, and createdAt timestamp.
- String boundaries: name <= 200 chars, email <= 200 chars, phone <= 50 chars, message <= 5000 chars.
- Email logs must be linked to a valid leadId and have valid recipient, subject, htmlBody, status, and bounded optional deliveryNote (<= 500 chars).
- Email notification settings (`siteConfig/emailSettings`) must enforce boolean `enabled`, valid `deliveryProvider` enum (`formsubmit`, `google_apps_script`, `web3forms`, `emailjs`, `webhook`, `server_smtp`), bounded string fields, and never store private SMTP passwords or secret server credentials.
- Video items must have a valid ID, non-empty title <= 200 chars, videoUrl <= 2000 chars, valid sourceType (`local`, `uploaded`, `url`, `embed`), valid orientation (`auto`, `portrait`, `landscape`), boolean flags `isActive` and `isFeatured`, and immutable `createdAt`.
- Video section config documents must enforce bounded string fields (`badgeText` <= 100, `headline` <= 300, `subheadline` <= 2000).
- Public CMS config documents (`branding`, `heroSlides`, `services`, `faqs`, `testimonials`, `aboutContent`, `whyUsContent`, `servicesContent`) under `siteConfig` must enforce strict key allowlists, bounded string fields, and bounded list sizes (`<= 30` or `<= 100` items), with no private admin credentials or API tokens stored in `siteConfig`.

## 2. The Dirty Dozen Payloads (Rejection Matrix)
1. Lead with 10MB message string -> REJECTED (exceeds size limit).
2. Lead with missing name or email -> REJECTED (missing required fields).
3. Lead with invalid ID containing special characters -> REJECTED (failed isValidId).
4. Lead with negative visasNeeded -> REJECTED (visasNeeded < 0).
5. Lead with non-string jurisdiction -> REJECTED (type violation).
6. Lead update that tampers with createdAt -> REJECTED (immutable field).
7. Arbitrary document write to unknown collection -> REJECTED (global deny).
8. Email log missing htmlBody or injecting shadow fields -> REJECTED (missing required field / hasOnly violation).
9. Email log with invalid enum type or status -> REJECTED (type/enum violation).
10. EmailSettings document with invalid `deliveryProvider` or unallowed secret field (e.g. `smtpPassword`) -> REJECTED (enum / hasOnly violation).
11. Video item with binary base64 videoUrl (> 2000 chars) -> REJECTED (exceeds videoUrl size limit).
12. Video update attempting to alter createdAt or inject shadow fields -> REJECTED (immutable field & key allowlist).
13. `siteConfig/branding` or `siteConfig/heroSlides` attempting to inject unknown shadow fields or exceed list size bounds -> REJECTED (hasOnly / list size limit).
