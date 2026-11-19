import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  GitBranch,
  Lock,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { FamilyMember, MemberPrivateContact } from '../types/archive';
import { HeritageImage } from '../components/HeritageImage';
import { PageHeader } from '../components/PageHeader';

export function MembersDirectoryPage() {
  const { t, members, branches, user, isAdmin, saveMember, signInWithGoogle } = useArchive();
  const [searchParams] = useSearchParams();

  const [queryText, setQueryText] = useState('');
  const [branchFilter, setBranchFilter] = useState(searchParams.get('branch') || 'all');
  const [genFilter, setGenFilter] = useState('all');
  const [livingFilter, setLivingFilter] = useState<'all' | 'living' | 'ancestor'>('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Submission form state
  const [fullName, setFullName] = useState('');
  const [fullNameHi, setFullNameHi] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [generation, setGeneration] = useState(3);
  const [branchId, setBranchId] = useState(branches[0]?.id || 'branch_mool_parbatsar');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [education, setEducation] = useState('');
  const [profession, setProfession] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Rajasthan');
  const [country, setCountry] = useState('India');
  const [nativeVillage, setNativeVillage] = useState('Parbatsar');
  const [bio, setBio] = useState('');
  const [isLiving, setIsLiving] = useState(true);
  const [isMinor, setIsMinor] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'family'>('public');
  const [privatePhone, setPrivatePhone] = useState('');
  const [privateEmail, setPrivateEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState('');

  const branchMap = useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach((b) => map.set(b.id, t(b.name, b.nameHi)));
    return map;
  }, [branches, t]);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return members.filter((m) => {
      if (branchFilter !== 'all' && m.branchId !== branchFilter) return false;
      if (genFilter !== 'all' && String(m.generation) !== genFilter) return false;
      if (livingFilter === 'living' && !m.isLiving) return false;
      if (livingFilter === 'ancestor' && m.isLiving) return false;
      if (q) {
        const hay = `${m.fullName} ${m.fullNameHi} ${m.city || ''} ${m.country || ''} ${m.profession || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [members, branchFilter, genFilter, livingFilter, queryText]);

  const generations = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.generation))).sort((a, b) => a - b);
  }, [members]);

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSubmitting(true);
    setSubmitNotice('');
    try {
      const id = `mem_${Date.now()}`;
      await saveMember(
        {
          id,
          fullName: fullName.trim(),
          fullNameHi: fullNameHi.trim() || fullName.trim(),
          gender,
          generation,
          branchId,
          fatherName: fatherName.trim() || undefined,
          motherName: motherName.trim() || undefined,
          spouseName: spouseName.trim() || undefined,
          birthYear: birthYear.trim() || undefined,
          isLiving,
          isMinor,
          education: education.trim() || undefined,
          profession: profession.trim() || undefined,
          city: city.trim() || undefined,
          state: stateName.trim() || undefined,
          country: country.trim() || undefined,
          nativeVillage: nativeVillage.trim() || 'Parbatsar',
          bio: bio.trim() || undefined,
          visibility: isMinor ? 'family' : visibility,
          status: isAdmin ? 'approved' : 'pending',
          isVerified: isAdmin,
          isDemoData: false,
        },
        privatePhone || privateEmail
          ? { phone: privatePhone, email: privateEmail, consentGiven: true }
          : undefined,
      );
      setSubmitNotice(
        isAdmin
          ? t('Profile saved and published.', 'सदस्य विवरण सफलतापूर्वक सुरक्षित व प्रकाशित किया गया।')
          : t(
              'Profile submitted for Admin verification. Thank you!',
              'सदस्य विवरण एडमिन सत्यापन के लिए भेजा गया। धन्यवाद!',
            ),
      );
      setFullName('');
      setFullNameHi('');
      setFatherName('');
      setMotherName('');
      setSpouseName('');
      setPrivatePhone('');
      setPrivateEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        kickerEn="Directory · Members"
        kickerHi="पारिवारिक सदस्य निर्देशिका"
        titleEn="Family Members Directory"
        titleHi="परिवार के सदस्य"
        subtitleEn="Search verified and sample family profiles across generations and cities. Private contact details and minor records remain protected."
        subtitleHi="सभी पीढ़ियों और नगरों में निवासरत परिवार के सदस्यों की सुरक्षित सूची। निजी संपर्क जानकारी गोपनीय रखी जाती है।"
        isDemo={members.some((m) => m.isDemoData)}
        actions={
          user ? (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220]"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('Submit Member Profile', 'नया सदस्य जोड़ें')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220]"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('Sign In to Add Member', 'सदस्य जोड़ने हेतु लॉगिन करें')}</span>
            </button>
          )
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="bg-white border border-[#E5DEC9] rounded-xl p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#57534E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={t('Search by name, city, or profession...', 'नाम, शहर या व्यवसाय से खोजें...')}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#FBF8F3] border border-[#D8CBB0] rounded-lg focus:outline-none focus:border-[#6B1D2F]"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-[#FBF8F3] border border-[#D8CBB0] rounded-lg"
          >
            <option value="all">{t('All Branches', 'सभी शाखाएँ')}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {t(b.name, b.nameHi)}
              </option>
            ))}
          </select>

          <select
            value={genFilter}
            onChange={(e) => setGenFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-[#FBF8F3] border border-[#D8CBB0] rounded-lg"
          >
            <option value="all">{t('All Generations', 'सभी पीढ़ियां')}</option>
            {generations.map((g) => (
              <option key={g} value={String(g)}>
                {t(`Generation ${g}`, `पीढ़ी ${g}`)}
              </option>
            ))}
          </select>

          <div className="inline-flex p-1 bg-[#F3ECE0] rounded-lg">
            {(['all', 'living', 'ancestor'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setLivingFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  livingFilter === st ? 'bg-white text-[#6B1D2F] shadow-xs' : 'text-[#57534E]'
                }`}
              >
                {st === 'all'
                  ? t('All', 'सभी')
                  : st === 'living'
                  ? t('Living', 'वर्तमान')
                  : t('Ancestors', 'पूर्वज')}
              </button>
            ))}
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <Link
              key={m.id}
              to={`/members/${m.id}`}
              className="group bg-white border border-[#E5DEC9] rounded-xl p-6 hover:border-[#B6862D] transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs text-[#57534E]">
                  <span className="font-semibold text-[#6B1D2F] tabular-nums">
                    {t(`Gen ${m.generation}`, `पीढ़ी ${m.generation}`)}
                  </span>
                  <span>
                    {m.status === 'pending'
                      ? t('Pending Approval', 'सत्यापन शेष')
                      : m.isDemoData
                      ? t('DEMO DATA', 'नमूना डेटा')
                      : m.isVerified
                      ? t('Verified', 'सत्यापित')
                      : t('Approved', 'स्वीकृत')}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E5DEC9] bg-[#F3ECE0] shrink-0 flex items-center justify-center">
                    {m.photoUrl ? (
                      <HeritageImage
                        src={m.photoUrl}
                        alt={t(m.fullName, m.fullNameHi)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-serif text-xl font-bold text-[#6B1D2F]">
                        {m.fullName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-serif text-xl font-semibold text-[#1C1917] group-hover:text-[#6B1D2F] transition-colors">
                      {t(m.fullName, m.fullNameHi)}
                    </h2>
                    <p className="text-xs text-[#57534E] mt-0.5 truncate">
                      {branchMap.get(m.branchId) || m.branchId}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-[#44403C] space-y-1 pt-2 border-t border-[#E5DEC9]/70">
                  {m.profession && <p className="truncate">{m.profession}</p>}
                  <p className="text-xs text-[#57534E]">
                    {m.city ? `${m.city}, ${m.country || 'India'}` : m.nativeVillage}
                    {m.nativeVillage && m.city && m.city !== m.nativeVillage
                      ? ` · ${t('Native', 'मूल')}: ${m.nativeVillage}`
                      : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-medium text-[#6B1D2F]">
                <span>{t('View Profile', 'प्रोफ़ाइल देखें')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Submit Member Profile Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#FBF8F3] border border-[#E5DEC9] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-4">
              <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                {t('Submit Family Member Profile', 'परिवार सदस्य विवरण जोड़ें')}
              </h2>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="p-2 rounded-lg border border-[#E5DEC9] bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitNotice && (
              <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-sm text-[#1B4332]">
                {submitNotice}
              </div>
            )}

            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t('Full Name (English) *', 'पूरा नाम (अंग्रेज़ी) *')}
                  </label>
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t('Full Name (Hindi)', 'पूरा नाम (हिन्दी)')}
                  </label>
                  <input
                    value={fullNameHi}
                    onChange={(e) => setFullNameHi(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t('Family Branch', 'परिवार शाखा')}
                  </label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {t(b.name, b.nameHi)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1">
                      {t('Generation', 'पीढ़ी')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={generation}
                      onChange={(e) => setGeneration(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1">
                      {t('Gender', 'लिंग')}
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                    >
                      <option value="male">{t('Male', 'पुरुष')}</option>
                      <option value="female">{t('Female', 'महिला')}</option>
                      <option value="other">{t('Other', 'अन्य')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t("Father's Name", 'पिता का नाम')}
                  </label>
                  <input
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t("Mother's Name", 'माता का नाम')}
                  </label>
                  <input
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t('Spouse Name', 'जीवनसाथी का नाम')}
                  </label>
                  <input
                    value={spouseName}
                    onChange={(e) => setSpouseName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t('Birth Year (Optional)', 'जन्म वर्ष (वैकल्पिक)')}
                  </label>
                  <input
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t('Education', 'शिक्षा')}
                  </label>
                  <input
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t('Profession', 'व्यवसाय / सेवा')}
                  </label>
                  <input
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t('Current City', 'वर्तमान शहर')}
                  </label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t('State / Country', 'राज्य / देश')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                    />
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Country"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E] mb-1">
                  {t('Native Village', 'पैतृक गांव / नगर')}
                </label>
                <input
                  value={nativeVillage}
                  onChange={(e) => setNativeVillage(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E] mb-1">
                  {t('Short Biography', 'संक्षिप्त जीवन परिचय')}
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                />
              </div>

              {/* Privacy & Minor Safeguards */}
              <div className="bg-[#F4EFE6] border border-[#E5DEC9] rounded-xl p-4 space-y-3">
                <p className="text-xs uppercase tracking-[0.14em] text-[#6B1D2F] font-semibold">
                  {t('Privacy & Contact Protection (Private by Default)', 'गोपनीयता एवं सुरक्षा')}
                </p>
                <div className="flex flex-wrap gap-5 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isLiving}
                      onChange={(e) => setIsLiving(e.target.checked)}
                    />
                    <span>{t('Living Member', 'वर्तमान जीवित सदस्य')}</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isMinor}
                      onChange={(e) => {
                        setIsMinor(e.target.checked);
                        if (e.target.checked) setVisibility('family');
                      }}
                    />
                    <span>{t('Under 18 (Protected Minor — Family Login Only)', '18 वर्ष से कम (केवल परिवार लॉगिन)')}</span>
                  </label>
                </div>

                {!isMinor && (
                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1">
                      {t('Directory Visibility', 'प्रोफ़ाइल दृश्यता')}
                    </label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as 'public' | 'family')}
                      className="px-3 py-1.5 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                    >
                      <option value="public">{t('Public Heritage Archive', 'सार्वजनिक अभिलेख')}</option>
                      <option value="family">{t('Family Members Only (Behind Login)', 'केवल लॉगिन किए परिवारजन')}</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <input
                    value={privatePhone}
                    onChange={(e) => setPrivatePhone(e.target.value)}
                    placeholder={t('Private Phone (Never Public)', 'निजी फोन नंबर (सार्वजनिक नहीं)')}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                  />
                  <input
                    value={privateEmail}
                    onChange={(e) => setPrivateEmail(e.target.value)}
                    placeholder={t('Private Email (Never Public)', 'निजी ईमेल (सार्वजनिक नहीं)')}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-sm text-[#57534E]"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220] disabled:opacity-60"
                >
                  {submitting ? t('Saving...', 'सुरक्षित हो रहा है...') : t('Submit Profile', 'विवरण भेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t, members, branches, user, isAdmin, getMemberPrivateContact } = useArchive();
  const [privateContact, setPrivateContact] = useState<MemberPrivateContact | null>(null);

  const member: FamilyMember | undefined = members.find((m) => m.id === id);
  const branch = branches.find((b) => b.id === member?.branchId);

  useEffect(() => {
    let active = true;
    if (member && user && (isAdmin || member.createdBy === user.uid)) {
      getMemberPrivateContact(member.id).then((res) => {
        if (active) setPrivateContact(res);
      });
    } else {
      setPrivateContact(null);
    }
    return () => {
      active = false;
    };
  }, [member, user, isAdmin, getMemberPrivateContact]);

  if (!member) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="font-serif text-3xl text-[#1C1917]">
          {t('Member record not found', 'सदस्य विवरण उपलब्ध नहीं है')}
        </h1>
        <Link to="/members" className="text-sm font-medium text-[#6B1D2F] hover:underline">
          {t('Return to Members Directory', 'सदस्य सूची पर लौटें')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        kickerEn={`Generation ${member.generation} · ${branch ? branch.name : member.branchId}`}
        kickerHi={`पीढ़ी ${member.generation} · ${branch ? branch.nameHi : member.branchId}`}
        titleEn={member.fullName}
        titleHi={member.fullNameHi}
        subtitleEn={`${member.profession || t('Kerapa Family Member', 'केरापा परिवार सदस्य')} · ${member.city ? `${member.city}, ${member.country || 'India'}` : member.nativeVillage}`}
        subtitleHi={`${member.profession || 'केरापा परिवार सदस्य'} · ${member.city ? `${member.city}, ${member.country || 'भारत'}` : member.nativeVillage}`}
        isDemo={member.isDemoData}
        isVerified={member.isVerified}
        actions={
          <Link
            to="/members"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#D8CBB0] rounded-lg text-sm font-medium hover:bg-[#F3ECE0]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('All Members', 'सभी सदस्य')}</span>
          </Link>
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="aspect-square rounded-xl overflow-hidden border border-[#D8CBB0] bg-[#F3ECE0] flex items-center justify-center">
            {member.photoUrl ? (
              <HeritageImage
                src={member.photoUrl}
                alt={t(member.fullName, member.fullNameHi)}
                fallbackTitle={t(member.fullName, member.fullNameHi)}
              />
            ) : (
              <span className="font-serif text-6xl font-bold text-[#6B1D2F]">
                {member.fullName.charAt(0)}
              </span>
            )}
          </div>

          <div className="bg-white border border-[#E5DEC9] rounded-xl p-5 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#6B1D2F] font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>{t('Private Contact Record', 'निजी संपर्क विवरण')}</span>
            </div>
            {privateContact ? (
              <div className="space-y-2 text-sm text-[#1C1917]">
                {privateContact.phone && <p>{t('Phone', 'फोन')}: {privateContact.phone}</p>}
                {privateContact.email && <p>{t('Email', 'ईमेल')}: {privateContact.email}</p>}
                {privateContact.exactBirthDate && <p>{t('DOB', 'जन्म तिथि')}: {privateContact.exactBirthDate}</p>}
              </div>
            ) : (
              <p className="text-xs text-[#57534E] leading-relaxed">
                {t(
                  'Phone numbers and exact personal contact details are never displayed publicly. Only the profile owner or verified Admin can access private contact records.',
                  'फोन नंबर और व्यक्तिगत संपर्क विवरण कभी सार्वजनिक नहीं किए जाते। केवल प्रोफ़ाइल स्वामी या एडमिन ही इसे देख सकते हैं।',
                )}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {(member.bio || member.bioHi) && (
            <div className="bg-white border border-[#E5DEC9] rounded-xl p-6 md:p-8 space-y-2">
              <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                {t('Biography & Life Sketch', 'जीवन परिचय')}
              </h2>
              <p className="text-base text-[#44403C] leading-relaxed">
                {t(member.bio || '', member.bioHi || '')}
              </p>
            </div>
          )}

          <div className="bg-white border border-[#E5DEC9] rounded-xl p-6 md:p-8">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917] mb-5">
              {t('Lineage & Profile Ledger', 'वंशावली एवं व्यक्तिगत विवरण')}
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm border-t border-[#E5DEC9] pt-5">
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-[#57534E]">{t("Father's Name", 'पिता का नाम')}</dt>
                <dd className="font-medium text-[#1C1917] mt-1">{member.fatherName || t('Not recorded', 'दर्ज नहीं')}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-[#57534E]">{t("Mother's Name", 'माता का नाम')}</dt>
                <dd className="font-medium text-[#1C1917] mt-1">{member.motherName || t('Not recorded', 'दर्ज नहीं')}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-[#57534E]">{t('Spouse', 'जीवनसाथी')}</dt>
                <dd className="font-medium text-[#1C1917] mt-1">{member.spouseName || t('Not recorded', 'दर्ज नहीं')}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-[#57534E]">{t('Children', 'संतान')}</dt>
                <dd className="font-medium text-[#1C1917] mt-1">
                  {member.childrenNames && member.childrenNames.length > 0
                    ? member.childrenNames.join(', ')
                    : t('Not recorded', 'दर्ज नहीं')}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-[#57534E]">{t('Education', 'शिक्षा')}</dt>
                <dd className="font-medium text-[#1C1917] mt-1">{member.education || t('Not recorded', 'दर्ज नहीं')}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-[#57534E]">{t('Profession', 'व्यवसाय / कार्य')}</dt>
                <dd className="font-medium text-[#1C1917] mt-1">{member.profession || t('Not recorded', 'दर्ज नहीं')}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-[#57534E]">{t('Current City & Country', 'वर्तमान निवास')}</dt>
                <dd className="font-medium text-[#1C1917] mt-1">
                  {member.city ? `${member.city}${member.state ? `, ${member.state}` : ''}, ${member.country || 'India'}` : t('Not shared', 'साझा नहीं')}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-[#57534E]">{t('Native Village', 'पैतृक गांव / नगर')}</dt>
                <dd className="font-medium text-[#1C1917] mt-1">{member.nativeVillage}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BranchesPage() {
  const { t, branches, members } = useArchive();

  return (
    <div>
      <PageHeader
        kickerEn="Lineage Structure · Shakhas"
        kickerHi="परिवार शाखाएँ"
        titleEn="Kerapa Family Branches"
        titleHi="केरापा परिवार की शाखाएँ"
        subtitleEn="Explore distinct branches descending from the ancestral Parbatsar household and view members within each lineage."
        subtitleHi="मूल परबतसर परिवार से विकसित विभिन्न शाखाओं और उनके सदस्यों का परिचय।"
        isDemo={branches.some((b) => b.isDemoData)}
      />

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => {
          const count = members.filter((m) => m.branchId === branch.id).length;
          return (
            <div
              key={branch.id}
              className="bg-white border border-[#E5DEC9] rounded-xl p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#57534E]">
                  <span className="inline-flex items-center gap-1.5 text-[#6B1D2F] font-semibold uppercase tracking-[0.12em]">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>{t(`Branch ${branch.order}`, `शाखा ${branch.order}`)}</span>
                  </span>
                  <span className="tabular-nums">
                    {count} {t('members', 'सदस्य')}
                  </span>
                </div>

                <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  {t(branch.name, branch.nameHi)}
                </h2>

                {(branch.patriarchName || branch.patriarchNameHi) && (
                  <p className="text-xs text-[#57534E]">
                    <span className="font-medium text-[#1C1917]">{t('Branch Elder', 'शाखा प्रमुख')}:</span>{' '}
                    {t(branch.patriarchName || '', branch.patriarchNameHi || '')}
                  </p>
                )}

                {branch.originPlace && (
                  <p className="text-xs text-[#B6862D] font-medium">{branch.originPlace}</p>
                )}

                {(branch.description || branch.descriptionHi) && (
                  <p className="text-sm text-[#57534E] leading-relaxed">
                    {t(branch.description || '', branch.descriptionHi || '')}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-[#E5DEC9] flex items-center justify-between text-xs font-medium">
                <Link
                  to={`/tree?branch=${branch.id}`}
                  className="text-[#6B1D2F] hover:underline inline-flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{t('View in Tree', 'वंशावली देखें')}</span>
                </Link>
                <Link
                  to={`/members?branch=${branch.id}`}
                  className="text-[#1B4332] hover:underline inline-flex items-center gap-1"
                >
                  <span>{t('Branch Directory', 'सदस्य सूची')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
