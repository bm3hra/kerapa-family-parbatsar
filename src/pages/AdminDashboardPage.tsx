import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Check,
  Database,
  Download,
  Edit3,
  FilePlus2,
  Film,
  GitBranch,
  Image as ImageIcon,
  Plus,
  Search,
  Shield,
  Trash2,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { FamilyBranch, FamilyMember, HeritageEntry } from '../types/archive';
import { PageHeader } from '../components/PageHeader';
import { HeritageImage } from '../components/HeritageImage';
import { AdminPagesManager } from '../components/admin/AdminPagesManager';
import { AdminMediaManager } from '../components/admin/AdminMediaManager';
import { AdminCommunityManager } from '../components/admin/AdminCommunityManager';
import { compressImageToDataUrl } from '../lib/mediaUtils';

type AdminTab =
  | 'pages'
  | 'media'
  | 'members'
  | 'branches'
  | 'community'
  | 'heritage'
  | 'approvals'
  | 'backup';

const VALID_TABS: AdminTab[] = [
  'pages',
  'media',
  'members',
  'branches',
  'community',
  'heritage',
  'approvals',
  'backup',
];

export function AdminDashboardPage() {
  const {
    t,
    user,
    isAdmin,
    signInWithGoogle,
    branches,
    members,
    heritageContent,
    media,
    events,
    tributes,
    inquiries,
    customPages,
    usingDemoFallback,
    missingSeedCount,
    saveBranch,
    deleteBranch,
    saveMember,
    approveMember,
    deleteMember,
    saveHeritageSection,
    approveMediaItem,
    deleteMediaItem,
    approveEventItem,
    deleteEventItem,
    approveTributeItem,
    deleteTributeItem,
    seedDemoArchive,
    syncMissingLineageRecords,
    clearDemoArchive,
    exportFullBackupJson,
    exportMembersCsv,
    restoreFromBackupJson,
  } = useArchive();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabParam = searchParams.get('tab') as AdminTab | null;
  const editPageParam = searchParams.get('editPage') || undefined;

  const [activeTab, setActiveTab] = useState<AdminTab>(
    initialTabParam && VALID_TABS.includes(initialTabParam) ? initialTabParam : 'pages',
  );
  const [mediaDefaultType, setMediaDefaultType] = useState<'photo' | 'video'>('photo');
  const [mediaTabKey, setMediaTabKey] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const param = searchParams.get('tab') as AdminTab | null;
    if (param && VALID_TABS.includes(param)) {
      setActiveTab(param);
    }
  }, [searchParams]);

  // Member Editor State
  const [memberSearch, setMemberSearch] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string>('');
  const [mFullName, setMFullName] = useState('');
  const [mFullNameHi, setMFullNameHi] = useState('');
  const [mGender, setMGender] = useState<'male' | 'female' | 'other'>('male');
  const [mGeneration, setMGeneration] = useState(1);
  const [mBranchId, setMBranchId] = useState(branches[0]?.id || 'branch_parbatsar_root');
  const [mFatherId, setMFatherId] = useState('');
  const [mMotherId, setMMotherId] = useState('');
  const [mSpouseId, setMSpouseId] = useState('');
  const [mChildrenStr, setMChildrenStr] = useState('');
  const [mBirthYear, setMBirthYear] = useState('');
  const [mDeathYear, setMDeathYear] = useState('');
  const [mCity, setMCity] = useState('Parbatsar');
  const [mState, setMState] = useState('Rajasthan');
  const [mCountry, setMCountry] = useState('India');
  const [mNativeVillage, setMNativeVillage] = useState('Parbatsar');
  const [mEducation, setMEducation] = useState('');
  const [mProfession, setMProfession] = useState('');
  const [mPhotoUrl, setMPhotoUrl] = useState('');
  const [mBio, setMBio] = useState('');
  const [mBioHi, setMBioHi] = useState('');
  const [mVerified, setMVerified] = useState(true);
  const [mMinor, setMMinor] = useState(false);
  const [uploadingMemberPhoto, setUploadingMemberPhoto] = useState(false);

  // Branch Editor State
  const [bId, setBId] = useState('');
  const [bName, setBName] = useState('');
  const [bNameHi, setBNameHi] = useState('');
  const [bPatriarch, setBPatriarch] = useState('');
  const [bPatriarchHi, setBPatriarchHi] = useState('');
  const [bOrigin, setBOrigin] = useState('Parbatsar, Rajasthan');
  const [bDesc, setBDesc] = useState('');
  const [bDescHi, setBDescHi] = useState('');
  const [bOrder, setBOrder] = useState(1);

  // Heritage Section Editor State
  const [hKey, setHKey] = useState<'about' | 'history' | 'gotra' | 'parbatsar'>('gotra');
  const currentHeritage = heritageContent[hKey];
  const [hTitle, setHTitle] = useState(currentHeritage.title);
  const [hTitleHi, setHTitleHi] = useState(currentHeritage.titleHi);
  const [hSubtitle, setHSubtitle] = useState(currentHeritage.subtitle || '');
  const [hSubtitleHi, setHSubtitleHi] = useState(currentHeritage.subtitleHi || '');
  const [hSummary, setHSummary] = useState(currentHeritage.summary || '');
  const [hSummaryHi, setHSummaryHi] = useState(currentHeritage.summaryHi || '');
  const [hGotra, setHGotra] = useState(currentHeritage.gotraName || '');
  const [hKuldevta, setHKuldevta] = useState(currentHeritage.kuldevtaName || '');
  const [hKuldevi, setHKuldevi] = useState(currentHeritage.kuldeviName || '');
  const [hEntries, setHEntries] = useState<HeritageEntry[]>(currentHeritage.entries || []);
  const [hVerified, setHVerified] = useState(currentHeritage.isVerified);

  const loadHeritageFields = (key: 'about' | 'history' | 'gotra' | 'parbatsar') => {
    setHKey(key);
    const sec = heritageContent[key];
    setHTitle(sec.title);
    setHTitleHi(sec.titleHi);
    setHSubtitle(sec.subtitle || '');
    setHSubtitleHi(sec.subtitleHi || '');
    setHSummary(sec.summary || '');
    setHSummaryHi(sec.summaryHi || '');
    setHGotra(sec.gotraName || '');
    setHKuldevta(sec.kuldevtaName || '');
    setHKuldevi(sec.kuldeviName || '');
    setHEntries(sec.entries || []);
    setHVerified(sec.isVerified);
  };

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.fullNameHi.toLowerCase().includes(q) ||
        (m.city || '').toLowerCase().includes(q) ||
        (m.profession || '').toLowerCase().includes(q),
    );
  }, [members, memberSearch]);

  const loadMemberForEdit = (m: FamilyMember) => {
    setEditingMemberId(m.id);
    setMFullName(m.fullName);
    setMFullNameHi(m.fullNameHi);
    setMGender(m.gender);
    setMGeneration(m.generation);
    setMBranchId(m.branchId);
    setMFatherId(m.fatherId || '');
    setMMotherId(m.motherId || '');
    setMSpouseId(m.spouseId || '');
    setMChildrenStr((m.childrenNames || []).join(', '));
    setMBirthYear(m.birthYear || '');
    setMDeathYear(m.deathYear || '');
    setMCity(m.city || '');
    setMState(m.state || 'Rajasthan');
    setMCountry(m.country || 'India');
    setMNativeVillage(m.nativeVillage || 'Parbatsar');
    setMEducation(m.education || '');
    setMProfession(m.profession || '');
    setMPhotoUrl(m.photoUrl || '');
    setMBio(m.bio || '');
    setMBioHi(m.bioHi || '');
    setMVerified(m.isVerified);
    setMMinor(m.isMinor);
    setActiveTab('members');
  };

  const resetMemberForm = () => {
    setEditingMemberId('');
    setMFullName('');
    setMFullNameHi('');
    setMFatherId('');
    setMMotherId('');
    setMSpouseId('');
    setMChildrenStr('');
    setMBirthYear('');
    setMDeathYear('');
    setMEducation('');
    setMProfession('');
    setMPhotoUrl('');
    setMBio('');
    setMBioHi('');
  };

  const handleMemberPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMemberPhoto(true);
    try {
      const dataUrl = await compressImageToDataUrl(file, { maxDim: 800, maxChars: 170_000 });
      setMPhotoUrl(dataUrl);
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Member photo upload failed');
    } finally {
      setUploadingMemberPhoto(false);
      e.target.value = '';
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mFullName.trim()) return;
    setBusy(true);
    try {
      const father = members.find((x) => x.id === mFatherId);
      const mother = members.find((x) => x.id === mMotherId);
      const spouse = members.find((x) => x.id === mSpouseId);
      const childrenNames = mChildrenStr
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      await saveMember({
        id: editingMemberId || `mem_${Date.now()}`,
        fullName: mFullName.trim(),
        fullNameHi: mFullNameHi.trim() || mFullName.trim(),
        gender: mGender,
        generation: mGeneration,
        branchId: mBranchId,
        fatherId: mFatherId || undefined,
        fatherName: father?.fullName,
        motherId: mMotherId || undefined,
        motherName: mother?.fullName,
        spouseId: mSpouseId || undefined,
        spouseName: spouse?.fullName,
        childrenNames: childrenNames.length > 0 ? childrenNames : undefined,
        birthYear: mBirthYear.trim() || undefined,
        deathYear: mDeathYear.trim() || undefined,
        isLiving: !mDeathYear.trim(),
        isMinor: mMinor,
        city: mCity.trim() || undefined,
        state: mState.trim() || undefined,
        country: mCountry.trim() || 'India',
        nativeVillage: mNativeVillage.trim() || 'Parbatsar',
        education: mEducation.trim() || undefined,
        profession: mProfession.trim() || undefined,
        photoUrl: mPhotoUrl.trim() || undefined,
        bio: mBio.trim() || undefined,
        bioHi: mBioHi.trim() || undefined,
        visibility: mMinor ? 'family' : 'public',
        status: 'approved',
        isVerified: mVerified,
        isDemoData: false,
      });
      setStatusMsg(t('Member record saved to Cloud Firestore.', 'सदस्य विवरण क्लाउड डेटाबेस में सुरक्षित हो गया।'));
      resetMemberForm();
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Could not save member record.');
    } finally {
      setBusy(false);
    }
  };

  const loadBranchForEdit = (b: FamilyBranch) => {
    setBId(b.id);
    setBName(b.name);
    setBNameHi(b.nameHi || '');
    setBPatriarch(b.patriarchName || '');
    setBPatriarchHi(b.patriarchNameHi || '');
    setBOrigin(b.originPlace || '');
    setBDesc(b.description || '');
    setBDescHi(b.descriptionHi || '');
    setBOrder(b.order || 1);
  };

  const resetBranchForm = () => {
    setBId('');
    setBName('');
    setBNameHi('');
    setBPatriarch('');
    setBPatriarchHi('');
    setBOrigin('Parbatsar, Rajasthan');
    setBDesc('');
    setBDescHi('');
    setBOrder(branches.length + 1);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim()) return;
    setBusy(true);
    try {
      const branch: Omit<FamilyBranch, 'createdAt' | 'updatedAt' | 'createdBy'> = {
        id: bId || `branch_${Date.now()}`,
        name: bName.trim(),
        nameHi: bNameHi.trim() || bName.trim(),
        patriarchName: bPatriarch.trim() || undefined,
        patriarchNameHi: bPatriarchHi.trim() || undefined,
        originPlace: bOrigin.trim() || undefined,
        description: bDesc.trim() || undefined,
        descriptionHi: bDescHi.trim() || undefined,
        order: bOrder,
        isDemoData: false,
      };
      await saveBranch(branch);
      setStatusMsg(t('Family branch saved.', 'परिवार शाखा सुरक्षित हो गई।'));
      resetBranchForm();
    } finally {
      setBusy(false);
    }
  };

  const handleSaveHeritage = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveHeritageSection({
        id: hKey,
        sectionKey: hKey,
        title: hTitle.trim(),
        titleHi: hTitleHi.trim() || hTitle.trim(),
        subtitle: hSubtitle.trim() || undefined,
        subtitleHi: hSubtitleHi.trim() || undefined,
        summary: hSummary.trim(),
        summaryHi: hSummaryHi.trim(),
        gotraName: hKey === 'gotra' ? hGotra.trim() : undefined,
        kuldevtaName: hKey === 'gotra' ? hKuldevta.trim() : undefined,
        kuldeviName: hKey === 'gotra' ? hKuldevi.trim() : undefined,
        entries: hEntries.filter((eItem) => eItem.title.trim() || eItem.body.trim()),
        isVerified: hVerified,
        isDemoData: false,
      });
      setStatusMsg(t('Heritage content updated.', 'ऐतिहासिक सामग्री अद्यतन हो गई।'));
    } finally {
      setBusy(false);
    }
  };

  const triggerDownload = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      await restoreFromBackupJson(text);
      setStatusMsg(t('Archive restored from backup JSON.', 'बैकअप फ़ाइल से डेटा पुनर्स्थापित हो गया।'));
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Restore failed');
    } finally {
      setBusy(false);
    }
  };

  const switchTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  if (!user) {
    return (
      <div>
        <PageHeader
          kickerEn="Archive Governance · Access"
          kickerHi="प्रबंधन प्रवेश"
          titleEn="Admin & Member Portal"
          titleHi="एडमिन एवं सदस्य पोर्टल"
          subtitleEn="Sign in with your verified Google account to create new pages, upload images & videos, manage family tree records, or export backups."
          subtitleHi="नए पृष्ठ बनाने, चित्र-वीडियो जोड़ने, वंशावली संपादन और बैकअप प्रबंधन के लिए गूगल खाते से साइन इन करें।"
        />
        <div className="max-w-lg mx-auto px-6 py-16 text-center space-y-5">
          <div className="bg-white border border-[#E2D9C8] rounded-xl p-8 space-y-5">
            <Shield className="w-10 h-10 text-[#6E182B] mx-auto" strokeWidth={1.5} />
            <h2 className="font-serif text-2xl font-semibold">
              {t('Secure Family Authentication', 'सुरक्षित परिवार प्रमाणीकरण')}
            </h2>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              {t(
                'Role-based access protects custom page publishing, media uploads, family lineage, gotra edits, and private contact details.',
                'भूमिका-आधारित सुरक्षा नए पृष्ठ, मीडिया अपलोड, पारिवारिक वंशावली और निजी संपर्क विवरण की रक्षा करती है।',
              )}
            </p>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="px-6 py-3 bg-[#6E182B] text-white text-sm font-medium rounded-lg hover:bg-[#4F0F1E]"
            >
              {t('Sign In with Google', 'गूगल से साइन इन करें')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    const myPendingMembers = members.filter((m) => m.createdBy === user.uid);
    return (
      <div>
        <PageHeader
          kickerEn="Authenticated Member"
          kickerHi="सत्यापित परिवार सदस्य"
          titleEn="Family Member Portal"
          titleHi="परिवार सदस्य पोर्टल"
          subtitleEn={`Signed in as ${user.displayName || user.email}. Submissions you create are queued for Admin verification.`}
          subtitleHi={`${user.displayName || user.email} के रूप में लॉगिन। आपके द्वारा जोड़े गए विवरण एडमिन स्वीकृति के लिए भेजे जाते हैं।`}
        />
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
          <div className="bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-3">
            <h2 className="font-serif text-2xl font-semibold">
              {t('Your Submitted Records', 'आपके द्वारा भेजे गए विवरण')}
            </h2>
            {myPendingMembers.length === 0 ? (
              <p className="text-sm text-[#5C554E]">
                {t(
                  'You have not submitted any new member profiles yet. Visit the Family Members directory, Photo Gallery, or Video Gallery to contribute.',
                  'आपने अभी तक कोई नया सदस्य विवरण नहीं भेजा है। योगदान देने हेतु सदस्य निर्देशिका या चित्र संग्रह पर जाएं।',
                )}
              </p>
            ) : (
              <div className="divide-y divide-[#E2D9C8]">
                {myPendingMembers.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between">
                    <span className="font-medium">{t(m.fullName, m.fullNameHi)}</span>
                    <span className="text-xs text-[#6E182B] uppercase">{m.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const pendingMembers = members.filter((m) => m.status === 'pending');
  const pendingMedia = media.filter((m) => m.status === 'pending');
  const pendingEvents = events.filter((e) => e.status === 'pending');
  const pendingTributes = tributes.filter((tr) => tr.status === 'pending');
  const totalPending =
    pendingMembers.length + pendingMedia.length + pendingEvents.length + pendingTributes.length;

  return (
    <div>
      <PageHeader
        kickerEn="Archive Stewardship · All-in-One CMS"
        kickerHi="अभिलेख प्रबंधन एवं प्रकाशन केंद्र"
        titleEn="Admin Control Panel"
        titleHi="केरापा परिवार एडमिन पैनल"
        subtitleEn="Create new pages, upload photos, embed videos, add or edit family members, branches, events, tributes, and heritage history in one place."
        subtitleHi="नए पृष्ठ बनाएं, चित्र और वीडियो जोड़ें, सदस्य, शाखाएँ, कार्यक्रम, श्रद्धांजलि और पारिवारिक इतिहास का संपूर्ण प्रबंधन करें।"
        actions={
          <div className="flex flex-wrap gap-2">
            {usingDemoFallback && (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await seedDemoArchive();
                    setStatusMsg(t('Verified lineage seeded to Firestore.', 'सत्यापित वंशावली फ़ायरस्टोर में सुरक्षित की गई।'));
                  } finally {
                    setBusy(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#173F30] text-white text-xs font-medium rounded-lg hover:opacity-90"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{t('Sync Verified Lineage to DB', 'सत्यापित वंशावली डेटाबेस में सिंक करें')}</span>
              </button>
            )}
            {!usingDemoFallback && missingSeedCount > 0 && (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const count = await syncMissingLineageRecords();
                    setStatusMsg(
                      t(
                        `Synced ${count} new verified lineage record(s) to Firestore.`,
                        `${count} नए सत्यापित वंशावली रिकॉर्ड फ़ायरस्टोर में जोड़े गए।`,
                      ),
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#173F30] text-white text-xs font-medium rounded-lg hover:opacity-90"
              >
                <Database className="w-3.5 h-3.5" />
                <span>
                  {t(
                    `Sync ${missingSeedCount} New Lineage Record(s)`,
                    `${missingSeedCount} नए वंशावली रिकॉर्ड जोड़ें`,
                  )}
                </span>
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await clearDemoArchive();
                  setStatusMsg(t('Demo records removed from Firestore.', 'नमूना रिकॉर्ड हटाए गए।'));
                } finally {
                  setBusy(false);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#D8CBB0] text-xs font-medium rounded-lg hover:bg-[#F2ECE1]"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#6E182B]" />
              <span>{t('Clear Demo Records', 'नमूना डेटा हटाएं')}</span>
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {statusMsg && (
          <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-sm text-[#173F30] flex items-center justify-between gap-4">
            <span>{statusMsg}</span>
            <button type="button" onClick={() => setStatusMsg('')} className="text-xs underline shrink-0">
              {t('Dismiss', 'हटाएं')}
            </button>
          </div>
        )}

        {/* Quick-Add Command Bar */}
        <div className="bg-[#F2ECE1] border border-[#E2D9C8] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6E182B]">
            {t('Quick Add Anything', 'त्वरित जोड़ें')}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => switchTab('pages')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#6E182B] text-white text-xs font-medium rounded-lg hover:bg-[#4F0F1E]"
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              <span>{t('+ New Page', '+ नया पृष्ठ')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMediaDefaultType('photo');
                setMediaTabKey((k) => k + 1);
                switchTab('media');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#D8CBB0] text-[#191614] text-xs font-medium rounded-lg hover:border-[#6E182B]"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#6E182B]" />
              <span>{t('+ Add Image', '+ नया चित्र')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMediaDefaultType('video');
                setMediaTabKey((k) => k + 1);
                switchTab('media');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#D8CBB0] text-[#191614] text-xs font-medium rounded-lg hover:border-[#6E182B]"
            >
              <Film className="w-3.5 h-3.5 text-[#6E182B]" />
              <span>{t('+ Add Video', '+ नया वीडियो')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                resetMemberForm();
                switchTab('members');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#D8CBB0] text-[#191614] text-xs font-medium rounded-lg hover:border-[#6E182B]"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#6E182B]" />
              <span>{t('+ Add Member', '+ नया सदस्य')}</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('community')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#D8CBB0] text-[#191614] text-xs font-medium rounded-lg hover:border-[#6E182B]"
            >
              <Calendar className="w-3.5 h-3.5 text-[#6E182B]" />
              <span>{t('+ Event / Tribute', '+ कार्यक्रम / श्रद्धांजलि')}</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 border-b border-[#E2D9C8] pb-4">
          {([
            ['pages', t(`New Pages (${customPages.length})`, `नए पृष्ठ (${customPages.length})`)],
            ['media', t(`Images & Videos (${media.length})`, `चित्र एवं वीडियो (${media.length})`)],
            ['members', t(`Members & Photos (${members.length})`, `सदस्य एवं फोटो (${members.length})`)],
            ['branches', t(`Branches (${branches.length})`, `शाखाएँ (${branches.length})`)],
            ['community', t(`Events & Tributes (${events.length + tributes.length})`, `कार्यक्रम एवं श्रद्धांजलि`)],
            ['heritage', t('History & Gotra', 'इतिहास एवं गोत्र')],
            ['approvals', t(`Approvals (${totalPending})`, `स्वीकृति (${totalPending})`)],
            ['backup', t('Backup & Inquiries', 'बैकअप एवं संदेश')],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchTab(key)}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                activeTab === key
                  ? 'bg-[#6E182B] text-white'
                  : 'bg-white border border-[#E2D9C8] text-[#5C554E] hover:text-[#191614]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom Pages Builder Tab */}
        {activeTab === 'pages' && (
          <AdminPagesManager initialEditPageId={editPageParam} onStatus={setStatusMsg} />
        )}

        {/* Images & Videos Studio Tab */}
        {activeTab === 'media' && (
          <AdminMediaManager
            key={`${mediaDefaultType}_${mediaTabKey}`}
            defaultType={mediaDefaultType}
            onStatus={setStatusMsg}
          />
        )}

        {/* Events & Tributes Manager Tab */}
        {activeTab === 'community' && <AdminCommunityManager onStatus={setStatusMsg} />}

        {/* Members & Tree Relationships + Photo Upload Tab */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form
              onSubmit={handleSaveMember}
              className="lg:col-span-5 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-4 h-fit"
            >
              <div className="flex items-center justify-between border-b border-[#E2D9C8] pb-3">
                <h2 className="font-serif text-2xl font-bold">
                  {editingMemberId
                    ? t('Edit Family Member', 'सदस्य संपादित करें')
                    : t('Add Family Member', 'नया सदस्य जोड़ें')}
                </h2>
                {editingMemberId && (
                  <button type="button" onClick={resetMemberForm} className="text-xs text-[#6E182B] underline">
                    {t('+ New', '+ नया')}
                  </button>
                )}
              </div>

              {/* Member Portrait Upload / URL */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#D8CBB0] bg-white shrink-0 flex items-center justify-center">
                    {mPhotoUrl ? (
                      <HeritageImage src={mPhotoUrl} alt={mFullName || 'Portrait'} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#A67C2E]" />
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6E182B] text-white text-xs font-medium rounded-lg cursor-pointer hover:bg-[#4F0F1E]">
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {uploadingMemberPhoto
                            ? t('Optimizing…', 'प्रोसेसिंग…')
                            : t('Upload Member Photo', 'सदस्य फोटो अपलोड करें')}
                        </span>
                        <input type="file" accept="image/*" onChange={handleMemberPhotoUpload} className="hidden" />
                      </label>
                      {mPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setMPhotoUrl('')}
                          className="text-xs text-red-700 hover:underline"
                        >
                          {t('Remove', 'हटाएं')}
                        </button>
                      )}
                    </div>
                    <input
                      value={mPhotoUrl}
                      onChange={(e) => setMPhotoUrl(e.target.value)}
                      placeholder={t('Or paste photo URL / asset path', 'या फोटो URL पेस्ट करें')}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D8CBB0] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <input
                required
                value={mFullName}
                onChange={(e) => setMFullName(e.target.value)}
                placeholder={t('Full Name (English) *', 'पूरा नाम (अंग्रेज़ी) *')}
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
              />
              <input
                value={mFullNameHi}
                onChange={(e) => setMFullNameHi(e.target.value)}
                placeholder={t('Full Name (Hindi)', 'पूरा नाम (हिन्दी)')}
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={mGender}
                  onChange={(e) => setMGender(e.target.value as 'male' | 'female' | 'other')}
                  className="px-2 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                >
                  <option value="male">{t('Male', 'पुरुष')}</option>
                  <option value="female">{t('Female', 'महिला')}</option>
                  <option value="other">{t('Other', 'अन्य')}</option>
                </select>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={mGeneration}
                  onChange={(e) => setMGeneration(Number(e.target.value))}
                  placeholder="Gen"
                  className="px-2 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
                <select
                  value={mBranchId}
                  onChange={(e) => setMBranchId(e.target.value)}
                  className="px-2 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {t(b.name, b.nameHi)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-[#5C554E]">
                  {t('Link Tree Relationships (Father / Mother / Spouse)', 'वंशावली संबंध जोड़ें')}
                </label>
                <select
                  value={mFatherId}
                  onChange={(e) => setMFatherId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                >
                  <option value="">{t('— Select Father (Optional) —', '— पिता चुनें —')}</option>
                  {members.map((x) => (
                    <option key={x.id} value={x.id}>
                      Gen {x.generation}: {x.fullName}
                    </option>
                  ))}
                </select>
                <select
                  value={mMotherId}
                  onChange={(e) => setMMotherId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                >
                  <option value="">{t('— Select Mother (Optional) —', '— माता चुनें —')}</option>
                  {members.map((x) => (
                    <option key={x.id} value={x.id}>
                      Gen {x.generation}: {x.fullName}
                    </option>
                  ))}
                </select>
                <select
                  value={mSpouseId}
                  onChange={(e) => setMSpouseId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                >
                  <option value="">{t('— Select Spouse (Optional) —', '— जीवनसाथी चुनें —')}</option>
                  {members.map((x) => (
                    <option key={x.id} value={x.id}>
                      Gen {x.generation}: {x.fullName}
                    </option>
                  ))}
                </select>
                <input
                  value={mChildrenStr}
                  onChange={(e) => setMChildrenStr(e.target.value)}
                  placeholder={t('Children Names (comma separated)', 'संतानों के नाम (अल्पविराम से)')}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  value={mBirthYear}
                  onChange={(e) => setMBirthYear(e.target.value)}
                  placeholder={t('Birth Year', 'जन्म वर्ष')}
                  className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
                <input
                  value={mDeathYear}
                  onChange={(e) => setMDeathYear(e.target.value)}
                  placeholder={t('Death Year (if any)', 'निधन वर्ष')}
                  className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
                <input
                  value={mCity}
                  onChange={(e) => setMCity(e.target.value)}
                  placeholder={t('Current City', 'शहर')}
                  className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
                <input
                  value={mState}
                  onChange={(e) => setMState(e.target.value)}
                  placeholder={t('State', 'राज्य')}
                  className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
                <input
                  value={mNativeVillage}
                  onChange={(e) => setMNativeVillage(e.target.value)}
                  placeholder={t('Native Village / Town', 'मूल गांव / कस्बा')}
                  className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
                <input
                  value={mCountry}
                  onChange={(e) => setMCountry(e.target.value)}
                  placeholder={t('Country', 'देश')}
                  className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  value={mProfession}
                  onChange={(e) => setMProfession(e.target.value)}
                  placeholder={t('Profession / Occupation', 'व्यवसाय')}
                  className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
                <input
                  value={mEducation}
                  onChange={(e) => setMEducation(e.target.value)}
                  placeholder={t('Education', 'शिक्षा')}
                  className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
              </div>

              <textarea
                rows={2}
                value={mBio}
                onChange={(e) => setMBio(e.target.value)}
                placeholder={t('Short biography (English)', 'संक्षिप्त परिचय (अंग्रेज़ी)')}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
              />
              <textarea
                rows={2}
                value={mBioHi}
                onChange={(e) => setMBioHi(e.target.value)}
                placeholder={t('Short biography (Hindi)', 'संक्षिप्त परिचय (हिन्दी)')}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
              />

              <div className="flex flex-wrap gap-4 text-xs">
                <label className="inline-flex items-center gap-1.5">
                  <input type="checkbox" checked={mVerified} onChange={(e) => setMVerified(e.target.checked)} />
                  <span>{t('Mark Verified', 'सत्यापित चिह्नित करें')}</span>
                </label>
                <label className="inline-flex items-center gap-1.5">
                  <input type="checkbox" checked={mMinor} onChange={(e) => setMMinor(e.target.checked)} />
                  <span>{t('Minor (Protected)', 'नाबालिग (गोपनीय)')}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={busy || uploadingMemberPhoto}
                className="w-full py-2.5 bg-[#6E182B] text-white text-sm font-medium rounded-lg hover:bg-[#4F0F1E] disabled:opacity-60"
              >
                {editingMemberId ? t('Update Member', 'अद्यतन करें') : t('Save Member', 'सुरक्षित करें')}
              </button>
            </form>

            <div className="lg:col-span-7 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-2xl font-bold">
                  {t(`All Directory Records (${filteredMembers.length})`, `सभी सदस्य अभिलेख (${filteredMembers.length})`)}
                </h2>
                <div className="relative min-w-[210px]">
                  <Search className="w-4 h-4 text-[#5C554E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder={t('Search member…', 'सदस्य खोजें…')}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                  />
                </div>
              </div>
              <div className="divide-y divide-[#E2D9C8] max-h-[680px] overflow-y-auto">
                {filteredMembers.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E2D9C8] bg-[#F2ECE1] shrink-0 flex items-center justify-center text-xs font-serif font-bold text-[#6E182B]">
                        {m.photoUrl ? (
                          <HeritageImage src={m.photoUrl} alt={m.fullName} className="w-full h-full object-cover" />
                        ) : (
                          m.fullName.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-[#191614] truncate">
                          {t(m.fullName, m.fullNameHi)}
                        </p>
                        <p className="text-xs text-[#5C554E] truncate">
                          Gen {m.generation} · {m.city || m.nativeVillage} ·{' '}
                          {m.isDemoData ? 'DEMO' : m.isVerified ? 'Verified' : 'Unverified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => loadMemberForEdit(m)}
                        className="p-1.5 rounded border border-[#D8CBB0] hover:bg-[#F2ECE1]"
                        aria-label="Edit member"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!m.createdBy.startsWith('demo') && (
                        <button
                          type="button"
                          onClick={() => deleteMember(m.id)}
                          className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50"
                          aria-label="Delete member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Branches Tab */}
        {activeTab === 'branches' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <form
              onSubmit={handleSaveBranch}
              className="lg:col-span-5 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-3.5 h-fit"
            >
              <div className="flex items-center justify-between border-b border-[#E2D9C8] pb-3">
                <h2 className="font-serif text-2xl font-bold inline-flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-[#6E182B]" />
                  <span>{bId ? t('Edit Family Branch', 'शाखा संपादित करें') : t('Create Family Branch', 'नई शाखा जोड़ें')}</span>
                </h2>
                {bId && (
                  <button type="button" onClick={resetBranchForm} className="text-xs text-[#6E182B] underline">
                    {t('+ New', '+ नई')}
                  </button>
                )}
              </div>
              <input
                required
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                placeholder={t('Branch Name (English) *', 'शाखा का नाम (अंग्रेज़ी) *')}
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
              />
              <input
                value={bNameHi}
                onChange={(e) => setBNameHi(e.target.value)}
                placeholder={t('Branch Name (Hindi)', 'शाखा का नाम (हिन्दी)')}
                className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={bPatriarch}
                  onChange={(e) => setBPatriarch(e.target.value)}
                  placeholder={t('Patriarch / Elder (EN)', 'शाखा प्रमुख (अंग्रेज़ी)')}
                  className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
                <input
                  value={bPatriarchHi}
                  onChange={(e) => setBPatriarchHi(e.target.value)}
                  placeholder={t('Patriarch / Elder (HI)', 'शाखा प्रमुख (हिन्दी)')}
                  className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={bOrigin}
                  onChange={(e) => setBOrigin(e.target.value)}
                  placeholder={t('Origin Place', 'मूल स्थान')}
                  className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
                <input
                  type="number"
                  min={1}
                  value={bOrder}
                  onChange={(e) => setBOrder(Number(e.target.value))}
                  placeholder="Order"
                  className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                />
              </div>
              <textarea
                rows={2}
                value={bDesc}
                onChange={(e) => setBDesc(e.target.value)}
                placeholder={t('Description (English)', 'विवरण (अंग्रेज़ी)')}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
              />
              <textarea
                rows={2}
                value={bDescHi}
                onChange={(e) => setBDescHi(e.target.value)}
                placeholder={t('Description (Hindi)', 'विवरण (हिन्दी)')}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
              />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-[#6E182B] text-white text-sm font-medium rounded-lg hover:bg-[#4F0F1E]"
              >
                <Plus className="w-4 h-4" />
                <span>{bId ? t('Update Branch', 'शाखा अद्यतन करें') : t('Save Branch', 'शाखा सुरक्षित करें')}</span>
              </button>
            </form>

            <div className="lg:col-span-7 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-3">
              <h2 className="font-serif text-2xl font-bold">{t('Existing Branches', 'वर्तमान शाखाएँ')}</h2>
              <div className="divide-y divide-[#E2D9C8]">
                {branches.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm text-[#191614]">{t(b.name, b.nameHi)}</p>
                      <p className="text-xs text-[#5C554E]">{b.originPlace}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => loadBranchForEdit(b)}
                        className="p-1.5 rounded border border-[#D8CBB0] hover:bg-[#F2ECE1]"
                        title={t('Edit Branch', 'संपादित करें')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!b.createdBy.startsWith('demo') && (
                        <button
                          type="button"
                          onClick={() => deleteBranch(b.id)}
                          className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Heritage & Gotra Editor Tab (Now with Dynamic Entries Editor) */}
        {activeTab === 'heritage' && (
          <div className="bg-white border border-[#E2D9C8] rounded-xl p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {(['gotra', 'history', 'parbatsar', 'about'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => loadHeritageFields(k)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border capitalize ${
                      hKey === k ? 'bg-[#6E182B] text-white border-[#6E182B]' : 'bg-[#FAF7F2] border-[#D8CBB0]'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <span className="text-xs text-[#5C554E] inline-flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#A67C2E]" />
                {t('Edit core heritage pages & chapters', 'मुख्य इतिहास व गोत्र पृष्ठ संपादित करें')}
              </span>
            </div>

            <form onSubmit={handleSaveHeritage} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5C554E] mb-1">Title (English)</label>
                  <input
                    required
                    value={hTitle}
                    onChange={(e) => setHTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C554E] mb-1">Title (Hindi)</label>
                  <input
                    value={hTitleHi}
                    onChange={(e) => setHTitleHi(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C554E] mb-1">Subtitle (English)</label>
                  <input
                    value={hSubtitle}
                    onChange={(e) => setHSubtitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C554E] mb-1">Subtitle (Hindi)</label>
                  <input
                    value={hSubtitleHi}
                    onChange={(e) => setHSubtitleHi(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                  />
                </div>
              </div>

              {hKey === 'gotra' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F2ECE1] p-4 rounded-xl border border-[#E2D9C8]">
                  <div>
                    <label className="block text-xs font-medium text-[#5C554E] mb-1">Verified Gotra Name</label>
                    <input
                      value={hGotra}
                      onChange={(e) => setHGotra(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C554E] mb-1">Kuldevta</label>
                    <input
                      value={hKuldevta}
                      onChange={(e) => setHKuldevta(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C554E] mb-1">Kuldevi</label>
                    <input
                      value={hKuldevi}
                      onChange={(e) => setHKuldevi(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5C554E] mb-1">Summary (English)</label>
                  <textarea
                    rows={4}
                    value={hSummary}
                    onChange={(e) => setHSummary(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C554E] mb-1">Summary (Hindi)</label>
                  <textarea
                    rows={4}
                    value={hSummaryHi}
                    onChange={(e) => setHSummaryHi(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
                  />
                </div>
              </div>

              {/* Structured Chapters / Entries Editor */}
              <div className="space-y-3 pt-2 border-t border-[#E2D9C8]">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-[#191614]">
                    {t(`Timeline / Section Entries (${hEntries.length}/25)`, `अध्याय / प्रविष्टियां (${hEntries.length}/25)`)}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (hEntries.length >= 25) return;
                      setHEntries((prev) => [
                        ...prev,
                        {
                          id: `${hKey}_${Date.now()}`,
                          era: '',
                          title: '',
                          titleHi: '',
                          body: '',
                          bodyHi: '',
                          verified: true,
                        },
                      ]);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F2ECE1] border border-[#D8CBB0] text-xs font-medium text-[#6E182B] rounded-lg hover:bg-[#EAE0CF]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('Add Chapter / Entry', 'नया अध्याय जोड़ें')}</span>
                  </button>
                </div>

                {hEntries.map((entry, idx) => (
                  <div key={entry.id} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#6E182B]">
                        {t(`Entry #${idx + 1}`, `अध्याय #${idx + 1}`)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setHEntries((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-xs text-red-700 inline-flex items-center gap-1 hover:underline"
                      >
                        <X className="w-3.5 h-3.5" />
                        {t('Remove', 'हटाएं')}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        value={entry.era}
                        onChange={(e) =>
                          setHEntries((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, era: e.target.value } : item)),
                          )
                        }
                        placeholder={t('Era / Label (e.g. 1950s)', 'कालखंड / लेबल')}
                        className="px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
                      />
                      <input
                        value={entry.title}
                        onChange={(e) =>
                          setHEntries((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, title: e.target.value } : item)),
                          )
                        }
                        placeholder={t('Heading (English)', 'शीर्षक (अंग्रेज़ी)')}
                        className="px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
                      />
                      <input
                        value={entry.titleHi}
                        onChange={(e) =>
                          setHEntries((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, titleHi: e.target.value } : item)),
                          )
                        }
                        placeholder={t('Heading (Hindi)', 'शीर्षक (हिन्दी)')}
                        className="px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <textarea
                        rows={2}
                        value={entry.body}
                        onChange={(e) =>
                          setHEntries((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, body: e.target.value } : item)),
                          )
                        }
                        placeholder={t('Details (English)', 'विवरण (अंग्रेज़ी)')}
                        className="px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
                      />
                      <textarea
                        rows={2}
                        value={entry.bodyHi}
                        onChange={(e) =>
                          setHEntries((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, bodyHi: e.target.value } : item)),
                          )
                        }
                        placeholder={t('Details (Hindi)', 'विवरण (हिन्दी)')}
                        className="px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={hVerified} onChange={(e) => setHVerified(e.target.checked)} />
                <span>{t('Mark section as Verified by Family Elders', 'वरिष्ठजनों द्वारा सत्यापित चिह्नित करें')}</span>
              </label>

              <div>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-6 py-2.5 bg-[#6E182B] text-white text-sm font-medium rounded-lg hover:bg-[#4F0F1E]"
                >
                  {t('Save Heritage Section', 'विवरण सुरक्षित करें')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-4">
              <h2 className="font-serif text-2xl font-bold">
                {t('Pending Approval Queue', 'स्वीकृति हेतु लंबित प्रविष्टियां')}
              </h2>

              {totalPending === 0 ? (
                <p className="text-sm text-[#5C554E]">
                  {t('All submitted member profiles, media, events, and tributes are reviewed.', 'कोई लंबित प्रविष्टि नहीं है।')}
                </p>
              ) : (
                <div className="divide-y divide-[#E2D9C8]">
                  {pendingMembers.map((m) => (
                    <div key={m.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#6E182B] font-semibold">Member Profile</p>
                        <p className="font-medium">{t(m.fullName, m.fullNameHi)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => approveMember(m.id, true)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#173F30] text-white text-xs rounded-lg"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('Approve & Verify', 'स्वीकृत करें')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMember(m.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 text-xs rounded-lg"
                        >
                          {t('Delete', 'हटाएं')}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingMedia.map((item) => (
                    <div key={item.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#A67C2E] font-semibold">Media ({item.mediaType})</p>
                        <p className="font-medium">{t(item.title, item.titleHi)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => approveMediaItem(item.id)}
                          className="px-3 py-1.5 bg-[#173F30] text-white text-xs rounded-lg"
                        >
                          {t('Approve', 'स्वीकृत')}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMediaItem(item.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 text-xs rounded-lg"
                        >
                          {t('Delete', 'हटाएं')}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingEvents.map((ev) => (
                    <div key={ev.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#6E182B] font-semibold">Event</p>
                        <p className="font-medium">{t(ev.title, ev.titleHi)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => approveEventItem(ev.id)}
                          className="px-3 py-1.5 bg-[#173F30] text-white text-xs rounded-lg"
                        >
                          {t('Approve', 'स्वीकृत')}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEventItem(ev.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 text-xs rounded-lg"
                        >
                          {t('Delete', 'हटाएं')}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingTributes.map((tr) => (
                    <div key={tr.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#6E182B] font-semibold">Tribute</p>
                        <p className="font-medium">{t(tr.honoreeName, tr.honoreeNameHi)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => approveTributeItem(tr.id)}
                          className="px-3 py-1.5 bg-[#173F30] text-white text-xs rounded-lg"
                        >
                          {t('Approve', 'स्वीकृत')}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTributeItem(tr.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 text-xs rounded-lg"
                        >
                          {t('Delete', 'हटाएं')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Backup, Export, Restore & Inquiries Tab */}
        {activeTab === 'backup' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-5">
              <h2 className="font-serif text-2xl font-bold">
                {t('Archive Backup, Export & Restore', 'बैकअप, निर्यात एवं पुनर्स्थापना')}
              </h2>
              <p className="text-sm text-[#5C554E] leading-relaxed">
                {t(
                  'Download the complete Kerapa Family archive — including custom pages, images, videos, members, branches, events, and tributes — as JSON or export the family tree directory as CSV.',
                  'संपूर्ण केरापा परिवार अभिलेख (नए पृष्ठ, चित्र, वीडियो, सदस्य, शाखाएँ और इतिहास सहित) JSON बैकअप के रूप में सुरक्षित रखें।',
                )}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    triggerDownload(
                      `kerapa-family-archive-${new Date().toISOString().slice(0, 10)}.json`,
                      exportFullBackupJson(),
                      'application/json',
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6E182B] text-white text-sm font-medium rounded-lg hover:bg-[#4F0F1E]"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('Export Full JSON Backup', 'पूर्ण JSON बैकअप डाउनलोड करें')}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerDownload(
                      `kerapa-family-members-${new Date().toISOString().slice(0, 10)}.csv`,
                      exportMembersCsv(),
                      'text/csv',
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F2ECE1] border border-[#D8CBB0] text-[#191614] text-sm font-medium rounded-lg hover:bg-[#EAE0CF]"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('Export Members CSV', 'सदस्य CSV निर्यात करें')}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-[#E2D9C8] space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E182B]">
                  {t('Restore Archive from JSON Backup', 'JSON बैकअप से पुनर्स्थापित करें')}
                </label>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D8CBB0] rounded-lg text-sm cursor-pointer hover:bg-[#FAF7F2]">
                  <Upload className="w-4 h-4 text-[#6E182B]" />
                  <span>{t('Select Backup JSON File', 'बैकअप फ़ाइल चुनें')}</span>
                  <input type="file" accept=".json,application/json" onChange={handleRestoreFile} className="hidden" />
                </label>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-4">
              <h2 className="font-serif text-2xl font-bold">
                {t(`Family Contact Inquiries (${inquiries.length})`, `पारिवारिक संदेश (${inquiries.length})`)}
              </h2>
              {inquiries.length === 0 ? (
                <p className="text-sm text-[#5C554E]">
                  {t('No private contact inquiries received yet.', 'अभी कोई संदेश प्राप्त नहीं हुआ है।')}
                </p>
              ) : (
                <div className="divide-y divide-[#E2D9C8] max-h-[420px] overflow-y-auto">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="py-3 space-y-1">
                      <p className="text-xs text-[#6E182B] font-semibold">
                        {inq.senderName} {inq.senderCity ? `· ${inq.senderCity}` : ''}
                      </p>
                      <p className="font-medium text-sm text-[#191614]">{inq.subject}</p>
                      <p className="text-xs text-[#5C554E]">{inq.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
