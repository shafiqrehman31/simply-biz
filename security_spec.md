# Security Specification: Simply Biz Leads, Email Logs & Video Showcase

## 1. Data Invariants
- A lead must have a valid non-empty name, email, phone, jurisdiction, activityType, and createdAt timestamp.
- String boundaries: name <= 200 chars, email <= 200 chars, phone <= 50 chars, message <= 5000 chars.
- Email logs must be linked to a valid leadId and have valid recipient, subject, and htmlBody.
- Video items must have a valid ID, non-empty title <= 200 chars, videoUrl <= 2000 chars, valid sourceType (`local`, `uploaded`, `url`, `embed`), valid orientation (`auto`, `portrait`, `landscape`), boolean flags `isActive` and `isFeatured`, and immutable `createdAt`.
- Video section config documents must enforce bounded string fields (`badgeText` <= 100, `headline` <= 300, `subheadline` <= 2000).

## 2. The Dirty Dozen Payloads (Rejection Matrix)
1. Lead with 10MB message string -> REJECTED (exceeds size limit).
2. Lead with missing name or email -> REJECTED (missing required fields).
3. Lead with invalid ID containing special characters -> REJECTED (failed isValidId).
4. Lead with negative visasNeeded -> REJECTED (visasNeeded < 0).
5. Lead with non-string jurisdiction -> REJECTED (type violation).
6. Lead update that tampers with createdAt -> REJECTED (immutable field).
7. Arbitrary document write to unknown collection -> REJECTED (global deny).
8. Email log missing htmlBody -> REJECTED (missing required field).
9. Email log with invalid enum type -> REJECTED (type violation).
10. Video item with binary base64 videoUrl (> 2000 chars) -> REJECTED (exceeds videoUrl size limit).
11. Video item with invalid sourceType or orientation enum -> REJECTED (invalid enum).
12. Video update attempting to alter createdAt or inject shadow fields -> REJECTED (immutable field & key allowlist).
