# Security Specification: Simply Biz Leads & Email Logs

## 1. Data Invariants
- A lead must have a valid non-empty name, email, phone, jurisdiction, activityType, and createdAt timestamp.
- String boundaries: name <= 200 chars, email <= 200 chars, phone <= 50 chars, message <= 5000 chars.
- Email logs must be linked to a valid leadId and have valid recipient, subject, and htmlBody.

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
10. Lead with status outside allowed enum -> REJECTED (invalid enum).
11. Unauthorized delete of lead without admin privileges -> REJECTED.
12. Script injection in document ID -> REJECTED (regex violation).
