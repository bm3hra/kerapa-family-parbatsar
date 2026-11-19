import React, { useMemo, useState } from 'react';
import { Calendar, Heart, Mail, MapPin, Plus, Send, X } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { EventCategory } from '../types/archive';
import { PageHeader } from '../components/PageHeader';

const EVENT_CATS: Array<{ key: EventCategory | 'all'; labelEn: string; labelHi: string }> = [
  { key: 'all', labelEn: 'All', labelHi: 'सभी' },
  { key: 'upcoming', labelEn: 'Upcoming', labelHi: 'आगामी' },
  { key: 'birthday', labelEn: 'Birthdays', labelHi: 'जन्मदिन' },
  { key: 'wedding', labelEn: 'Weddings', labelHi: 'विवाह' },
  { key: 'anniversary', labelEn: 'Anniversaries', labelHi: 'वर्षगाँठ' },
  { key: 'reunion', labelEn: 'Reunions', labelHi: 'पारिवारिक मिलन' },
  { key: 'ceremony', labelEn: 'Ceremonies', labelHi: 'धार्मिक अनुष्ठान' },
  { key: 'condolence', labelEn: 'Remembrance', labelHi: 'श्रद्धांजलि' },
];

export function EventsPage() {
  const { t, events, user, isAdmin, saveEventItem, signInWithGoogle } = useArchive();
  const [catFilter, setCatFilter] = useState<EventCategory | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);

  const [category, setCategory] = useState<EventCategory>('reunion');
  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('Parbatsar, Rajasthan');
  const [description, setDescription] = useState('');
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => {
    return events.filter((ev) => catFilter === 'all' || ev.category === catFilter);
  }, [events, catFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate.trim()) return;
    await saveEventItem({
      id: `evt_${Date.now()}`,
      category,
      title: title.trim(),
      titleHi: titleHi.trim() || title.trim(),
      eventDate: eventDate.trim(),
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      visibility: 'public',
      status: isAdmin ? 'approved' : 'pending',
      isDemoData: false,
    });
    setNotice(
      isAdmin
        ? t('Event published.', 'कार्यक्रम प्रकाशित किया गया।')
        : t('Event submitted for Admin approval.', 'कार्यक्रम एडमिन स्वीकृति के लिए भेजा गया।'),
    );
    setTitle('');
    setTitleHi('');
    setDescription('');
  };

  return (
    <div>
      <PageHeader
        kickerEn="Announcements · Calendar"
        kickerHi="पारिवारिक समाचार"
        titleEn="Family Events & Announcements"
        titleHi="पारिवारिक कार्यक्रम एवं सूचनाएँ"
        subtitleEn="Birthdays, weddings, anniversaries, reunions, religious ceremonies, and remembrance notices across all Kerapa branches."
        subtitleHi="जन्मदिन, शुभ विवाह, वर्षगाँठ, पारिवारिक मिलन, धार्मिक अनुष्ठान और श्रद्धांजलि सूचनाएँ।"
        isDemo={events.some((e) => e.isDemoData)}
        actions={
          user ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{t('Post Announcement', 'सूचना जोड़ें')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('Sign In to Post Event', 'सूचना हेतु लॉगिन करें')}</span>
            </button>
          )
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-wrap gap-2">
          {EVENT_CATS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCatFilter(c.key)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
                catFilter === c.key
                  ? 'bg-[#6B1D2F] text-white border-[#6B1D2F]'
                  : 'bg-white text-[#57534E] border-[#E5DEC9] hover:border-[#B6862D]'
              }`}
            >
              {t(c.labelEn, c.labelHi)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((ev) => (
            <article
              key={ev.id}
              className="bg-white border border-[#E5DEC9] rounded-xl p-6 space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
                <span className="font-semibold text-[#6B1D2F] uppercase tracking-[0.12em]">
                  {ev.category}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-medium text-[#1C1917]">{ev.eventDate}</span>
                {ev.location && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#B6862D]" />
                      {ev.location}
                    </span>
                  </>
                )}
                {ev.isDemoData && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#854D0E]">{t('DEMO DATA', 'नमूना डेटा')}</span>
                  </>
                )}
              </div>
              <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                {t(ev.title, ev.titleHi)}
              </h2>
              {(ev.description || ev.descriptionHi) && (
                <p className="text-sm text-[#57534E] leading-relaxed">
                  {t(ev.description || '', ev.descriptionHi || '')}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#FBF8F3] border border-[#E5DEC9] rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <h2 className="font-serif text-2xl font-bold">{t('Post Family Event', 'पारिवारिक सूचना जोड़ें')}</h2>
              <button type="button" onClick={() => setShowAdd(false)} className="p-1.5 border rounded-lg bg-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {notice && <p className="text-sm text-[#1B4332] bg-[#ECFDF5] p-3 rounded-lg">{notice}</p>}
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                >
                  {EVENT_CATS.filter((c) => c.key !== 'all').map((c) => (
                    <option key={c.key} value={c.key}>
                      {t(c.labelEn, c.labelHi)}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                />
              </div>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('Title (English) *', 'शीर्षक (अंग्रेज़ी) *')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              <input
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder={t('Title (Hindi)', 'शीर्षक (हिन्दी)')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('City / Venue', 'स्थान / शहर')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('Details', 'विवरण')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-[#57534E]">
                  {t('Close', 'बंद करें')}
                </button>
                <button type="submit" className="px-4 py-2 bg-[#6B1D2F] text-white text-sm rounded-lg">
                  {t('Submit', 'भेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function TributesPage() {
  const { t, tributes, user, isAdmin, saveTributeItem, signInWithGoogle } = useArchive();
  const [showAdd, setShowAdd] = useState(false);

  const [honoreeName, setHonoreeName] = useState('');
  const [honoreeNameHi, setHonoreeNameHi] = useState('');
  const [yearsLabel, setYearsLabel] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!honoreeName.trim() || !authorName.trim() || !message.trim()) return;
    await saveTributeItem({
      id: `trib_${Date.now()}`,
      honoreeName: honoreeName.trim(),
      honoreeNameHi: honoreeNameHi.trim() || honoreeName.trim(),
      yearsLabel: yearsLabel.trim() || undefined,
      authorName: authorName.trim(),
      relationship: relationship.trim() || undefined,
      message: message.trim(),
      status: isAdmin ? 'approved' : 'pending',
      isDemoData: false,
    });
    setNotice(
      isAdmin
        ? t('Tribute published.', 'श्रद्धांजलि प्रकाशित की गई।')
        : t('Tribute submitted for Admin approval.', 'श्रद्धांजलि एडमिन स्वीकृति के लिए भेजी गई।'),
    );
    setHonoreeName('');
    setMessage('');
  };

  return (
    <div>
      <PageHeader
        kickerEn="Remembrance · Ancestral Gratitude"
        kickerHi="स्मृतियां एवं श्रद्धांजलि"
        titleEn="Memories & Tributes"
        titleHi="पूर्वजों की स्मृतियां एवं श्रद्धांजलि"
        subtitleEn="Honoring the elders and ancestors whose wisdom, sacrifice, and values built the Kerapa heritage."
        subtitleHi="हमारे उन वरिष्ठजनों और पूर्वजों की पावन स्मृतियां, जिनके आदर्शों ने केरापा परिवार को संबल दिया।"
        isDemo={tributes.some((tr) => tr.isDemoData)}
        actions={
          user ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg"
            >
              <Heart className="w-4 h-4" />
              <span>{t('Write a Tribute', 'श्रद्धांजलि लिखें')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg"
            >
              <Heart className="w-4 h-4" />
              <span>{t('Sign In to Share Memory', 'स्मृति साझा करने हेतु लॉगिन करें')}</span>
            </button>
          )
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        {tributes.map((item) => (
          <article
            key={item.id}
            className="bg-white border border-[#E5DEC9] rounded-xl p-6 md:p-8 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DEC9] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  {t(item.honoreeName, item.honoreeNameHi)}
                </h2>
                {item.yearsLabel && (
                  <p className="text-xs text-[#B6862D] font-medium tabular-nums mt-0.5">
                    {item.yearsLabel}
                  </p>
                )}
              </div>
              {item.isDemoData && (
                <span className="text-xs text-[#854D0E]">{t('DEMO DATA', 'नमूना डेटा')}</span>
              )}
            </div>

            <blockquote className="font-serif italic text-lg md:text-xl text-[#292524] leading-relaxed">
              “{t(item.message, item.messageHi || item.message)}”
            </blockquote>

            <p className="text-xs text-[#57534E]">
              — {item.authorName}
              {item.relationship ? ` · ${item.relationship}` : ''}
            </p>
          </article>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#FBF8F3] border border-[#E5DEC9] rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <h2 className="font-serif text-2xl font-bold">{t('Share Tribute / Memory', 'स्मृति एवं श्रद्धांजलि')}</h2>
              <button type="button" onClick={() => setShowAdd(false)} className="p-1.5 border rounded-lg bg-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {notice && <p className="text-sm text-[#1B4332] bg-[#ECFDF5] p-3 rounded-lg">{notice}</p>}
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                required
                value={honoreeName}
                onChange={(e) => setHonoreeName(e.target.value)}
                placeholder={t('Honoree Full Name (English) *', 'स्मरण किए जाने वाले वरिष्ठ का नाम *')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              <input
                value={honoreeNameHi}
                onChange={(e) => setHonoreeNameHi(e.target.value)}
                placeholder={t('Honoree Name (Hindi)', 'नाम (हिन्दी)')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              <input
                value={yearsLabel}
                onChange={(e) => setYearsLabel(e.target.value)}
                placeholder={t('Life Years (e.g. 1924 – 2004)', 'जीवन काल (जैसे 1924 – 2004)')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={t('Your Name *', 'आपका नाम *')}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                />
                <input
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder={t('Relationship', 'संबंध')}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                />
              </div>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('Memory or tribute message *', 'स्मृति या श्रद्धांजलि संदेश *')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-[#57534E]">
                  {t('Close', 'बंद करें')}
                </button>
                <button type="submit" className="px-4 py-2 bg-[#6B1D2F] text-white text-sm rounded-lg">
                  {t('Submit Tribute', 'भेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function ContactPage() {
  const { t, user, submitContactInquiry, signInWithGoogle } = useArchive();
  const [senderName, setSenderName] = useState(user?.displayName || '');
  const [senderCity, setSenderCity] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await submitContactInquiry({
        senderName: senderName.trim(),
        senderCity: senderCity.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSent(true);
      setSubject('');
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader
        kickerEn="Archive Desk · Inquiries"
        kickerHi="संपर्क एवं योगदान"
        titleEn="Contact & Contribute Records"
        titleHi="संपर्क एवं पारिवारिक अभिलेख योगदान"
        subtitleEn="Reach out to the family archive stewards to verify lineage corrections, confirm gotra details, or contribute historical Parbatsar documents."
        subtitleHi="वंशावली संशोधन, गोत्र सत्यापन या ऐतिहासिक दस्तावेज़ साझा करने हेतु अभिलेख प्रबंधन से संपर्क करें।"
      />

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E5DEC9] rounded-xl p-6 space-y-3">
            <MapPin className="w-6 h-6 text-[#6B1D2F]" strokeWidth={1.6} />
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              {t('Family Residence', 'पारिवारिक निवास')}
            </h2>
            <dl className="space-y-2 text-sm text-[#44403C] pt-2 border-t border-[#E5DEC9]">
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-[#57534E]">
                  {t('Address / निवास', 'निवास')}
                </dt>
                <dd className="font-medium text-[#1C1917] mt-0.5">
                  {t('Near Petrol Pump, Ward No. 19', 'पेट्रोल पंप के पास, वार्ड नंबर 19')}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-[#57534E]">
                    {t('Tehsil / तहसील', 'तहसील')}
                  </dt>
                  <dd className="font-medium text-[#1C1917] mt-0.5">
                    {t('Parbatsar', 'परबतसर')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-[#57534E]">
                    {t('District / जिला', 'जिला')}
                  </dt>
                  <dd className="font-medium text-[#1C1917] mt-0.5">
                    {t('Didwana-Kuchaman (Nagaur), Rajasthan', 'डीडवाना-कुचामन (नागौर), राजस्थान')}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="bg-white border border-[#E5DEC9] rounded-xl p-6 space-y-4">
            <Mail className="w-6 h-6 text-[#6B1D2F]" strokeWidth={1.6} />
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              {t('How to Contribute', 'योगदान कैसे करें')}
            </h2>
            <ul className="space-y-3 text-sm text-[#57534E] leading-relaxed">
              <li>
                {t(
                  '1. Share verified names, parent-child links, and branch origins from elder interviews or family bahis.',
                  '1. वरिष्ठजनों या पारिवारिक बही से सत्यापित नाम और रिश्ते भेजें।',
                )}
              </li>
              <li>
                {t(
                  '2. Request privacy updates or consent removal for any photograph or profile.',
                  '2. किसी भी चित्र या विवरण की गोपनीयता में बदलाव हेतु अनुरोध करें।',
                )}
              </li>
              <li>
                {t(
                  '3. Confirm Gotra, Kuldevta, and Kuldevi details with elder consensus.',
                  '3. गोत्र, कुलदेवता और कुलदेवी की पुष्टि वरिष्ठजनों की सहमति से भेजें।',
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white border border-[#E5DEC9] rounded-xl p-6 md:p-8 space-y-5">
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              {t('Send a Private Archive Message', 'निजी संदेश भेजें')}
            </h2>

            {!user ? (
              <div className="bg-[#F4EFE6] border border-[#E5DEC9] rounded-xl p-6 space-y-4">
                <p className="text-sm text-[#44403C] leading-relaxed">
                  {t(
                    'To protect the family archive from automated spam and ensure authentic family communication, please sign in with Google before sending an inquiry.',
                    'अभिलेखागार को स्पैम से सुरक्षित रखने के लिए संदेश भेजने से पहले गूगल से साइन इन करें।',
                  )}
                </p>
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="px-5 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220]"
                >
                  {t('Sign In with Google', 'गूगल से साइन इन करें')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {sent && (
                  <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-sm text-[#1B4332]">
                    {t(
                      'Your message has been securely delivered to the Archive Administrators.',
                      'आपका संदेश सुरक्षित रूप से एडमिन को प्राप्त हो गया है।',
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1">
                      {t('Your Name *', 'आपका नाम *')}
                    </label>
                    <input
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FBF8F3] border border-[#D8CBB0] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1">
                      {t('Current City', 'वर्तमान शहर')}
                    </label>
                    <input
                      value={senderCity}
                      onChange={(e) => setSenderCity(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FBF8F3] border border-[#D8CBB0] rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t('Subject *', 'विषय *')}
                  </label>
                  <input
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t('e.g. Lineage verification / Gotra update', 'जैसे: वंशावली सत्यापन / गोत्र विवरण')}
                    className="w-full px-3 py-2 text-sm bg-[#FBF8F3] border border-[#D8CBB0] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">
                    {t('Message *', 'संदेश *')}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FBF8F3] border border-[#D8CBB0] rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220] disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? t('Sending...', 'भेजा जा रहा है...') : t('Send Inquiry', 'संदेश भेजें')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
