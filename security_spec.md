# Security Specification – Kerapa Family Parbatsar Archive

## 1. Data Invariants
1. **Identity Integrity**: Every user-authored document (`members`, `media`, `events`, `tributes`, `contactInquiries`) must record `createdBy == request.auth.uid` on creation, and `createdBy` and `createdAt` are immutable after creation.
2. **No Self-Assigned Privileges**: Non-admin users creating `/users/{userId}` can only assign `role == 'member'`. Only a verified bootstrapped admin or existing admin can grant `role == 'admin'` or create `/admins/{userId}` entries.
3. **Approval Gate**: Non-admin users submitting new `members`, `media`, `events`, or `tributes` MUST create them with `status == 'pending'`. Only admins can set `status == 'approved'` or modify `isVerified`.
4. **Child & PII Isolation**:
   - No phone numbers, exact street addresses, or emails are stored in `/members/{memberId}`.
   - Private contact info lives in `/members/{memberId}/private/contact` and `/users/{userId}/private/info`, readable strictly by owner or admin.
   - Records with `isMinor == true` are never readable by unauthenticated public users.
5. **Consent Enforcement**: Public or family gallery items require `consentVerified == true` when approved.
6. **Temporal Integrity**: All `createdAt` and `updatedAt` timestamps must equal `request.time`.
7. **Path & Size Guard**: Document IDs must match `^[a-zA-Z0-9_\-]+$` (`<= 128` chars), and all strings and arrays have strict upper bounds.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on Member**: `{ ..., isAdmin: true }` -> Rejected by `hasOnly(...)`.
2. **Privilege Escalation on User Create**: `/users/uid123` with `{ role: 'admin' }` by non-admin -> Rejected by role check.
3. **Approval Bypass on Member Create**: `/members/m1` with `{ status: 'approved' }` by regular member -> Rejected by non-admin pending gate.
4. **Identity Spoofing**: `/members/m1` with `{ createdBy: 'other_uid' }` -> Rejected by `createdBy == request.auth.uid`.
5. **PII Leak Attempt**: Unauthenticated or non-owner `get` on `/members/m1/private/contact` -> Rejected by owner/admin gate.
6. **Minor Exposure Attempt**: Unauthenticated `get` on `/members/minor1` where `isMinor == true` -> Rejected by `isMinor == false` check.
7. **Email Spoofing**: Token with `email: 'bm3hra@gmail.com'` and `email_verified: false` -> Rejected by `email_verified == true`.
8. **ID Poisoning**: Creating `/members/` with 300-character or `$bad!` ID -> Rejected by `isValidId()`.
9. **Array Overflow**: Creating `/members/m1` with `childrenNames` array of length 50 -> Rejected by `childrenNames.size() <= 20`.
10. **Timestamp Spoofing**: Creating `/events/e1` with backdated `createdAt` (`!= request.time`) -> Rejected by `request.time` invariant.
11. **Immutable Field Tampering**: Updating `/tributes/t1` to change `createdBy` or `createdAt` -> Rejected by update diff & immutability check.
12. **Blanket Inquiry Scraping**: Non-admin attempting `list` on `/contactInquiries` -> Rejected by `isAdmin()` gate.
13. **Custom Page Draft Leak & Non-Admin Publish**: Unauthenticated user reading `status == 'draft'` or regular member creating `/customPages/{pageId}` -> Rejected by `status == 'published'` read gate and `isAdmin()` write gate.
14. **Custom Page Slug Injection**: Creating `/customPages/p1` with `slug: '../admin'` -> Rejected by `slug.matches('^[a-z0-9-]+$')`.

