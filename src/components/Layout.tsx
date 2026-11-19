import React, { useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, LogIn, LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { HERITAGE_ASSETS } from '../data/assets';

interface NavGroup {
  key: 'lineage' | 'chronicle' | 'memories' | 'custom';
  headingEn: string;
  headingHi: string;
  links: Array<{ to: string; labelEn: string; labelHi: string }>;
}

const BASE_ARCHIVE_GROUPS: NavGroup[] = [
  {
    key: 'lineage',
    headingEn: 'Lineage & Identity',
    headingHi: 'वंशावली एवं पहचान',
    links: [
      { to: '/', labelEn: 'Home', labelHi: 'मुख्य पृष्ठ' },
      { to: '/tree', labelEn: 'Family Tree', labelHi: 'वंशावली' },
      { to: '/members', labelEn: 'Family Members', labelHi: 'परिवार के सदस्य' },
      { to: '/branches', labelEn: 'Family Branches', labelHi: 'परिवार शाखाएँ' },
      { to: '/gotra', labelEn: 'Gotra & Identity', labelHi: 'गोत्र एवं पहचान' },
    ],
  },
  {
    key: 'chronicle',
    headingEn: 'Chronicle & Geography',
    headingHi: 'इतिहास एवं स्थान',
    links: [
      { to: '/about', labelEn: 'About Kerapa Family', labelHi: 'परिवार परिचय' },
      { to: '/history', labelEn: 'Family History', labelHi: 'परिवार का इतिहास' },
      { to: '/parbatsar', labelEn: 'Ancestral Parbatsar', labelHi: 'हमारा परबतसर' },
      { to: '/map', labelEn: 'Residence Map', labelHi: 'निवास मानचित्र' },
    ],
  },
  {
    key: 'memories',
    headingEn: 'Memories & Community',
    headingHi: 'स्मृतियां एवं संवाद',
    links: [
      { to: '/photos', labelEn: 'Photo Gallery', labelHi: 'चित्र संग्रह' },
      { to: '/videos', labelEn: 'Video Gallery', labelHi: 'चलचित्र संग्रह' },
      { to: '/events', labelEn: 'Family Events', labelHi: 'पारिवारिक कार्यक्रम' },
      { to: '/tributes', labelEn: 'Memories & Tributes', labelHi: 'स्मृतियां एवं श्रद्धांजलि' },
      { to: '/contact', labelEn: 'Contact', labelHi: 'संपर्क एवं योगदान' },
      { to: '/admin', labelEn: 'Admin Dashboard', labelHi: 'प्रबंधन केंद्र' },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t, user, isAdmin, signInWithGoogle, signOutUser, usingDemoFallback, customPages } =
    useArchive();
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const archiveGroups = useMemo<NavGroup[]>(() => {
    const navPages = customPages.filter((p) => p.status === 'published' && p.showInNav);
    const groups: NavGroup[] = BASE_ARCHIVE_GROUPS.map((g) => ({
      ...g,
      links: [
        ...g.links,
        ...navPages
          .filter((p) => p.navGroup === g.key)
          .map((p) => ({
            to: `/page/${p.slug}`,
            labelEn: p.title,
            labelHi: p.titleHi || p.title,
          })),
      ],
    }));

    const standalonePages = navPages.filter((p) => p.navGroup === 'custom');
    if (standalonePages.length > 0) {
      groups.push({
        key: 'custom',
        headingEn: 'Special Pages',
        headingHi: 'विशेष पृष्ठ',
        links: standalonePages.map((p) => ({
          to: `/page/${p.slug}`,
          labelEn: p.title,
          labelHi: p.titleHi || p.title,
        })),
      });
    }
    return groups;
  }, [customPages]);

  const closeMenus = () => {
    setDirectoryOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#191614]">
      {/* Top Bar Contract: Single row, strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E2D9C8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <Link
            to="/"
            onClick={closeMenus}
            className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#6E182B] whitespace-nowrap shrink-0"
          >
            {t('Kerapa Family', 'केरापा परिवार')}
          </Link>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#5C554E]">
            <NavLink
              to="/tree"
              onClick={closeMenus}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                  isActive
                    ? 'border-[#6E182B] text-[#6E182B]'
                    : 'border-transparent hover:text-[#191614]'
                }`
              }
            >
              {t('Family Tree', 'वंशावली')}
            </NavLink>
            <NavLink
              to="/history"
              onClick={closeMenus}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                  isActive
                    ? 'border-[#6E182B] text-[#6E182B]'
                    : 'border-transparent hover:text-[#191614]'
                }`
              }
            >
              {t('History', 'इतिहास')}
            </NavLink>
            <NavLink
              to="/members"
              onClick={closeMenus}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                  isActive
                    ? 'border-[#6E182B] text-[#6E182B]'
                    : 'border-transparent hover:text-[#191614]'
                }`
              }
            >
              {t('Members', 'सदस्य')}
            </NavLink>
            <NavLink
              to="/parbatsar"
              onClick={closeMenus}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                  isActive
                    ? 'border-[#6E182B] text-[#6E182B]'
                    : 'border-transparent hover:text-[#191614]'
                }`
              }
            >
              {t('Parbatsar', 'परबतसर')}
            </NavLink>
            <button
              type="button"
              onClick={() => setDirectoryOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                directoryOpen
                  ? 'border-[#A67C2E] text-[#6E182B]'
                  : 'border-transparent hover:text-[#191614]'
              }`}
              aria-expanded={directoryOpen}
            >
              <span>{t('All Sections', 'सभी विभाग')}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-150 ${
                  directoryOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                closeMenus();
                if (user) {
                  navigate('/admin');
                } else {
                  signInWithGoogle();
                }
              }}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#6E182B] text-white text-xs md:text-sm font-medium rounded-lg hover:bg-[#4F0F1E] transition-colors whitespace-nowrap shrink-0"
            >
              {user ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAdmin ? t('Admin Panel', 'एडमिन पैनल') : t('Member Portal', 'सदस्य पोर्टल')}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t('Family Sign In', 'परिवार लॉगिन')}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-[#E2D9C8] text-[#191614] hover:bg-[#F2ECE1] transition-colors"
              aria-label={t('Open navigation menu', 'मेनू खोलें')}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Archive Index Mega-Drawer (All Built-in + Custom Pages) */}
        {directoryOpen && (
          <div className="hidden lg:block border-t border-[#E2D9C8] bg-[#FAF7F2] shadow-lg">
            <div
              className={`max-w-7xl mx-auto px-8 py-8 grid gap-10 ${
                archiveGroups.length > 3 ? 'grid-cols-4' : 'grid-cols-3'
              }`}
            >
              {archiveGroups.map((group) => (
                <div key={group.headingEn}>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#A67C2E] font-semibold mb-4">
                    {t(group.headingEn, group.headingHi)}
                  </p>
                  <ul className="space-y-2.5">
                    {group.links.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={closeMenus}
                          className={`text-sm transition-colors ${
                            location.pathname === item.to
                              ? 'text-[#6E182B] font-semibold'
                              : 'text-[#44403C] hover:text-[#6E182B]'
                          }`}
                        >
                          {t(item.labelEn, item.labelHi)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Full Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2D9C8] bg-[#FAF7F2] max-h-[82vh] overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2D9C8]">
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="inline-flex items-center gap-2 min-h-[44px] px-3 rounded-lg bg-[#F2ECE1] text-sm font-medium text-[#6E182B]"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'en' ? 'हिन्दी में देखें' : 'Switch to English'}</span>
              </button>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMenus();
                    navigate('/admin');
                  }}
                  className="min-h-[44px] px-4 py-2 bg-[#6E182B] text-white text-xs font-medium rounded-lg"
                >
                  {isAdmin ? t('Admin Panel', 'एडमिन पैनल') : t('Member Portal', 'सदस्य पोर्टल')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    closeMenus();
                    signInWithGoogle();
                  }}
                  className="min-h-[44px] px-4 py-2 bg-[#6E182B] text-white text-xs font-medium rounded-lg"
                >
                  {t('Family Sign In', 'परिवार लॉगिन')}
                </button>
              )}
            </div>

            {archiveGroups.map((group) => (
              <div key={group.headingEn}>
                <p className="text-xs uppercase tracking-[0.16em] text-[#A67C2E] font-semibold mb-2">
                  {t(group.headingEn, group.headingHi)}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {group.links.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={closeMenus}
                      className={`min-h-[44px] flex items-center px-3 rounded-lg text-sm ${
                        location.pathname === item.to
                          ? 'bg-[#6E182B]/10 text-[#6E182B] font-semibold'
                          : 'text-[#44403C] hover:bg-[#F2ECE1]'
                      }`}
                    >
                      {t(item.labelEn, item.labelHi)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Non-sticky Utility Strip: Preserves <15% mobile sticky cap while keeping bilingual switch 1 click away */}
      <div className="border-b border-[#E2D9C8] bg-[#F2ECE1]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#5C554E]">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="font-semibold text-[#6E182B] whitespace-nowrap">
              {t('Ward No. 19, Parbatsar · Didwana-Kuchaman (Nagaur), Raj.', 'वार्ड नं. 19, परबतसर · डीडवाना-कुचामन (नागौर), राज.')}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline truncate">
              {usingDemoFallback
                ? t(
                    'Verified Kerapa Lineage Active · Sign in as Admin to sync to Cloud Firestore',
                    'सत्यापित केरापा वंशावली सक्रिय · क्लाउड डेटाबेस में सिंक करने हेतु एडमिन लॉगिन करें',
                  )
                : t(
                    'Live Digital Heritage Record · Cloud Firestore',
                    'लाइव डिजिटल पारिवारिक अभिलेख · क्लाउड डेटाबेस',
                  )}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <div className="inline-flex items-center p-0.5 bg-[#E6DDD0] rounded-md">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  language === 'en' ? 'bg-white text-[#191614] shadow-xs' : 'text-[#5C554E] hover:text-[#191614]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  language === 'hi' ? 'bg-white text-[#191614] shadow-xs' : 'text-[#5C554E] hover:text-[#191614]'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {user && (
              <button
                type="button"
                onClick={signOutUser}
                className="inline-flex items-center gap-1 text-xs text-[#5C554E] hover:text-[#6E182B] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('Sign Out', 'लॉगआउट')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Heritage Footer */}
      <footer className="border-t border-[#E2D9C8] bg-[#F2ECE1] text-[#191614] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src={HERITAGE_ASSETS.FAMILY_CREST}
                alt={t('Kerapa Family Crest', 'केरापा परिवार प्रतीक चिह्न')}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg object-cover border border-[#D8CBB0]"
              />
              <div>
                <p className="font-serif text-xl font-bold text-[#6E182B]">
                  {t('Kerapa Family – Parbatsar', 'केरापा परिवार – परबतसर')}
                </p>
                <p className="text-xs text-[#5C554E]">
                  {t('Our Roots, Our Identity, Our Legacy', 'हमारी जड़ें, हमारी पहचान, हमारी विरासत')}
                </p>
              </div>
            </div>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              {t(
                'A permanent digital family archive preserving verified Vanshavali, ancestral history, customs, and memories across generations.',
                'भावी पीढ़ियों के लिए केरापा परिवार की सत्यापित वंशावली, इतिहास, संस्कार और स्मृतियों का स्थायी डिजिटल संग्रह।',
              )}
            </p>
            <div className="pt-2 border-t border-[#E2D9C8] text-xs text-[#44403C] space-y-0.5">
              <p className="font-semibold text-[#6E182B]">
                {t('Family Residence · पारिवारिक निवास', 'पारिवारिक निवास')}
              </p>
              <p>
                {t(
                  'Near Petrol Pump, Ward No. 19, Tehsil: Parbatsar, District: Didwana-Kuchaman (Nagaur), Rajasthan',
                  'निवास: पेट्रोल पंप के पास, वार्ड नंबर 19, तहसील: परबतसर, जिला: डीडवाना-कुचामन (नागौर), राजस्थान',
                )}
              </p>
            </div>
          </div>

          <div
            className={`md:col-span-8 grid grid-cols-1 gap-8 ${
              archiveGroups.length > 3 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
            }`}
          >
            {archiveGroups.map((group) => (
              <div key={group.headingEn}>
                <p className="text-xs uppercase tracking-[0.15em] text-[#6E182B] font-semibold mb-3">
                  {t(group.headingEn, group.headingHi)}
                </p>
                <ul className="space-y-2 text-sm text-[#5C554E]">
                  {group.links.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="hover:text-[#6E182B] transition-colors inline-block py-0.5"
                      >
                        {t(item.labelEn, item.labelHi)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#E2D9C8] py-5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5C554E]">
            <span>
              © {new Date().getFullYear()} {t('Kerapa Family Digital Heritage Archive · Parbatsar, Rajasthan', 'केरापा परिवार डिजिटल विरासत अभिलेखागार · परबतसर, राजस्थान')}
            </span>
            <span>
              {t('Privacy-First · Consent-Based Media · Admin Verified', 'गोपनीयता सुरक्षित · सहमति आधारित मीडिया · एडमिन सत्यापित')}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
