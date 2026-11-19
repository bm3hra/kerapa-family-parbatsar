import { Link } from 'react-router-dom';
import { BookOpen, Edit3, Landmark, MapPin, ShieldAlert, Sparkles } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { HERITAGE_ASSETS } from '../data/assets';
import { HeritageImage } from '../components/HeritageImage';
import { PageHeader } from '../components/PageHeader';

export function AboutPage() {
  const { t, heritageContent, isAdmin } = useArchive();
  const data = heritageContent.about;

  return (
    <div>
      <PageHeader
        kickerEn="Archive Charter · About"
        kickerHi="अभिलेख परिचय"
        titleEn={data.title}
        titleHi={data.titleHi}
        subtitleEn={data.subtitle}
        subtitleHi={data.subtitleHi}
        isVerified={data.isVerified}
        actions={
          isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220]"
            >
              <Edit3 className="w-4 h-4" />
              <span>{t('Edit Section', 'संपादन करें')}</span>
            </Link>
          ) : undefined
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-base md:text-lg text-[#1C1917] leading-relaxed">
              {t(data.summary || '', data.summaryHi || '')}
            </p>
            <div className="border-t border-[#E5DEC9] pt-6 space-y-5">
              {(data.entries || []).map((entry) => (
                <div key={entry.id} className="space-y-1.5">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#B6862D] font-semibold">
                    {entry.era}
                  </p>
                  <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                    {t(entry.title, entry.titleHi)}
                  </h2>
                  <p className="text-sm md:text-base text-[#57534E] leading-relaxed">
                    {t(entry.body, entry.bodyHi)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#D8CBB0]">
              <HeritageImage
                src={HERITAGE_ASSETS.ARCHIVE_PORTRAIT}
                alt={t('Kerapa Family Heritage Ledger', 'केरापा परिवार विरासत बही')}
                fallbackTitle={t('Archival Ledger', 'पारिवारिक बही')}
              />
            </div>
            <p className="text-xs italic font-serif text-[#57534E]">
              {t(
                'Fig. 1 — Representative heritage ledger preserving intergenerational lineage and Parbatsar records.',
                'चित्र 1 — पीढ़ियों की वंशावली और परबतसर अभिलेखों का प्रतीक पारिवारिक दस्तावेज़।',
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HistoryPage() {
  const { t, heritageContent, isAdmin } = useArchive();
  const data = heritageContent.history;

  return (
    <div>
      <PageHeader
        kickerEn="Chronicle · Parbatsar"
        kickerHi="ऐतिहासिक अभिलेख"
        titleEn={data.title}
        titleHi={data.titleHi}
        subtitleEn={data.subtitle}
        subtitleHi={data.subtitleHi}
        isDemo={data.isDemoData}
        isVerified={data.isVerified}
        actions={
          isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220]"
            >
              <Edit3 className="w-4 h-4" />
              <span>{t('Edit History Chapters', 'इतिहास संपादित करें')}</span>
            </Link>
          ) : undefined
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {!data.isVerified && (
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-5 flex items-start gap-3 text-sm text-[#78350F]">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-[#B6862D]" />
            <p className="leading-relaxed">
              {t(
                'Historical Integrity Notice: Entries marked as placeholders have not been fabricated. Administrators can update each chapter below once elders verify dates, documents, and ancestral events.',
                'ऐतिहासिक सत्यनिष्ठा सूचना: नीचे दिए गए प्रारूप काल्पनिक नहीं हैं। परिवार के वरिष्ठजनों द्वारा तिथियां और दस्तावेज़ सत्यापित करने के बाद एडमिन पैनल से इन्हें अद्यतन किया जा सकता है।',
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <p className="text-base md:text-lg text-[#1C1917] leading-relaxed border-b border-[#E5DEC9] pb-6">
              {t(data.summary || '', data.summaryHi || '')}
            </p>

            <div className="space-y-8">
              {(data.entries || []).map((entry) => (
                <article
                  key={entry.id}
                  className="bg-white border border-[#E5DEC9] rounded-xl p-6 md:p-8 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534E]">
                    <span className="uppercase tracking-[0.14em] text-[#B6862D] font-semibold">
                      {entry.era}
                    </span>
                    <span className={entry.verified ? 'text-[#1B4332] font-medium' : 'text-[#854D0E]'}>
                      {entry.verified
                        ? t('Verified Record', 'सत्यापित अभिलेख')
                        : t('Editable Placeholder', 'संपादन योग्य प्रारूप')}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#1C1917]">
                    {t(entry.title, entry.titleHi)}
                  </h2>
                  <p className="text-base text-[#44403C] leading-relaxed">
                    {t(entry.body, entry.bodyHi)}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E5DEC9] rounded-xl overflow-hidden">
              <div className="aspect-[4/3]">
                <HeritageImage
                  src={HERITAGE_ASSETS.ARCHIVE_PORTRAIT}
                  alt={t('Historical Archive', 'ऐतिहासिक संग्रह')}
                  fallbackTitle={t('Family Documents', 'पारिवारिक दस्तावेज़')}
                />
              </div>
              <div className="p-5 space-y-2">
                <p className="text-xs uppercase tracking-[0.14em] text-[#6B1D2F] font-semibold">
                  {t('Contribute Records', 'दस्तावेज़ जोड़ें')}
                </p>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  {t(
                    'Have old Bahi entries, copperplates, land records, or ancestral photographs from Parbatsar? Share them securely with the archive team.',
                    'क्या आपके पास परबतसर की पुरानी बही, ताम्रपत्र, दस्तावेज़ या प्राचीन छायाचित्र हैं? कृपया अभिलेख टीम के साथ साझा करें।',
                  )}
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B1D2F] hover:underline pt-1"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t('Submit Historical Reference', 'संदर्भ भेजें')}</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function GotraPage() {
  const { t, heritageContent, isAdmin } = useArchive();
  const data = heritageContent.gotra;

  return (
    <div>
      <PageHeader
        kickerEn="Sacred Identity · Traditions"
        kickerHi="गोत्र एवं पारिवारिक संस्कार"
        titleEn={data.title}
        titleHi={data.titleHi}
        subtitleEn={data.subtitle}
        subtitleHi={data.subtitleHi}
        isDemo={data.isDemoData}
        isVerified={data.isVerified}
        actions={
          isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220]"
            >
              <Edit3 className="w-4 h-4" />
              <span>{t('Update Gotra & Deities', 'गोत्र व कुलदेवी संपादित करें')}</span>
            </Link>
          ) : undefined
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div className="bg-white border border-[#E5DEC9] rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#6B1D2F] font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-[#B6862D]" />
            <span>{t('Ancestral Identity Ledger', 'पैतृक पहचान विवरण')}</span>
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-[#E5DEC9] pt-6">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[#57534E]">
                {t('Family Gotra', 'पारिवारिक गोत्र')}
              </dt>
              <dd className="font-serif text-xl font-semibold text-[#1C1917] mt-1">
                {data.gotraName || t('Pending Elder Verification', 'वरिष्ठजनों द्वारा पुष्टि शेष')}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[#57534E]">
                {t('Kuldevta', 'कुलदेवता')}
              </dt>
              <dd className="font-serif text-xl font-semibold text-[#1C1917] mt-1">
                {data.kuldevtaName || t('Pending Verification', 'सत्यापन शेष')}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[#57534E]">
                {t('Kuldevi', 'कुलदेवी')}
              </dt>
              <dd className="font-serif text-xl font-semibold text-[#1C1917] mt-1">
                {data.kuldeviName || t('Pending Verification', 'सत्यापन शेष')}
              </dd>
            </div>
          </dl>

          <p className="mt-6 pt-5 border-t border-[#E5DEC9] text-sm text-[#57534E] leading-relaxed">
            {t(data.summary || '', data.summaryHi || '')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data.entries || []).map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-[#E5DEC9] rounded-xl p-6 space-y-2.5"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-[#B6862D] font-semibold">
                {entry.era}
              </p>
              <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                {t(entry.title, entry.titleHi)}
              </h2>
              <p className="text-sm text-[#57534E] leading-relaxed">
                {t(entry.body, entry.bodyHi)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ParbatsarPage() {
  const { t, heritageContent, members, isAdmin } = useArchive();
  const data = heritageContent.parbatsar;
  const parbatsarMembers = members.filter(
    (m) =>
      m.nativeVillage.toLowerCase().includes('parbatsar') ||
      (m.city || '').toLowerCase().includes('parbatsar'),
  );

  return (
    <div>
      <PageHeader
        kickerEn="Ancestral Place · Rajasthan"
        kickerHi="हमारा पैतृक नगर"
        titleEn={data.title}
        titleHi={data.titleHi}
        subtitleEn={data.subtitle}
        subtitleHi={data.subtitleHi}
        isVerified={data.isVerified}
        actions={
          isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220]"
            >
              <Edit3 className="w-4 h-4" />
              <span>{t('Edit Parbatsar Guide', 'संपादन करें')}</span>
            </Link>
          ) : undefined
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-6">
            <div className="aspect-[4/3] lg:h-full rounded-xl overflow-hidden border border-[#D8CBB0]">
              <HeritageImage
                src={HERITAGE_ASSETS.PARBATSAR_VISTA}
                alt={t('Parbatsar town sandstone architecture and stepwell', 'परबतसर का ऐतिहासिक स्थापत्य और बावड़ी')}
                fallbackTitle={t('Parbatsar, Rajasthan', 'परबतसर, राजस्थान')}
              />
            </div>
          </div>
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#1B4332] font-semibold">
              <Landmark className="w-4 h-4" />
              <span>{t('Origin & Heritage Anchor', 'मूल स्थान एवं सांस्कृतिक केंद्र')}</span>
            </div>
            <p className="text-base md:text-lg text-[#1C1917] leading-relaxed">
              {t(data.summary || '', data.summaryHi || '')}
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5DEC9]">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#57534E]">
                  {t('Rooted Members', 'परबतसर मूल सदस्य')}
                </p>
                <p className="font-serif text-3xl font-bold text-[#6B1D2F] tabular-nums mt-1">
                  {parbatsarMembers.length}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#57534E]">
                  {t('Region', 'क्षेत्र')}
                </p>
                <p className="font-serif text-xl font-semibold text-[#1C1917] mt-1">
                  {t('Didwana-Kuchaman / Nagaur Belt', 'डीडवाना-कुचामन / नागौर अंचल')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Parbatsar Family Residence Ledger */}
        <div className="bg-white border border-[#D8CBB0] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#6E182B] font-semibold mb-4">
            <MapPin className="w-4 h-4" />
            <span>{t('Verified Family Residence · Parbatsar', 'केरापा परिवार का सत्यापित निवास')}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#E5DEC9]">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#57534E]">
                {t('Residence (निवास)', 'निवास')}
              </p>
              <p className="font-serif text-xl font-semibold text-[#1C1917] mt-1">
                {t('Near Petrol Pump, Ward No. 19', 'पेट्रोल पंप के पास, वार्ड नंबर 19')}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#57534E]">
                {t('Tehsil (तहसील)', 'तहसील')}
              </p>
              <p className="font-serif text-xl font-semibold text-[#1C1917] mt-1">
                {t('Parbatsar', 'परबतसर')}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#57534E]">
                {t('District & State (जिला)', 'जिला एवं राज्य')}
              </p>
              <p className="font-serif text-xl font-semibold text-[#1C1917] mt-1">
                {t('Didwana-Kuchaman (Nagaur), Raj.', 'डीडवाना-कुचामन (नागौर), राजस्थान')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data.entries || []).map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-[#E5DEC9] rounded-xl p-6 space-y-2.5"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-[#B6862D] font-semibold">
                {entry.era}
              </p>
              <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                {t(entry.title, entry.titleHi)}
              </h2>
              <p className="text-sm text-[#57534E] leading-relaxed">
                {t(entry.body, entry.bodyHi)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
