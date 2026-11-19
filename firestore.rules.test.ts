/**
 * Security Rule Verification Scenarios ("Dirty Dozen")
 * Designed for Firebase Rules Unit Testing against firestore.rules.
 */
export const dirtyDozenPayloads = {
  shadowFieldMember: {
    id: 'member_shadow',
    payload: {
      fullName: 'Test Member',
      fullNameHi: 'परीक्षण सदस्य',
      gender: 'male',
      generation: 3,
      branchId: 'branch_root',
      isLiving: true,
      isMinor: false,
      nativeVillage: 'Parbatsar',
      visibility: 'public',
      status: 'pending',
      isVerified: false,
      isDemoData: true,
      isAdmin: true,
    },
    expected: 'PERMISSION_DENIED',
  },
  privilegeEscalationUser: {
    path: 'users/user_1',
    payload: { uid: 'user_1', displayName: 'Attacker', role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
  approvalBypassMember: {
    path: 'members/m_bypass',
    payload: { status: 'approved', isVerified: true },
    expected: 'PERMISSION_DENIED',
  },
  identitySpoofing: {
    path: 'tributes/t_spoof',
    payload: { createdBy: 'victim_uid' },
    expected: 'PERMISSION_DENIED',
  },
  piiLeakAttempt: {
    path: 'members/m_1/private/contact',
    operation: 'get',
    expected: 'PERMISSION_DENIED',
  },
  minorExposureAttempt: {
    path: 'members/m_minor',
    data: { isMinor: true, visibility: 'public' },
    expected: 'PERMISSION_DENIED',
  },
  emailSpoofing: {
    token: { email: 'bm3hra@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED',
  },
  idPoisoning: {
    id: 'bad$id!'.repeat(40),
    expected: 'PERMISSION_DENIED',
  },
  arrayOverflow: {
    childrenNames: Array.from({ length: 30 }, (_, i) => `Child ${i}`),
    expected: 'PERMISSION_DENIED',
  },
  timestampSpoofing: {
    createdAt: new Date('2020-01-01T00:00:00Z'),
    expected: 'PERMISSION_DENIED',
  },
  immutableFieldTampering: {
    update: { createdBy: 'another_uid' },
    expected: 'PERMISSION_DENIED',
  },
  blanketInquiryScraping: {
    path: 'contactInquiries',
    operation: 'list',
    expected: 'PERMISSION_DENIED',
  },
};
