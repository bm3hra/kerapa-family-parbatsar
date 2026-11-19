import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  testConnection,
} from '../lib/firebase';
import {
  DEMO_BRANCHES,
  DEMO_EVENTS,
  DEMO_HERITAGE_CONTENT,
  DEMO_MEDIA,
  DEMO_MEMBERS,
  DEMO_TRIBUTES,
} from '../data/demoData';
import {
  ContactInquiry,
  CustomPage,
  FamilyBranch,
  FamilyEvent,
  FamilyMember,
  HeritageContent,
  Language,
  MediaItem,
  MemberPrivateContact,
  TributeItem,
  UserRole,
} from '../types/archive';

interface ArchiveContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, hi: string) => string;

  user: User | null;
  authReady: boolean;
  userRole: UserRole;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;

  loadingData: boolean;
  usingDemoFallback: boolean;
  missingSeedCount: number;
  branches: FamilyBranch[];
  members: FamilyMember[];
  heritageContent: Record<'about' | 'history' | 'gotra' | 'parbatsar', HeritageContent>;
  media: MediaItem[];
  events: FamilyEvent[];
  tributes: TributeItem[];
  inquiries: ContactInquiry[];
  customPages: CustomPage[];

  refreshPublicData: () => Promise<void>;
  saveBranch: (branch: Omit<FamilyBranch, 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  deleteBranch: (branchId: string) => Promise<void>;

  saveMember: (
    member: Omit<FamilyMember, 'createdAt' | 'updatedAt' | 'createdBy'>,
    privateContact?: Partial<MemberPrivateContact>,
  ) => Promise<void>;
  approveMember: (memberId: string, verified: boolean) => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;
  getMemberPrivateContact: (memberId: string) => Promise<MemberPrivateContact | null>;

  saveHeritageSection: (section: Omit<HeritageContent, 'updatedAt' | 'updatedBy'>) => Promise<void>;

  saveMediaItem: (item: Omit<MediaItem, 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  approveMediaItem: (mediaId: string) => Promise<void>;
  deleteMediaItem: (mediaId: string) => Promise<void>;

  saveEventItem: (item: Omit<FamilyEvent, 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  approveEventItem: (eventId: string) => Promise<void>;
  deleteEventItem: (eventId: string) => Promise<void>;

  saveTributeItem: (item: Omit<TributeItem, 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  approveTributeItem: (tributeId: string) => Promise<void>;
  deleteTributeItem: (tributeId: string) => Promise<void>;

  saveCustomPage: (page: Omit<CustomPage, 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  deleteCustomPage: (pageId: string) => Promise<void>;

  submitContactInquiry: (inquiry: { senderName: string; senderCity?: string; subject: string; message: string }) => Promise<void>;

  seedDemoArchive: () => Promise<void>;
  syncMissingLineageRecords: () => Promise<number>;
  clearDemoArchive: () => Promise<void>;
  exportFullBackupJson: () => string;
  exportMembersCsv: () => string;
  restoreFromBackupJson: (jsonText: string) => Promise<void>;
}

const ArchiveContext = createContext<ArchiveContextValue | null>(null);

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned || `rec_${Date.now()}`;
}

function clampStr(value: string | undefined, max: number): string {
  return (value ?? '').trim().slice(0, max);
}

export function ArchiveProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('kerapa_lang');
    return saved === 'hi' ? 'hi' : 'en';
  });

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('member');

  const [loadingData, setLoadingData] = useState(true);
  const [liveBranches, setLiveBranches] = useState<FamilyBranch[]>([]);
  const [liveMembers, setLiveMembers] = useState<FamilyMember[]>([]);
  const [liveHeritage, setLiveHeritage] = useState<Partial<Record<'about' | 'history' | 'gotra' | 'parbatsar', HeritageContent>>>({});
  const [liveMedia, setLiveMedia] = useState<MediaItem[]>([]);
  const [liveEvents, setLiveEvents] = useState<FamilyEvent[]>([]);
  const [liveTributes, setLiveTributes] = useState<TributeItem[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [liveCustomPages, setLiveCustomPages] = useState<CustomPage[]>([]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kerapa_lang', lang);
  }, []);

  const t = useCallback(
    (en: string, hi: string) => (language === 'hi' ? hi : en),
    [language],
  );

  const isBootstrappedAdmin = Boolean(
    user && user.emailVerified && user.email === BOOTSTRAPPED_ADMIN_EMAIL,
  );
  const isAdmin = isBootstrappedAdmin || userRole === 'admin';

  // Startup connection check + Auth listener
  useEffect(() => {
    testConnection();
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && firebaseUser.emailVerified) {
        const isBoot = firebaseUser.email === BOOTSTRAPPED_ADMIN_EMAIL;
        const expectedRole: UserRole = isBoot ? 'admin' : 'member';
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              displayName: clampStr(firebaseUser.displayName || firebaseUser.email || 'Family Member', 120),
              role: expectedRole,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            if (firebaseUser.email) {
              await setDoc(doc(db, 'users', firebaseUser.uid, 'private', 'info'), {
                email: clampStr(firebaseUser.email, 200),
                updatedAt: serverTimestamp(),
              });
            }
            setUserRole(expectedRole);
          } else {
            const data = snap.data();
            const roleFromDb = data.role === 'admin' ? 'admin' : 'member';
            setUserRole(isBoot ? 'admin' : roleFromDb);
          }
          // Check admins registry if not bootstrapped
          if (!isBoot) {
            const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
            if (adminDoc.exists()) {
              setUserRole('admin');
            }
          }
        } catch {
          setUserRole(isBoot ? 'admin' : 'member');
        }
      } else {
        setUserRole('member');
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Public one-time fetch when unauthenticated
  const refreshPublicData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [branchSnap, heritageSnap, memberSnap, mediaSnap, eventSnap, tributeSnap, pageSnap] = await Promise.all([
        getDocs(collection(db, 'branches')),
        getDocs(collection(db, 'heritageContent')),
        getDocs(
          query(
            collection(db, 'members'),
            where('status', '==', 'approved'),
            where('visibility', '==', 'public'),
            where('isMinor', '==', false),
          ),
        ),
        getDocs(
          query(
            collection(db, 'media'),
            where('status', '==', 'approved'),
            where('consentVerified', '==', true),
            where('visibility', '==', 'public'),
          ),
        ),
        getDocs(
          query(
            collection(db, 'events'),
            where('status', '==', 'approved'),
            where('visibility', '==', 'public'),
          ),
        ),
        getDocs(query(collection(db, 'tributes'), where('status', '==', 'approved'))),
        getDocs(
          query(
            collection(db, 'customPages'),
            where('status', '==', 'published'),
            where('visibility', '==', 'public'),
          ),
        ),
      ]);

      setLiveBranches(
        branchSnap.docs
          .map((d) => ({ ...(d.data() as Omit<FamilyBranch, 'id'>), id: d.id }))
          .sort((a, b) => a.order - b.order),
      );

      const heritageMap: Partial<Record<'about' | 'history' | 'gotra' | 'parbatsar', HeritageContent>> = {};
      heritageSnap.docs.forEach((d) => {
        const item = { ...(d.data() as Omit<HeritageContent, 'id'>), id: d.id };
        heritageMap[item.sectionKey] = item;
      });
      setLiveHeritage(heritageMap);

      setLiveMembers(
        memberSnap.docs.map((d) => ({ ...(d.data() as Omit<FamilyMember, 'id'>), id: d.id })),
      );
      setLiveMedia(
        mediaSnap.docs.map((d) => ({ ...(d.data() as Omit<MediaItem, 'id'>), id: d.id })),
      );
      setLiveEvents(
        eventSnap.docs.map((d) => ({ ...(d.data() as Omit<FamilyEvent, 'id'>), id: d.id })),
      );
      setLiveTributes(
        tributeSnap.docs.map((d) => ({ ...(d.data() as Omit<TributeItem, 'id'>), id: d.id })),
      );
      setLiveCustomPages(
        pageSnap.docs
          .map((d) => ({ ...(d.data() as Omit<CustomPage, 'id'>), id: d.id }))
          .sort((a, b) => a.order - b.order),
      );
    } catch (err) {
      console.warn('Public Firestore fetch fallback to demo data:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Attach real-time listeners only when auth is ready & authenticated
  useEffect(() => {
    if (!authReady) return;
    if (!user || !user.emailVerified) {
      refreshPublicData();
      setInquiries([]);
      return;
    }

    setLoadingData(true);
    const unsubs: Array<() => void> = [];

    unsubs.push(
      onSnapshot(
        collection(db, 'branches'),
        (snap) => {
          setLiveBranches(
            snap.docs
              .map((d) => ({ ...(d.data() as Omit<FamilyBranch, 'id'>), id: d.id }))
              .sort((a, b) => a.order - b.order),
          );
          setLoadingData(false);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'branches'),
      ),
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'heritageContent'),
        (snap) => {
          const next: Partial<Record<'about' | 'history' | 'gotra' | 'parbatsar', HeritageContent>> = {};
          snap.docs.forEach((d) => {
            const item = { ...(d.data() as Omit<HeritageContent, 'id'>), id: d.id };
            next[item.sectionKey] = item;
          });
          setLiveHeritage(next);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'heritageContent'),
      ),
    );

    if (isBootstrappedAdmin) {
      unsubs.push(
        onSnapshot(
          collection(db, 'members'),
          (snap) => setLiveMembers(snap.docs.map((d) => ({ ...(d.data() as Omit<FamilyMember, 'id'>), id: d.id }))),
          (error) => handleFirestoreError(error, OperationType.LIST, 'members'),
        ),
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'media'),
          (snap) => setLiveMedia(snap.docs.map((d) => ({ ...(d.data() as Omit<MediaItem, 'id'>), id: d.id }))),
          (error) => handleFirestoreError(error, OperationType.LIST, 'media'),
        ),
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'events'),
          (snap) => setLiveEvents(snap.docs.map((d) => ({ ...(d.data() as Omit<FamilyEvent, 'id'>), id: d.id }))),
          (error) => handleFirestoreError(error, OperationType.LIST, 'events'),
        ),
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'tributes'),
          (snap) => setLiveTributes(snap.docs.map((d) => ({ ...(d.data() as Omit<TributeItem, 'id'>), id: d.id }))),
          (error) => handleFirestoreError(error, OperationType.LIST, 'tributes'),
        ),
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'contactInquiries'),
          (snap) => setInquiries(snap.docs.map((d) => ({ ...(d.data() as Omit<ContactInquiry, 'id'>), id: d.id }))),
          (error) => handleFirestoreError(error, OperationType.LIST, 'contactInquiries'),
        ),
      );
      unsubs.push(
        onSnapshot(
          collection(db, 'customPages'),
          (snap) =>
            setLiveCustomPages(
              snap.docs
                .map((d) => ({ ...(d.data() as Omit<CustomPage, 'id'>), id: d.id }))
                .sort((a, b) => a.order - b.order),
            ),
          (error) => handleFirestoreError(error, OperationType.LIST, 'customPages'),
        ),
      );
    } else {
      let approvedMembers: FamilyMember[] = [];
      let myMembers: FamilyMember[] = [];
      const mergeMembers = () => {
        const map = new Map<string, FamilyMember>();
        approvedMembers.forEach((m) => map.set(m.id, m));
        myMembers.forEach((m) => map.set(m.id, m));
        setLiveMembers(Array.from(map.values()));
      };
      unsubs.push(
        onSnapshot(
          query(collection(db, 'members'), where('status', '==', 'approved')),
          (snap) => {
            approvedMembers = snap.docs.map((d) => ({ ...(d.data() as Omit<FamilyMember, 'id'>), id: d.id }));
            mergeMembers();
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'members'),
        ),
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'members'), where('createdBy', '==', user.uid)),
          (snap) => {
            myMembers = snap.docs.map((d) => ({ ...(d.data() as Omit<FamilyMember, 'id'>), id: d.id }));
            mergeMembers();
          },
          (error) => handleFirestoreError(error, OperationType.LIST, 'members'),
        ),
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, 'media'), where('status', '==', 'approved'), where('consentVerified', '==', true)),
          (snap) => setLiveMedia(snap.docs.map((d) => ({ ...(d.data() as Omit<MediaItem, 'id'>), id: d.id }))),
          (error) => handleFirestoreError(error, OperationType.LIST, 'media'),
        ),
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'events'), where('status', '==', 'approved')),
          (snap) => setLiveEvents(snap.docs.map((d) => ({ ...(d.data() as Omit<FamilyEvent, 'id'>), id: d.id }))),
          (error) => handleFirestoreError(error, OperationType.LIST, 'events'),
        ),
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'tributes'), where('status', '==', 'approved')),
          (snap) => setLiveTributes(snap.docs.map((d) => ({ ...(d.data() as Omit<TributeItem, 'id'>), id: d.id }))),
          (error) => handleFirestoreError(error, OperationType.LIST, 'tributes'),
        ),
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'customPages'), where('status', '==', 'published')),
          (snap) =>
            setLiveCustomPages(
              snap.docs
                .map((d) => ({ ...(d.data() as Omit<CustomPage, 'id'>), id: d.id }))
                .sort((a, b) => a.order - b.order),
            ),
          (error) => handleFirestoreError(error, OperationType.LIST, 'customPages'),
        ),
      );
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [authReady, user, isBootstrappedAdmin, refreshPublicData]);

  const usingDemoFallback =
    liveBranches.length === 0 &&
    liveMembers.length === 0 &&
    Object.keys(liveHeritage).length === 0;

  const missingSeedCount = useMemo(() => {
    if (usingDemoFallback) return 0;
    const existingIds = new Set(liveMembers.map((m) => m.id));
    const missingMembers = DEMO_MEMBERS.filter((dm) => !existingIds.has(dm.id)).length;
    const needsParbatsarUpdate =
      !liveHeritage.parbatsar ||
      Boolean(liveHeritage.parbatsar.entries?.some((e) => e.id === 'pbt_2' && !e.verified)) ||
      !(liveHeritage.parbatsar.subtitle || '').includes('Ward No. 19');
    const needsTananSpellingUpdate =
      liveMembers.some((m) => `${m.fullNameHi} ${m.bioHi || ''}`.includes('तानण')) ||
      liveBranches.some((b) => `${b.nameHi} ${b.descriptionHi || ''}`.includes('तानण')) ||
      liveTributes.some((tr) => `${tr.honoreeNameHi} ${tr.messageHi || ''}`.includes('तानण')) ||
      Boolean(liveHeritage.history?.entries?.some((e) => e.bodyHi.includes('तानण')));
    const existingMemberMap = new Map(liveMembers.map((m) => [m.id, m]));
    const missingPhotos = DEMO_MEMBERS.filter((dm) => {
      const existingPhoto = existingMemberMap.get(dm.id)?.photoUrl;
      return Boolean(
        dm.photoUrl &&
          existingMemberMap.has(dm.id) &&
          (!existingPhoto || existingPhoto === '/assets/aistudio/Mr._Jay_Narayan_Kerapa_44435407.png'),
      );
    }).length;
    const needsNareshUpdate = liveMembers.some(
      (m) =>
        (m.id === 'kerapa_jai_son2_pending' && m.fullName.includes('Name Pending')) ||
        (m.id === 'kerapa_jai_narayan' && Boolean(m.childrenNames?.some((c) => c.includes('Name Pending')))) ||
        (m.id === 'kerapa_yashoda' && m.spouseId !== 'kerapa_prem_bamniya') ||
        (m.id === 'kerapa_nunda_ram' && m.spouseId !== 'kerapa_birji_devi') ||
        ((m.id === 'kerapa_jai_narayan' ||
          m.id === 'kerapa_dharam_narayan' ||
          m.id === 'kerapa_mangi_devi' ||
          m.id === 'kerapa_meera_devi') &&
          m.motherId !== 'kerapa_birji_devi'),
    );
    const existingMediaMap = new Map(liveMedia.map((x) => [x.id, x]));
    const missingMedia =
      liveMedia.length > 0
        ? DEMO_MEDIA.filter(
            (x) =>
              !x.isDemoData &&
              (!existingMediaMap.has(x.id) ||
                existingMediaMap.get(x.id)?.url === '/assets/aistudio/Mr._Jay_Narayan_Kerapa_44435407.png'),
          ).length
        : 0;
    return missingMembers + missingPhotos + (needsParbatsarUpdate ? 1 : 0) + (needsTananSpellingUpdate ? 1 : 0) + (needsNareshUpdate ? 1 : 0) + missingMedia;
  }, [usingDemoFallback, liveMembers, liveBranches, liveMedia, liveTributes, liveHeritage]);

  const branches = liveBranches.length > 0 ? liveBranches : DEMO_BRANCHES;
  const members = liveMembers.length > 0 ? liveMembers : (usingDemoFallback ? DEMO_MEMBERS : []);
  const heritageContent = useMemo(
    () => ({
      about: liveHeritage.about ?? DEMO_HERITAGE_CONTENT.about,
      history: liveHeritage.history ?? DEMO_HERITAGE_CONTENT.history,
      gotra: liveHeritage.gotra ?? DEMO_HERITAGE_CONTENT.gotra,
      parbatsar: liveHeritage.parbatsar ?? DEMO_HERITAGE_CONTENT.parbatsar,
    }),
    [liveHeritage],
  );
  const media = useMemo(() => {
    if (!usingDemoFallback) return liveMedia;
    if (liveMedia.length === 0) return DEMO_MEDIA;
    const liveIds = new Set(liveMedia.map((x) => x.id));
    return [...liveMedia, ...DEMO_MEDIA.filter((dm) => !liveIds.has(dm.id))];
  }, [liveMedia, usingDemoFallback]);

  const events = useMemo(() => {
    if (!usingDemoFallback) return liveEvents;
    if (liveEvents.length === 0) return DEMO_EVENTS;
    const liveIds = new Set(liveEvents.map((x) => x.id));
    return [...liveEvents, ...DEMO_EVENTS.filter((de) => !liveIds.has(de.id))];
  }, [liveEvents, usingDemoFallback]);

  const tributes = useMemo(() => {
    if (!usingDemoFallback) return liveTributes;
    if (liveTributes.length === 0) return DEMO_TRIBUTES;
    const liveIds = new Set(liveTributes.map((x) => x.id));
    return [...liveTributes, ...DEMO_TRIBUTES.filter((dt) => !liveIds.has(dt.id))];
  }, [liveTributes, usingDemoFallback]);

  const customPages = liveCustomPages;

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  // --- CRUD Mutations (strictly aligned with firebase-blueprint.json & firestore.rules) ---
  const saveBranch = useCallback(
    async (branch: Omit<FamilyBranch, 'createdAt' | 'updatedAt' | 'createdBy'>) => {
      if (!user) throw new Error('Authentication required');
      const id = sanitizeId(branch.id);
      const ref = doc(db, 'branches', id);
      const existingSnap = await getDoc(ref);
      const payload = {
        name: clampStr(branch.name, 120),
        nameHi: clampStr(branch.nameHi || branch.name, 120),
        ...(branch.patriarchName ? { patriarchName: clampStr(branch.patriarchName, 120) } : {}),
        ...(branch.patriarchNameHi ? { patriarchNameHi: clampStr(branch.patriarchNameHi, 120) } : {}),
        ...(branch.originPlace ? { originPlace: clampStr(branch.originPlace, 120) } : {}),
        ...(branch.description ? { description: clampStr(branch.description, 1200) } : {}),
        ...(branch.descriptionHi ? { descriptionHi: clampStr(branch.descriptionHi, 1200) } : {}),
        order: Number(branch.order) || 1,
        isDemoData: Boolean(branch.isDemoData),
      };
      try {
        if (existingSnap.exists()) {
          await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
        } else {
          await setDoc(ref, {
            ...payload,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `branches/${id}`);
      }
    },
    [user],
  );

  const deleteBranch = useCallback(async (branchId: string) => {
    const id = sanitizeId(branchId);
    try {
      await deleteDoc(doc(db, 'branches', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `branches/${id}`);
    }
  }, []);

  const saveMember = useCallback(
    async (
      member: Omit<FamilyMember, 'createdAt' | 'updatedAt' | 'createdBy'>,
      privateContact?: Partial<MemberPrivateContact>,
    ) => {
      if (!user) throw new Error('Authentication required');
      const id = sanitizeId(member.id);
      const ref = doc(db, 'members', id);
      const existingSnap = await getDoc(ref);
      const isMinor = Boolean(member.isMinor);
      const safeStatus = isAdmin ? member.status : 'pending';
      const safeVerified = isAdmin ? Boolean(member.isVerified) : false;

      const payload: Record<string, unknown> = {
        fullName: clampStr(member.fullName, 140),
        fullNameHi: clampStr(member.fullNameHi || member.fullName, 140),
        gender: member.gender,
        generation: Math.min(30, Math.max(1, Number(member.generation) || 1)),
        branchId: sanitizeId(member.branchId),
        isLiving: Boolean(member.isLiving),
        isMinor,
        nativeVillage: clampStr(member.nativeVillage || 'Parbatsar', 120),
        visibility: isMinor ? 'family' : member.visibility,
        status: safeStatus,
        isVerified: safeVerified,
        isDemoData: Boolean(member.isDemoData),
      };

      if (member.fatherId) payload.fatherId = clampStr(member.fatherId, 128);
      if (member.fatherName) payload.fatherName = clampStr(member.fatherName, 140);
      if (member.motherId) payload.motherId = clampStr(member.motherId, 128);
      if (member.motherName) payload.motherName = clampStr(member.motherName, 140);
      if (member.spouseId) payload.spouseId = clampStr(member.spouseId, 128);
      if (member.spouseName) payload.spouseName = clampStr(member.spouseName, 140);
      if (member.childrenNames && member.childrenNames.length > 0) {
        payload.childrenNames = member.childrenNames.slice(0, 20).map((c) => clampStr(c, 120));
      }
      if (member.birthYear) payload.birthYear = clampStr(member.birthYear, 16);
      if (member.deathYear) payload.deathYear = clampStr(member.deathYear, 16);
      if (member.education) payload.education = clampStr(member.education, 200);
      if (member.profession) payload.profession = clampStr(member.profession, 200);
      if (member.city) payload.city = clampStr(member.city, 100);
      if (member.state) payload.state = clampStr(member.state, 100);
      if (member.country) payload.country = clampStr(member.country, 100);
      if (member.bio) payload.bio = clampStr(member.bio, 2000);
      if (member.bioHi) payload.bioHi = clampStr(member.bioHi, 2000);
      if (member.photoUrl) payload.photoUrl = clampStr(member.photoUrl, 250000);

      try {
        if (existingSnap.exists()) {
          await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
        } else {
          await setDoc(ref, {
            ...payload,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        if (privateContact && (privateContact.phone || privateContact.email || privateContact.exactBirthDate || privateContact.privateNotes)) {
          const contactRef = doc(db, 'members', id, 'private', 'contact');
          const contactSnap = await getDoc(contactRef);
          const contactPayload = {
            ...(privateContact.phone ? { phone: clampStr(privateContact.phone, 40) } : {}),
            ...(privateContact.email ? { email: clampStr(privateContact.email, 200) } : {}),
            ...(privateContact.exactBirthDate ? { exactBirthDate: clampStr(privateContact.exactBirthDate, 32) } : {}),
            ...(privateContact.privateNotes ? { privateNotes: clampStr(privateContact.privateNotes, 500) } : {}),
            consentGiven: Boolean(privateContact.consentGiven ?? true),
            updatedAt: serverTimestamp(),
          };
          if (contactSnap.exists()) {
            await updateDoc(contactRef, contactPayload);
          } else {
            await setDoc(contactRef, { ...contactPayload, ownerUid: user.uid });
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `members/${id}`);
      }
    },
    [user, isAdmin],
  );

  const approveMember = useCallback(async (memberId: string, verified: boolean) => {
    const id = sanitizeId(memberId);
    try {
      await updateDoc(doc(db, 'members', id), {
        status: 'approved',
        isVerified: verified,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `members/${id}`);
    }
  }, []);

  const deleteMember = useCallback(async (memberId: string) => {
    const id = sanitizeId(memberId);
    try {
      await deleteDoc(doc(db, 'members', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `members/${id}`);
    }
  }, []);

  const getMemberPrivateContact = useCallback(async (memberId: string): Promise<MemberPrivateContact | null> => {
    if (!user) return null;
    const id = sanitizeId(memberId);
    try {
      const snap = await getDoc(doc(db, 'members', id, 'private', 'contact'));
      return snap.exists() ? (snap.data() as MemberPrivateContact) : null;
    } catch {
      return null;
    }
  }, [user]);

  const saveHeritageSection = useCallback(
    async (section: Omit<HeritageContent, 'updatedAt' | 'updatedBy'>) => {
      if (!user) throw new Error('Authentication required');
      const id = sanitizeId(section.sectionKey);
      const ref = doc(db, 'heritageContent', id);
      const existingSnap = await getDoc(ref);
      const payload = {
        sectionKey: section.sectionKey,
        title: clampStr(section.title, 200),
        titleHi: clampStr(section.titleHi || section.title, 200),
        ...(section.subtitle ? { subtitle: clampStr(section.subtitle, 300) } : {}),
        ...(section.subtitleHi ? { subtitleHi: clampStr(section.subtitleHi, 300) } : {}),
        ...(section.summary ? { summary: clampStr(section.summary, 3000) } : {}),
        ...(section.summaryHi ? { summaryHi: clampStr(section.summaryHi, 3000) } : {}),
        ...(section.gotraName ? { gotraName: clampStr(section.gotraName, 160) } : {}),
        ...(section.kuldevtaName ? { kuldevtaName: clampStr(section.kuldevtaName, 160) } : {}),
        ...(section.kuldeviName ? { kuldeviName: clampStr(section.kuldeviName, 160) } : {}),
        ...(section.entries ? { entries: section.entries.slice(0, 25) } : {}),
        isVerified: Boolean(section.isVerified),
        isDemoData: Boolean(section.isDemoData),
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      };
      try {
        if (existingSnap.exists()) {
          const { sectionKey: _omit, ...updatePayload } = payload;
          await updateDoc(ref, updatePayload);
        } else {
          await setDoc(ref, payload);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `heritageContent/${id}`);
      }
    },
    [user],
  );

  const saveMediaItem = useCallback(
    async (item: Omit<MediaItem, 'createdAt' | 'updatedAt' | 'createdBy'>) => {
      if (!user) throw new Error('Authentication required');
      const id = sanitizeId(item.id);
      const ref = doc(db, 'media', id);
      const existingSnap = await getDoc(ref);
      const payload = {
        mediaType: item.mediaType,
        album: item.album,
        title: clampStr(item.title, 160),
        titleHi: clampStr(item.titleHi || item.title, 160),
        ...(item.caption ? { caption: clampStr(item.caption, 600) } : {}),
        ...(item.captionHi ? { captionHi: clampStr(item.captionHi, 600) } : {}),
        url: clampStr(item.url, 250000),
        ...(item.dateLabel ? { dateLabel: clampStr(item.dateLabel, 60) } : {}),
        ...(item.taggedMemberNames && item.taggedMemberNames.length > 0
          ? { taggedMemberNames: item.taggedMemberNames.slice(0, 15).map((n) => clampStr(n, 80)) }
          : {}),
        consentVerified: Boolean(item.consentVerified),
        visibility: item.visibility,
        status: isAdmin ? item.status : 'pending',
        isDemoData: Boolean(item.isDemoData),
      };
      try {
        if (existingSnap.exists()) {
          await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
        } else {
          await setDoc(ref, {
            ...payload,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `media/${id}`);
      }
    },
    [user, isAdmin],
  );

  const approveMediaItem = useCallback(async (mediaId: string) => {
    const id = sanitizeId(mediaId);
    try {
      await updateDoc(doc(db, 'media', id), {
        status: 'approved',
        consentVerified: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `media/${id}`);
    }
  }, []);

  const deleteMediaItem = useCallback(async (mediaId: string) => {
    const id = sanitizeId(mediaId);
    try {
      await deleteDoc(doc(db, 'media', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `media/${id}`);
    }
  }, []);

  const saveEventItem = useCallback(
    async (item: Omit<FamilyEvent, 'createdAt' | 'updatedAt' | 'createdBy'>) => {
      if (!user) throw new Error('Authentication required');
      const id = sanitizeId(item.id);
      const ref = doc(db, 'events', id);
      const existingSnap = await getDoc(ref);
      const payload = {
        category: item.category,
        title: clampStr(item.title, 180),
        titleHi: clampStr(item.titleHi || item.title, 180),
        ...(item.description ? { description: clampStr(item.description, 1500) } : {}),
        ...(item.descriptionHi ? { descriptionHi: clampStr(item.descriptionHi, 1500) } : {}),
        eventDate: clampStr(item.eventDate, 40),
        ...(item.location ? { location: clampStr(item.location, 160) } : {}),
        visibility: item.visibility,
        status: isAdmin ? item.status : 'pending',
        isDemoData: Boolean(item.isDemoData),
      };
      try {
        if (existingSnap.exists()) {
          await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
        } else {
          await setDoc(ref, {
            ...payload,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `events/${id}`);
      }
    },
    [user, isAdmin],
  );

  const approveEventItem = useCallback(async (eventId: string) => {
    const id = sanitizeId(eventId);
    try {
      await updateDoc(doc(db, 'events', id), {
        status: 'approved',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `events/${id}`);
    }
  }, []);

  const deleteEventItem = useCallback(async (eventId: string) => {
    const id = sanitizeId(eventId);
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
    }
  }, []);

  const saveTributeItem = useCallback(
    async (item: Omit<TributeItem, 'createdAt' | 'updatedAt' | 'createdBy'>) => {
      if (!user) throw new Error('Authentication required');
      const id = sanitizeId(item.id);
      const ref = doc(db, 'tributes', id);
      const existingSnap = await getDoc(ref);
      const payload = {
        honoreeName: clampStr(item.honoreeName, 140),
        honoreeNameHi: clampStr(item.honoreeNameHi || item.honoreeName, 140),
        ...(item.yearsLabel ? { yearsLabel: clampStr(item.yearsLabel, 60) } : {}),
        authorName: clampStr(item.authorName, 120),
        ...(item.relationship ? { relationship: clampStr(item.relationship, 100) } : {}),
        message: clampStr(item.message, 2000),
        ...(item.messageHi ? { messageHi: clampStr(item.messageHi, 2000) } : {}),
        status: isAdmin ? item.status : 'pending',
        isDemoData: Boolean(item.isDemoData),
      };
      try {
        if (existingSnap.exists()) {
          await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
        } else {
          await setDoc(ref, {
            ...payload,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `tributes/${id}`);
      }
    },
    [user, isAdmin],
  );

  const approveTributeItem = useCallback(async (tributeId: string) => {
    const id = sanitizeId(tributeId);
    try {
      await updateDoc(doc(db, 'tributes', id), {
        status: 'approved',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tributes/${id}`);
    }
  }, []);

  const deleteTributeItem = useCallback(async (tributeId: string) => {
    const id = sanitizeId(tributeId);
    try {
      await deleteDoc(doc(db, 'tributes', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tributes/${id}`);
    }
  }, []);

  const saveCustomPage = useCallback(
    async (page: Omit<CustomPage, 'createdAt' | 'updatedAt' | 'createdBy'>) => {
      if (!user || !isAdmin) throw new Error('Admin privileges required');
      const id = sanitizeId(page.id);
      const ref = doc(db, 'customPages', id);
      const existingSnap = await getDoc(ref);
      const safeSlug = (page.slug || '')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);
      if (safeSlug.length < 2) {
        throw new Error('Page URL slug must be at least 2 lowercase letters or numbers.');
      }

      const payload: Record<string, unknown> = {
        slug: safeSlug,
        title: clampStr(page.title, 180),
        titleHi: clampStr(page.titleHi || page.title, 180),
        subtitle: clampStr(page.subtitle, 300),
        subtitleHi: clampStr(page.subtitleHi, 300),
        kicker: clampStr(page.kicker, 120),
        kickerHi: clampStr(page.kickerHi, 120),
        summary: clampStr(page.summary, 3000),
        summaryHi: clampStr(page.summaryHi, 3000),
        heroImageUrl: clampStr(page.heroImageUrl, 250000),
        videoUrl: clampStr(page.videoUrl, 600),
        videoTitle: clampStr(page.videoTitle, 160),
        galleryUrls: (page.galleryUrls || [])
          .map((u) => clampStr(u, 110000))
          .filter(Boolean)
          .slice(0, 8),
        sections: (page.sections || []).slice(0, 15).map((s, idx) => ({
          id: sanitizeId(s.id || `sec_${idx + 1}`),
          heading: clampStr(s.heading, 180),
          headingHi: clampStr(s.headingHi || s.heading, 180),
          body: clampStr(s.body, 3000),
          bodyHi: clampStr(s.bodyHi || s.body, 3000),
          ...(s.imageUrl ? { imageUrl: clampStr(s.imageUrl, 110000) } : {}),
        })),
        navGroup: page.navGroup || 'custom',
        showInNav: Boolean(page.showInNav),
        order: Math.max(0, Math.min(10000, Number(page.order) || 1)),
        visibility: page.visibility === 'family' ? 'family' : 'public',
        status: page.status === 'draft' ? 'draft' : 'published',
      };

      try {
        if (existingSnap.exists()) {
          await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
        } else {
          await setDoc(ref, {
            ...payload,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `customPages/${id}`);
      }
    },
    [user, isAdmin],
  );

  const deleteCustomPage = useCallback(async (pageId: string) => {
    const id = sanitizeId(pageId);
    try {
      await deleteDoc(doc(db, 'customPages', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `customPages/${id}`);
    }
  }, []);

  const submitContactInquiry = useCallback(
    async (inquiry: { senderName: string; senderCity?: string; subject: string; message: string }) => {
      if (!user) throw new Error('Please sign in with Google to submit a family archive inquiry.');
      const id = `inq_${Date.now()}`;
      try {
        await setDoc(doc(db, 'contactInquiries', id), {
          senderName: clampStr(inquiry.senderName, 120),
          ...(inquiry.senderCity ? { senderCity: clampStr(inquiry.senderCity, 120) } : {}),
          subject: clampStr(inquiry.subject, 180),
          message: clampStr(inquiry.message, 2000),
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `contactInquiries/${id}`);
      }
    },
    [user],
  );

  const seedDemoArchive = useCallback(async () => {
    if (!user || !isAdmin) throw new Error('Admin privileges required');
    // Seed branches first so exists(/branches/branchId) rule succeeds for members
    for (const branch of DEMO_BRANCHES) {
      await saveBranch(branch);
    }
    for (const key of ['about', 'history', 'gotra', 'parbatsar'] as const) {
      await saveHeritageSection(DEMO_HERITAGE_CONTENT[key]);
    }
    for (const member of DEMO_MEMBERS) {
      await saveMember(member);
    }
    for (const m of DEMO_MEDIA) {
      await saveMediaItem(m);
    }
    for (const ev of DEMO_EVENTS) {
      await saveEventItem(ev);
    }
    for (const tr of DEMO_TRIBUTES) {
      await saveTributeItem(tr);
    }
  }, [user, isAdmin, saveBranch, saveHeritageSection, saveMember, saveMediaItem, saveEventItem, saveTributeItem]);

  const syncMissingLineageRecords = useCallback(async () => {
    if (!user || !isAdmin) throw new Error('Admin privileges required');
    const existingBranchMap = new Map(liveBranches.map((b) => [b.id, b]));
    for (const branch of DEMO_BRANCHES) {
      const existing = existingBranchMap.get(branch.id);
      if (
        !existing ||
        (branch.id === 'branch_parbatsar_root' && !(existing.originPlace || '').includes('Ward No. 19')) ||
        (existing && `${existing.nameHi} ${existing.descriptionHi || ''}`.includes('तानण'))
      ) {
        await saveBranch(branch);
      }
    }
    let addedCount = 0;
    const needsParbatsarUpdate =
      !liveHeritage.parbatsar ||
      Boolean(liveHeritage.parbatsar.entries?.some((e) => e.id === 'pbt_2' && !e.verified)) ||
      !(liveHeritage.parbatsar.subtitle || '').includes('Ward No. 19');
    if (needsParbatsarUpdate) {
      await saveHeritageSection(DEMO_HERITAGE_CONTENT.parbatsar);
      addedCount += 1;
    }
    if (liveHeritage.history?.entries?.some((e) => e.bodyHi.includes('तानण'))) {
      await saveHeritageSection(DEMO_HERITAGE_CONTENT.history);
      addedCount += 1;
    }
    for (const tr of DEMO_TRIBUTES) {
      const existingTr = liveTributes.find((x) => x.id === tr.id);
      if (existingTr && `${existingTr.honoreeNameHi} ${existingTr.messageHi || ''}`.includes('तानण')) {
        await saveTributeItem(tr);
        addedCount += 1;
      }
    }
    const existingMemberMap = new Map(liveMembers.map((m) => [m.id, m]));
    for (const member of DEMO_MEMBERS) {
      const existing = existingMemberMap.get(member.id);
      if (!existing) {
        await saveMember(member);
        addedCount += 1;
      } else if (
        `${existing.fullNameHi} ${existing.bioHi || ''}`.includes('तानण') ||
        (member.id === 'kerapa_jai_son2_pending' && existing.fullName.includes('Name Pending')) ||
        (member.id === 'kerapa_yashoda' && existing.spouseId !== 'kerapa_prem_bamniya')
      ) {
        await saveMember(member);
        addedCount += 1;
      } else {
        const isParentWithChildren =
          (member.id === 'kerapa_jai_narayan' ||
            member.id === 'kerapa_dharam_narayan' ||
            member.id === 'kerapa_mangi_devi' ||
            member.id === 'kerapa_sunder_lal_mehra') &&
          member.childrenNames &&
          member.childrenNames.length > 0;
        const needsChildrenUpdate = Boolean(
          isParentWithChildren &&
            (!existing.childrenNames ||
              existing.childrenNames.length < (member.childrenNames?.length ?? 0) ||
              existing.childrenNames.some((c) => c.includes('Name Pending'))),
        );
        const needsPhotoUpdate = Boolean(
          member.photoUrl &&
            (!existing.photoUrl || existing.photoUrl === '/assets/aistudio/Mr._Jay_Narayan_Kerapa_44435407.png'),
        );
        const needsBirjiSpouseLink = Boolean(
          member.id === 'kerapa_nunda_ram' && existing.spouseId !== 'kerapa_birji_devi',
        );
        const needsBirjiMotherLink = Boolean(
          member.motherId === 'kerapa_birji_devi' && existing.motherId !== 'kerapa_birji_devi',
        );
        if (needsChildrenUpdate || needsPhotoUpdate || needsBirjiSpouseLink || needsBirjiMotherLink) {
          await updateDoc(doc(db, 'members', member.id), {
            ...(needsChildrenUpdate && member.childrenNames ? { childrenNames: member.childrenNames.slice(0, 20) } : {}),
            ...(needsPhotoUpdate ? { photoUrl: member.photoUrl } : {}),
            ...(needsBirjiSpouseLink
              ? { spouseId: 'kerapa_birji_devi', spouseName: 'Mrs. Birji Devi' }
              : {}),
            ...(needsBirjiMotherLink
              ? { motherId: 'kerapa_birji_devi', motherName: 'Mrs. Birji Devi' }
              : {}),
            updatedAt: serverTimestamp(),
          });
          addedCount += 1;
        }
      }
    }
    const existingMediaMap = new Map(liveMedia.map((x) => [x.id, x]));
    for (const item of DEMO_MEDIA) {
      const existingMedia = existingMediaMap.get(item.id);
      if (
        !item.isDemoData &&
        (!existingMedia || existingMedia.url === '/assets/aistudio/Mr._Jay_Narayan_Kerapa_44435407.png')
      ) {
        await saveMediaItem(item);
        addedCount += 1;
      }
    }
    return addedCount;
  }, [user, isAdmin, liveBranches, liveHeritage, liveMembers, liveMedia, liveTributes, saveBranch, saveHeritageSection, saveMember, saveMediaItem, saveTributeItem]);

  const clearDemoArchive = useCallback(async () => {
    if (!user || !isAdmin) throw new Error('Admin privileges required');
    for (const m of liveMembers.filter((x) => x.isDemoData)) {
      await deleteMember(m.id);
    }
    for (const m of liveMedia.filter((x) => x.isDemoData)) {
      await deleteMediaItem(m.id);
    }
    for (const ev of liveEvents.filter((x) => x.isDemoData)) {
      await deleteEventItem(ev.id);
    }
    for (const tr of liveTributes.filter((x) => x.isDemoData)) {
      await deleteTributeItem(tr.id);
    }
    for (const b of liveBranches.filter((x) => x.isDemoData)) {
      await deleteBranch(b.id);
    }
  }, [user, isAdmin, liveMembers, liveMedia, liveEvents, liveTributes, liveBranches, deleteMember, deleteMediaItem, deleteEventItem, deleteTributeItem, deleteBranch]);

  const exportFullBackupJson = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      archive: 'Kerapa Family – Parbatsar',
      branches,
      members,
      heritageContent,
      media,
      events,
      tributes,
      customPages,
    };
    return JSON.stringify(payload, null, 2);
  }, [branches, members, heritageContent, media, events, tributes, customPages]);

  const exportMembersCsv = useCallback(() => {
    const headers = [
      'id',
      'fullName',
      'fullNameHi',
      'gender',
      'generation',
      'branchId',
      'fatherName',
      'motherName',
      'spouseName',
      'birthYear',
      'deathYear',
      'isLiving',
      'city',
      'state',
      'country',
      'nativeVillage',
      'profession',
      'education',
      'isVerified',
      'isDemoData',
    ];
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = members.map((m) =>
      [
        m.id,
        m.fullName,
        m.fullNameHi,
        m.gender,
        m.generation,
        m.branchId,
        m.fatherName,
        m.motherName,
        m.spouseName,
        m.birthYear,
        m.deathYear,
        m.isLiving,
        m.city,
        m.state,
        m.country,
        m.nativeVillage,
        m.profession,
        m.education,
        m.isVerified,
        m.isDemoData,
      ]
        .map(escape)
        .join(','),
    );
    return [headers.join(','), ...rows].join('\n');
  }, [members]);

  const restoreFromBackupJson = useCallback(
    async (jsonText: string) => {
      if (!user || !isAdmin) throw new Error('Admin privileges required');
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed.branches)) {
        for (const b of parsed.branches) {
          await saveBranch(b);
        }
      }
      if (parsed.heritageContent && typeof parsed.heritageContent === 'object') {
        for (const key of ['about', 'history', 'gotra', 'parbatsar'] as const) {
          if (parsed.heritageContent[key]) {
            await saveHeritageSection(parsed.heritageContent[key]);
          }
        }
      }
      if (Array.isArray(parsed.members)) {
        for (const m of parsed.members) {
          await saveMember(m);
        }
      }
      if (Array.isArray(parsed.media)) {
        for (const item of parsed.media) {
          await saveMediaItem(item);
        }
      }
      if (Array.isArray(parsed.events)) {
        for (const ev of parsed.events) {
          await saveEventItem(ev);
        }
      }
      if (Array.isArray(parsed.tributes)) {
        for (const tr of parsed.tributes) {
          await saveTributeItem(tr);
        }
      }
      if (Array.isArray(parsed.customPages)) {
        for (const cp of parsed.customPages) {
          await saveCustomPage(cp);
        }
      }
    },
    [user, isAdmin, saveBranch, saveHeritageSection, saveMember, saveMediaItem, saveEventItem, saveTributeItem, saveCustomPage],
  );

  const value: ArchiveContextValue = {
    language,
    setLanguage,
    t,
    user,
    authReady,
    userRole,
    isAdmin,
    signInWithGoogle,
    signOutUser,
    loadingData,
    usingDemoFallback,
    missingSeedCount,
    branches,
    members,
    heritageContent,
    media,
    events,
    tributes,
    inquiries,
    customPages,
    refreshPublicData,
    saveBranch,
    deleteBranch,
    saveMember,
    approveMember,
    deleteMember,
    getMemberPrivateContact,
    saveHeritageSection,
    saveMediaItem,
    approveMediaItem,
    deleteMediaItem,
    saveEventItem,
    approveEventItem,
    deleteEventItem,
    saveTributeItem,
    approveTributeItem,
    deleteTributeItem,
    saveCustomPage,
    deleteCustomPage,
    submitContactInquiry,
    seedDemoArchive,
    syncMissingLineageRecords,
    clearDemoArchive,
    exportFullBackupJson,
    exportMembersCsv,
    restoreFromBackupJson,
  };

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}

export function useArchive(): ArchiveContextValue {
  const ctx = useContext(ArchiveContext);
  if (!ctx) {
    throw new Error('useArchive must be used inside ArchiveProvider');
  }
  return ctx;
}
