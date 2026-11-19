import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, ShieldCheck, Sparkles, TreePine, Users } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { HERITAGE_ASSETS } from '../data/assets';
import { HeritageImage } from '../components/HeritageImage';

export function HomePage() {
  const { t, members, branches, events, heritageContent } = useArchive();

  const verifiedCount = members.filter((m) => m.isVerified).length;
  const maxGeneration = members.reduce((acc, m) => Math.max(acc, m.generation), 0);
  const uniqueCities = new Set(members.map((m) => m.city).filter(Boolean)).size;

  const quickNavCards = [
    {
      to: '/tree',
      image: HERITAGE_ASSETS.FAMILY_CREST,
      kickerEn: 'Lineage',
      kickerHi: 'वंशावली',
      titleEn: 'Family Tree (Vanshavali)',
      titleHi: 'वंशावली – पीढ़ी दर पीढ़ी',
      descEn: 'Explore multi-generation roots, spouses, siblings, and branches interactively.',
      descHi: 'पीढ़ी दर पीढ़ी पूर्वजों, परिवार शाखाओं और पारिवारिक संबंधों का संवादात्मक वृक्ष।',
    },
    {
      to: '/history',
      image: HERITAGE_ASSETS.ARCHIVE_PORTRAIT,
      kickerEn: 'Chronicle',
      kickerHi: 'परिवार का इतिहास',
      titleEn: 'Family History & Documents',
      titleHi: 'पूर्वजों की स्मृतियां एवं इतिहास',
      descEn: 'Origins in Parbatsar, ancestral contributions, and historical family timelines.',
      descHi: 'केरापा परिवार का उद्भव, परबतसर से जुड़ाव और ऐतिहासिक समयरेखा।',
    },
    {
      to: '/members',
      image: HERITAGE_ASSETS.CELEBRATION_COURTYARD,
      kickerEn: 'Directory',
      kickerHi: 'परिवार के सदस्य',
      titleEn: 'Family Members & Branches',
      titleHi: 'सभी परिवार शाखाओं का परिचय',
      descEn: 'Searchable directory across generations and cities with privacy controls.',
      descHi: 'सभी पीढ़ियों और नगरों में बसे परिवार के सदस्यों का सुरक्षित परिचय संग्रह।',
    },
    {
      to: '/parbatsar',
      image: HERITAGE_ASSETS.PARBATSAR_VISTA,
      kickerEn: 'Ancestral Home',
      kickerHi: 'हमारा परबतसर',
      titleEn: 'Parbatsar – Our Ancestral Roots',
      titleHi: 'पैतृक स्थान – परबतसर',
      descEn: 'Nagaur district heritage, local temples, stepwells, and family anchorage.',
      descHi: 'परबतसर की पावन भूमि, ऐतिहासिक स्थापत्य और हमारी पैतृक जड़ें।',
    },
  ];

  return (
    <div>
      {/* 1. International Editorial Hero */}
      <section className="border-b border-[#E2D9C8] bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={HERITAGE_ASSETS.FAMILY_CREST}
                alt={t('Kerapa Family Crest', 'केरापा परिवार प्रतीक')}
                referrerPolicy="no-referrer"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-[#D8CBB0] shadow-xs shrink-0"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#A67C2E] font-semibold">
                  {t('Digital Family Heritage Archive', 'डिजिटल पारिवारिक विरासत अभिलेखागार')}
                </p>
                <p className="text-sm text-[#5C554E] mt-0.5">
                  {t(
                    'Near Petrol Pump, Ward No. 19 · Tehsil Parbatsar, Didwana-Kuchaman (Nagaur), Raj.',
                    'पेट्रोल पंप के पास, वार्ड नं. 19 · तहसील परबतसर, डीडवाना-कुचामन (नागौर), राज.',
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-4xl sm:text-5xl xl:text-[3.5rem] font-bold text-[#6E182B] tracking-tight leading-[1.06]">
                {t('KERAPA FAMILY – PARBATSAR', 'केरापा परिवार – परबतसर')}
              </h1>
              <p className="font-serif italic text-xl sm:text-2xl text-[#173F30]">
                {t(
                  '“Our Roots, Our Identity, Our Legacy”',
                  '“हमारी जड़ें, हमारी पहचान, हमारी विरासत”',
                )}
              </p>
            </div>

            <p className="text-base sm:text-[17px] text-[#44403C] leading-relaxed max-w-xl">
              {t(heritageContent.about.summary || '', heritageContent.about.summaryHi || '')}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pt-2">
              <Link
                to="/tree"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#6E182B] text-white text-sm font-medium rounded-lg hover:bg-[#4F0F1E] transition-colors whitespace-nowrap shrink-0"
              >
                <TreePine className="w-4 h-4" />
                <span>{t('Explore Family Tree', 'वंशावली देखें')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/gotra"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#F2ECE1] text-[#191614] border border-[#D8CBB0] text-sm font-medium rounded-lg hover:bg-[#EAE0CE] transition-colors whitespace-nowrap shrink-0"
              >
                <span>{t('Gotra & Identity', 'गोत्र एवं पहचान')}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[440px] rounded-2xl overflow-hidden border border-[#D8CBB0] shadow-sm">
              <HeritageImage
                src={HERITAGE_ASSETS.HERO_HAVELI}
                alt={t('Traditional sandstone haveli courtyard in Parbatsar, Rajasthan', 'परबतसर की पारंपरिक राजस्थानी बलुआ पत्थर हवेली')}
                fallbackTitle={t('Parbatsar Ancestral Haveli', 'परबतसर पैतृक हवेली')}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-[#D4AF6A] mb-1.5">
                  {t('Ancestral Heritage · Parbatsar', 'पैतृक विरासत · परबतसर')}
                </p>
                <p className="font-serif text-xl sm:text-2xl font-medium leading-snug max-w-lg">
                  {t(
                    'Preserving generational memory in sandstone, script, and living kinship.',
                    'पीढ़ियों की स्मृतियों, परंपरा और आत्मीय संबंधों का जीवंत संरक्षण।',
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Architectural Hairline KPI Ledger */}
      <section className="border-b border-[#E2D9C8] bg-[#F2ECE1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#D8CBB0]">
            <div className="py-6 pr-4 lg:px-6 lg:first:pl-0">
              <p className="text-xs uppercase tracking-[0.14em] text-[#5C554E]">
                {t('Generations Recorded', 'अभिलेखित पीढ़ियां')}
              </p>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-[#6E182B] tabular-nums mt-1">
                {maxGeneration}
              </p>
              <p className="text-xs text-[#5C554E] mt-1">
                {verifiedCount > 0
                  ? t('Verified family lineage', 'सत्यापित पारिवारिक वंशावली')
                  : t('Sample layout data', 'नमूना डेटा')}
              </p>
            </div>
            <div className="py-6 pl-4 lg:px-6">
              <p className="text-xs uppercase tracking-[0.14em] text-[#5C554E]">
                {t('Directory Profiles', 'सदस्य विवरण')}
              </p>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-[#191614] tabular-nums mt-1">
                {members.length}
              </p>
              <p className="text-xs text-[#5C554E] mt-1 tabular-nums">
                {t(`${verifiedCount} verified`, `${verifiedCount} सत्यापित`)}
              </p>
            </div>
            <div className="py-6 pr-4 lg:px-6">
              <p className="text-xs uppercase tracking-[0.14em] text-[#5C554E]">
                {t('Family Branches', 'परिवार शाखाएँ')}
              </p>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-[#173F30] tabular-nums mt-1">
                {branches.length}
              </p>
              <p className="text-xs text-[#5C554E] mt-1">
                {t('Rooted in Parbatsar', 'परबतसर से जुड़ी शाखाएँ')}
              </p>
            </div>
            <div className="py-6 pl-4 lg:px-6 lg:last:pr-0">
              <p className="text-xs uppercase tracking-[0.14em] text-[#5C554E]">
                {t('Cities Connected', 'जुड़े हुए नगर')}
              </p>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-[#A67C2E] tabular-nums mt-1">
                {uniqueCities}
              </p>
              <p className="text-xs text-[#5C554E] mt-1">
                {t('Parbatsar · Manpura · Makrana', 'परबतसर · मानपुरा · मकराना')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Royal Maroon Monograph Centerpiece: Shri Nunda Ram ji Kerapa (Neta Ji) & Lineage */}
      <section className="bg-[#350D17] text-[#FAF7F2] border-b border-[#4F0F1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col items-stretch max-w-lg mx-auto lg:mx-0 w-full">
            {/* Upper Portrait: Generation I Patriarch & Matriarch */}
            <div className="bg-[#4F0F1E]/85 border border-[#D4AF6A]/45 rounded-xl overflow-hidden hover:border-[#D4AF6A] transition-colors p-3 sm:p-3.5 shadow-sm space-y-2.5">
              <Link
                to="/members/kerapa_nunda_ram"
                className="group flex items-center gap-4 sm:gap-5"
              >
                <div className="w-24 sm:w-28 aspect-[3/4] rounded-lg overflow-hidden bg-[#260810] border border-[#D4AF6A]/30 shrink-0">
                  <HeritageImage
                    src={HERITAGE_ASSETS.NUNDA_RAM_PORTRAIT}
                    alt={t('Shri Nunda Ram ji Kerapa (Neta Ji)', 'श्री नुन्दा राम जी केरापा (नेता जी)')}
                    fallbackTitle="Shri Nunda Ram ji Kerapa"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="min-w-0 space-y-1 pr-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#D4AF6A] font-semibold">
                    {t('Generation I · Patriarch', 'प्रथम पीढ़ी · परिवार जनक')}
                  </p>
                  <p className="font-serif text-xl sm:text-2xl font-semibold text-white leading-snug">
                    {t('Shri Nunda Ram ji Kerapa', 'श्री नुन्दा राम जी केरापा')}
                  </p>
                  <p className="text-xs text-[#E8DFD3]/90">
                    {t('Neta Ji · Father of Kerapa Family, Parbatsar', 'नेता जी · केरापा परिवार जनक, परबतसर')}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#D4AF6A] pt-1 group-hover:underline">
                    <span>{t('View Profile', 'विवरण देखें')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
              <Link
                to="/members/kerapa_birji_devi"
                className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#D4AF6A]/25 text-xs hover:text-[#D4AF6A] transition-colors"
              >
                <div className="min-w-0">
                  <span className="text-[#D4AF6A] uppercase tracking-[0.12em] font-semibold mr-2">
                    {t('Spouse · धर्मपत्नी:', 'धर्मपत्नी:')}
                  </span>
                  <span className="font-serif text-sm sm:text-base text-white font-semibold">
                    {t('Mrs. Birji Devi', 'श्रीमती बिरजी देवी')}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF6A] shrink-0" />
              </Link>
            </div>

            {/* Vertical Lineage Connector */}
            <div className="flex items-center justify-center gap-3 py-1.5" aria-hidden="true">
              <div className="h-px flex-1 bg-[#D4AF6A]/25" />
              <div className="flex items-center gap-2">
                <div className="w-px h-4 bg-[#D4AF6A]/60" />
                <span className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]/85">
                  {t('Sons · सुपुत्र', 'सुपुत्र')}
                </span>
              </div>
              <div className="h-px flex-1 bg-[#D4AF6A]/25" />
            </div>

            {/* Lower Row: Elder Son (Left) & Second Son (Right) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Link
                to="/members/kerapa_jai_narayan"
                className="group bg-[#4F0F1E]/75 border border-[#D4AF6A]/40 rounded-xl overflow-hidden hover:border-[#D4AF6A] transition-colors flex flex-col"
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#260810]">
                  <HeritageImage
                    src={HERITAGE_ASSETS.JAI_NARAYAN_PORTRAIT}
                    alt={t('Shri Jai Narayan ji Kerapa', 'श्री जय नारायण जी केरापा')}
                    fallbackTitle="Shri Jai Narayan ji Kerapa"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-3 sm:p-3.5 space-y-1">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-[#D4AF6A] font-semibold">
                    {t('Elder Son', 'ज्येष्ठ सुपुत्र')}
                  </p>
                  <p className="font-serif text-base sm:text-lg font-semibold text-white leading-snug">
                    {t('Shri Jai Narayan ji Kerapa', 'श्री जय नारायण जी केरापा')}
                  </p>
                  <p className="text-[11px] text-[#E8DFD3]/90">
                    {t('SBI Retired Manager', 'सेवानिवृत्त SBI प्रबंधक')}
                  </p>
                </div>
              </Link>

              <Link
                to="/members/kerapa_dharam_narayan"
                className="group bg-[#4F0F1E]/75 border border-[#D4AF6A]/40 rounded-xl overflow-hidden hover:border-[#D4AF6A] transition-colors flex flex-col"
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#260810]">
                  <HeritageImage
                    src={HERITAGE_ASSETS.DHARAM_NARAYAN_PORTRAIT}
                    alt={t('Shri Dharam Narayan Kerapa', 'श्री धर्म नारायण केरापा')}
                    fallbackTitle="Shri Dharam Narayan Kerapa"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-3 sm:p-3.5 space-y-1">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-[#D4AF6A] font-semibold">
                    {t('Second Son', 'द्वितीय सुपुत्र')}
                  </p>
                  <p className="font-serif text-base sm:text-lg font-semibold text-white leading-snug">
                    {t('Shri Dharam Narayan Kerapa', 'श्री धर्म नारायण केरापा')}
                  </p>
                  <p className="text-[11px] text-[#E8DFD3]/90">
                    {t('Patrakar · Dainik Bhaskar', 'पत्रकार · दैनिक भास्कर')}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[#D4AF6A] font-semibold">
                {t('Verified Foundational Lineage · Parbatsar (Nagaur)', 'सत्यापित मूल वंशावली · परबतसर (नागौर)')}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white leading-tight">
                {t(
                  'Shri Nunda Ram ji Kerapa (Neta Ji) & Descendants',
                  'श्री नुन्दा राम जी केरापा (नेता जी) एवं परिवार',
                )}
              </h2>
              <p className="text-sm sm:text-base text-[#E8DFD3] leading-relaxed max-w-2xl">
                {t(
                  'Father of the Kerapa Family of Parbatsar, Rajasthan, guiding two sons and two daughters across Parbatsar, Manpura (Ajmer), and Makrana.',
                  'परबतसर (नागौर, राजस्थान) के केरापा परिवार के जनक, जिनके दो सुपुत्र एवं दो सुपुत्रियाँ परबतसर, मानपुरा (अजमेर) तथा मकराना परिवारों से जुड़े हैं।',
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/members/kerapa_jai_narayan"
                className="flex items-center gap-3.5 p-4 sm:p-5 rounded-xl bg-white/[0.06] border border-[#D4AF6A]/25 hover:border-[#D4AF6A] transition-colors"
              >
                <div className="w-14 h-[4.5rem] rounded-lg overflow-hidden bg-[#260810] border border-[#D4AF6A]/35 shrink-0">
                  <HeritageImage
                    src={HERITAGE_ASSETS.JAI_NARAYAN_PORTRAIT}
                    alt={t('Shri Jai Narayan ji Kerapa', 'श्री जय नारायण जी केरापा')}
                    fallbackTitle="Shri Jai Narayan ji Kerapa"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#D4AF6A] font-medium">
                    {t('Elder Son · S/O Shri Nunda Ram ji', 'ज्येष्ठ सुपुत्र · श्री नुन्दा राम जी केरापा')}
                  </p>
                  <p className="font-serif text-xl font-semibold text-white mt-0.5 leading-snug">
                    {t('Shri Jai Narayan ji Kerapa', 'श्री जय नारायण जी केरापा')}
                  </p>
                  <p className="text-xs text-[#E8DFD3]/90 mt-1">
                    {t('SBI Bank Retired Manager · Parbatsar', 'सेवानिवृत्त SBI प्रबंधक · परबतसर')}
                  </p>
                </div>
              </Link>

              <Link
                to="/members/kerapa_dharam_narayan"
                className="flex items-center gap-3.5 p-4 sm:p-5 rounded-xl bg-white/[0.06] border border-[#D4AF6A]/25 hover:border-[#D4AF6A] transition-colors"
              >
                <div className="w-14 h-[4.5rem] rounded-lg overflow-hidden bg-[#260810] border border-[#D4AF6A]/35 shrink-0">
                  <HeritageImage
                    src={HERITAGE_ASSETS.DHARAM_NARAYAN_PORTRAIT}
                    alt={t('Shri Dharam Narayan Kerapa', 'श्री धर्म नारायण केरापा')}
                    fallbackTitle="Shri Dharam Narayan Kerapa"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#D4AF6A] font-medium">
                    {t('Second Son · S/O Shri Nunda Ram ji', 'द्वितीय सुपुत्र · श्री नुन्दा राम जी केरापा')}
                  </p>
                  <p className="font-serif text-xl font-semibold text-white mt-0.5 leading-snug">
                    {t('Shri Dharam Narayan Kerapa', 'श्री धर्म नारायण केरापा')}
                  </p>
                  <p className="text-xs text-[#E8DFD3]/90 mt-1">
                    {t('Patrakar, Dainik Bhaskar · Parbatsar', 'पत्रकार, दैनिक भास्कर · परबतसर')}
                  </p>
                </div>
              </Link>

              <Link
                to="/members/kerapa_mangi_devi"
                className="p-4 sm:p-5 rounded-xl bg-white/[0.06] border border-[#D4AF6A]/25 hover:border-[#D4AF6A] transition-colors"
              >
                <p className="text-xs uppercase tracking-[0.12em] text-[#D4AF6A] font-medium">
                  {t('Daughter', 'सुपुत्री')}
                </p>
                <p className="font-serif text-xl font-semibold text-white mt-1">
                  {t('Mrs. Mangi Devi', 'श्रीमती मांगी देवी')}
                </p>
                <p className="text-xs text-[#E8DFD3]/90 mt-1">
                  {t(
                    'Married to Late Mr. Sunder Lal Ji Mehra · Manpura, Ajmer',
                    'विवाह: स्व. श्री सुंदर लाल जी मेहरा · मानपुरा, अजमेर',
                  )}
                </p>
              </Link>

              <Link
                to="/members/kerapa_meera_devi"
                className="p-4 sm:p-5 rounded-xl bg-white/[0.06] border border-[#D4AF6A]/25 hover:border-[#D4AF6A] transition-colors"
              >
                <p className="text-xs uppercase tracking-[0.12em] text-[#D4AF6A] font-medium">
                  {t('Daughter (In Remembrance)', 'सुपुत्री (स्मृतिशेष)')}
                </p>
                <p className="font-serif text-xl font-semibold text-white mt-1">
                  {t('Late Mrs. Meera Devi', 'स्व. श्रीमती मीरा देवी')}
                </p>
                <p className="text-xs text-[#E8DFD3]/90 mt-1">
                  {t(
                    'Married to Late Mr. Bhanwar Lal ji Tanan · Makrana, Nagaur',
                    'विवाह: स्व. श्री भंवर लाल जी तानान · मकराना, नागौर',
                  )}
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Curatorial 4-Pillar Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#A67C2E] font-semibold mb-2">
              {t('Archive Pillars', 'प्रमुख विभाग')}
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#191614]">
              {t('Explore the Kerapa Heritage Record', 'केरापा परिवार की विरासत देखें')}
            </h2>
          </div>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6E182B] hover:underline"
          >
            <MapPin className="w-4 h-4" />
            <span>{t('View Residence Map', 'निवास मानचित्र देखें')}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {quickNavCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group bg-white border border-[#E2D9C8] rounded-2xl overflow-hidden hover:border-[#A67C2E] transition-colors flex flex-col"
            >
              <div className="aspect-[16/10] sm:aspect-[4/3] relative overflow-hidden bg-[#F2ECE1]">
                <HeritageImage
                  src={card.image}
                  alt={t(card.titleEn, card.titleHi)}
                  fallbackTitle={t(card.titleEn, card.titleHi)}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#D4AF6A] mb-1">
                    {t(card.kickerEn, card.kickerHi)}
                  </p>
                  <h3 className="font-serif text-2xl sm:text-[1.7rem] font-semibold leading-snug">
                    {t(card.titleEn, card.titleHi)}
                  </h3>
                </div>
              </div>
              <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                <p className="text-sm text-[#5C554E] leading-relaxed">
                  {t(card.descEn, card.descHi)}
                </p>
                <ArrowRight className="w-5 h-5 text-[#6E182B] shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Family Bulletin & Heritage Timeline */}
      <section className="border-t border-[#E2D9C8] bg-[#F2ECE1]/55 py-14 lg:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#6E182B] font-semibold mb-1">
                  {t('Family Bulletin', 'पारिवारिक सूचनाएँ')}
                </p>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#191614]">
                  {t('Latest Updates & Events', 'नवीनतम कार्यक्रम एवं घोषणाएं')}
                </h2>
              </div>
              <Link to="/events" className="text-sm font-medium text-[#6E182B] hover:underline">
                {t('All Events', 'सभी कार्यक्रम')}
              </Link>
            </div>

            <div className="divide-y divide-[#E2D9C8] bg-white border border-[#E2D9C8] rounded-2xl">
              {events.slice(0, 4).map((ev) => (
                <div key={ev.id} className="p-5 sm:p-6 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C554E]">
                    <Calendar className="w-3.5 h-3.5 text-[#A67C2E]" />
                    <span className="tabular-nums font-medium text-[#191614]">{ev.eventDate}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{ev.category}</span>
                    {ev.location && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{ev.location}</span>
                      </>
                    )}
                    {ev.isDemoData && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#854D0E]">{t('DEMO DATA', 'नमूना डेटा')}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#191614]">
                    {t(ev.title, ev.titleHi)}
                  </h3>
                  {(ev.description || ev.descriptionHi) && (
                    <p className="text-sm text-[#5C554E] leading-relaxed">
                      {t(ev.description || '', ev.descriptionHi || '')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#173F30] font-semibold mb-1">
                  {t('Generational Chronicle', 'ऐतिहासिक समयरेखा')}
                </p>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#191614]">
                  {t('Family Heritage Timeline', 'परिवार की ऐतिहासिक यात्रा')}
                </h2>
              </div>
              <Link to="/history" className="text-sm font-medium text-[#6E182B] hover:underline">
                {t('Full History', 'पूर्ण इतिहास')}
              </Link>
            </div>

            <div className="bg-white border border-[#E2D9C8] rounded-2xl divide-y divide-[#E2D9C8]">
              {(heritageContent.history.entries || []).map((entry) => (
                <div key={entry.id} className="p-5 sm:p-6 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#5C554E]">
                    <span className="uppercase tracking-[0.12em] font-semibold text-[#A67C2E]">
                      {entry.era}
                    </span>
                    <span className={entry.verified ? 'text-[#173F30] font-medium' : 'text-[#854D0E]'}>
                      {entry.verified
                        ? t('Verified', 'सत्यापित')
                        : t('Editable Placeholder', 'संपादन योग्य प्रारूप')}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#191614]">
                    {t(entry.title, entry.titleHi)}
                  </h3>
                  <p className="text-sm text-[#5C554E] leading-relaxed">
                    {t(entry.body, entry.bodyHi)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Archival Stewardship Charter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6E182B] font-semibold mb-2">
            {t('Archival Stewardship', 'अभिलेख संरक्षण के नियम')}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#191614]">
            {t(
              'Three Commitments Guiding the Kerapa Record',
              'वेबसाइट संधारण के तीन महत्वपूर्ण सिद्धांत',
            )}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E2D9C8] rounded-2xl p-6 sm:p-7 space-y-3">
            <Users className="w-6 h-6 text-[#6E182B]" strokeWidth={1.6} />
            <h3 className="font-serif text-xl font-semibold">
              {t('01. Verify Lineage First', '01. वंशावली पहले सत्यापित करें')}
            </h3>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              {t(
                'Confirm names and parent-child connections from the earliest remembered ancestor before marking records verified.',
                'सबसे पुराने ज्ञात पूर्वज से वर्तमान पीढ़ी तक नाम और रिश्ते वरिष्ठजनों से सत्यापित करें।',
              )}
            </p>
          </div>
          <div className="bg-white border border-[#E2D9C8] rounded-2xl p-6 sm:p-7 space-y-3">
            <Sparkles className="w-6 h-6 text-[#A67C2E]" strokeWidth={1.6} />
            <h3 className="font-serif text-xl font-semibold">
              {t('02. Confirm Gotra & Kuldevi', '02. गोत्र व कुलदेवी की पुष्टि करें')}
            </h3>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              {t(
                'Never publish assumed gotra or deity records. Use editable placeholders until elders formally confirm.',
                'अनुमान से गोत्र या कुलदेवी का नाम न डालें; पुष्टि होने तक प्रारूप में रखें।',
              )}
            </p>
          </div>
          <div className="bg-white border border-[#E2D9C8] rounded-2xl p-6 sm:p-7 space-y-3">
            <ShieldCheck className="w-6 h-6 text-[#173F30]" strokeWidth={1.6} />
            <h3 className="font-serif text-xl font-semibold">
              {t('03. Protect Privacy & Consent', '03. गोपनीयता एवं सहमति बनाए रखें')}
            </h3>
            <p className="text-sm text-[#5C554E] leading-relaxed">
              {t(
                'Phone numbers, exact addresses, and children details remain private behind authenticated family access and admin approval.',
                'निजी फोन नंबर, घर का पता और बच्चों की जानकारी केवल अनुमति व लॉगिन के बाद सुरक्षित रहती है।',
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
