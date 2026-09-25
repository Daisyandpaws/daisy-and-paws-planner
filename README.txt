DAISY & PAWS DIGITAL TEACHER PLANNER 2026/27 — COMMERCIAL BETA 1

This build is a pre-launch commercial beta for private testing.

TESTING
1. Upload the complete folder to an HTTPS web host. Do not test the PWA by double-clicking index.html.
2. Open the HTTPS address in Safari/Chrome/Edge.
3. Complete the welcome setup and create a planner PIN.
4. Test Home, Calendar, Planning, Classes, Timetable, Reading, Assessment, Seating, Pastoral, To Do, Meetings, CPD, Wellbeing, Notes, backup/restore and auto-lock.
5. On iPhone/iPad use Safari > Share > Add to Home Screen.

IMPORTANT BEFORE PUBLIC SALE
The current beta stores planner content locally in the browser. The PIN is a local privacy lock and is NOT the final hosted account/security architecture. Before public sale, add production authentication, server-side authorisation, encrypted transport, secure hosted database/storage, password reset, privacy policy, terms, retention/deletion processes, backups and a tested purchase/access flow. Schools remain responsible for deciding whether pupil information may be stored in this product under their own policies.

COMMERCIAL PRODUCT DIRECTION
The sellable hosted release should connect purchase entitlement to an individual account and sync permitted planner data across the teacher's devices. Do not market this beta as GDPR compliant.


AUTH UPDATE (25 Sep 2026)
- Replaced local PIN lock with Supabase email/password authentication.
- Planner data is isolated per signed-in account on each browser/device.
- Supabase project URL and publishable browser key are included in auth.js (publishable key only; no secret/service-role key).
- Email confirmation remains enabled in Supabase.
