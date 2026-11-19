import React, { useState } from 'react';
import { Calendar, Edit3, Heart, Plus, Trash2 } from 'lucide-react';
import { useArchive } from '../../context/ArchiveContext';
import { EventCategory, FamilyEvent, TributeItem } from '../../types/archive';

interface AdminCommunityManagerProps {
  onStatus: (msg: string) => void;
}

const EVENT_CATEGORIES: Array<{ key: EventCategory; en: string; hi: string }> = [
  { key: 'upcoming', en: 'Upcoming Event', hi: 'आगामी कार्यक्रम' },
  { key: 'reunion', en: 'Family Reunion', hi: 'पारिवारिक मिलन' },
  { key: 'wedding', en: 'Wedding', hi: 'विवाह' },
  { key: 'birthday', en: 'Birthday', hi: 'जन्मदिन' },
  { key: 'anniversary', en: 'Anniversary', hi: 'वर्षगांठ' },
  { key: 'ceremony', en: 'Religious Ceremony', hi: 'धार्मिक संस्कार' },
  { key: 'condolence', en: 'Remembrance / Condolence', hi: 'श्रद्धांजलि / शोक संदेश' },
];

export function AdminCommunityManager({ onStatus }: AdminCommunityManagerProps) {
  const {
    t,
    events,
    tributes,
    saveEventItem,
    deleteEventItem,
    saveTributeItem,
    deleteTributeItem,
  } = useArchive();

  // Event form state
  const [eId, setEId] = useState('');
  const [eCategory, setECategory] = useState<EventCategory>('upcoming');
  const [eTitle, setETitle] = useState('');
  const [eTitleHi, setETitleHi] = useState('');
  const [eDate, setEDate] = useState('');
  const [eLocation, setELocation] = useState('Parbatsar, Rajasthan');
  const [eDesc, setEDesc] = useState('');
  const [eDescHi, setEDescHi] = useState('');
  const [eVisibility, setEVisibility] = useState<'public' | 'family'>('public');

  // Tribute form state
  const [trId, setTrId] = useState('');
  const [trHonoree, setTrHonoree] = useState('');
  const [trHonoreeHi, setTrHonoreeHi] = useState('');
  const [trYears, setTrYears] = useState('');
  const [trAuthor, setTrAuthor] = useState('');
  const [trRelation, setTrRelation] = useState('');
  const [trMsg, setTrMsg] = useState('');
  const [trMsgHi, setTrMsgHi] = useState('');

  const [busy, setBusy] = useState(false);

  const loadEvent = (ev: FamilyEvent) => {
    setEId(ev.id);
    setECategory(ev.category);
    setETitle(ev.title);
    setETitleHi(ev.titleHi || '');
    setEDate(ev.eventDate);
    setELocation(ev.location || '');
    setEDesc(ev.description || '');
    setEDescHi(ev.descriptionHi || '');
    setEVisibility(ev.visibility);
  };

  const resetEvent = () => {
    setEId('');
    setECategory('upcoming');
    setETitle('');
    setETitleHi('');
    setEDate('');
    setELocation('Parbatsar, Rajasthan');
    setEDesc('');
    setEDescHi('');
    setEVisibility('public');
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eTitle.trim() || !eDate.trim()) return;
    setBusy(true);
    try {
      await saveEventItem({
        id: eId || `evt_${Date.now()}`,
        category: eCategory,
        title: eTitle.trim(),
        titleHi: eTitleHi.trim() || eTitle.trim(),
        eventDate: eDate.trim(),
        location: eLocation.trim() || undefined,
        description: eDesc.trim() || undefined,
        descriptionHi: eDescHi.trim() || undefined,
        visibility: eVisibility,
        status: 'approved',
        isDemoData: false,
      });
      onStatus(t('Family event saved and published.', 'पारिवारिक कार्यक्रम प्रकाशित हो गया।'));
      resetEvent();
    } finally {
      setBusy(false);
    }
  };

  const loadTribute = (tr: TributeItem) => {
    setTrId(tr.id);
    setTrHonoree(tr.honoreeName);
    setTrHonoreeHi(tr.honoreeNameHi || '');
    setTrYears(tr.yearsLabel || '');
    setTrAuthor(tr.authorName);
    setTrRelation(tr.relationship || '');
    setTrMsg(tr.message);
    setTrMsgHi(tr.messageHi || '');
  };

  const resetTribute = () => {
    setTrId('');
    setTrHonoree('');
    setTrHonoreeHi('');
    setTrYears('');
    setTrAuthor('');
    setTrRelation('');
    setTrMsg('');
    setTrMsgHi('');
  };

  const handleSaveTribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trHonoree.trim() || !trAuthor.trim() || !trMsg.trim()) return;
    setBusy(true);
    try {
      await saveTributeItem({
        id: trId || `trib_${Date.now()}`,
        honoreeName: trHonoree.trim(),
        honoreeNameHi: trHonoreeHi.trim() || trHonoree.trim(),
        yearsLabel: trYears.trim() || undefined,
        authorName: trAuthor.trim(),
        relationship: trRelation.trim() || undefined,
        message: trMsg.trim(),
        messageHi: trMsgHi.trim() || undefined,
        status: 'approved',
        isDemoData: false,
      });
      onStatus(t('Remembrance tribute saved and published.', 'श्रद्धांजलि संदेश सुरक्षित और प्रकाशित हो गया।'));
      resetTribute();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Family Events Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form
          onSubmit={handleSaveEvent}
          className="lg:col-span-5 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-3.5 h-fit"
        >
          <div className="flex items-center justify-between border-b border-[#E2D9C8] pb-3">
            <h2 className="font-serif text-xl font-bold text-[#191614] inline-flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#6E182B]" />
              <span>{eId ? t('Edit Family Event', 'कार्यक्रम संपादित करें') : t('Add Family Event', 'नया कार्यक्रम जोड़ें')}</span>
            </h2>
            {eId && (
              <button type="button" onClick={resetEvent} className="text-xs text-[#6E182B] underline">
                {t('+ New', '+ नया')}
              </button>
            )}
          </div>
          <select
            value={eCategory}
            onChange={(e) => setECategory(e.target.value as EventCategory)}
            className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {t(c.en, c.hi)}
              </option>
            ))}
          </select>
          <input
            required
            value={eTitle}
            onChange={(e) => setETitle(e.target.value)}
            placeholder={t('Event Title (English) *', 'कार्यक्रम शीर्षक (अंग्रेज़ी) *')}
            className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <input
            value={eTitleHi}
            onChange={(e) => setETitleHi(e.target.value)}
            placeholder={t('Event Title (Hindi)', 'कार्यक्रम शीर्षक (हिन्दी)')}
            className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              value={eDate}
              onChange={(e) => setEDate(e.target.value)}
              placeholder={t('Date (e.g. 2026-11-12) *', 'तिथि *')}
              className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
            />
            <input
              value={eLocation}
              onChange={(e) => setELocation(e.target.value)}
              placeholder={t('Location / City', 'स्थान / शहर')}
              className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
            />
          </div>
          <textarea
            rows={2}
            value={eDesc}
            onChange={(e) => setEDesc(e.target.value)}
            placeholder={t('Event Details (English)', 'विवरण (अंग्रेज़ी)')}
            className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <textarea
            rows={2}
            value={eDescHi}
            onChange={(e) => setEDescHi(e.target.value)}
            placeholder={t('Event Details (Hindi)', 'विवरण (हिन्दी)')}
            className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <select
            value={eVisibility}
            onChange={(e) => setEVisibility(e.target.value as 'public' | 'family')}
            className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          >
            <option value="public">{t('Public Announcement', 'सार्वजनिक सूचना')}</option>
            <option value="family">{t('Family Members Only', 'केवल परिवार सदस्य')}</option>
          </select>
          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-[#6E182B] text-white text-sm font-medium rounded-lg hover:bg-[#4F0F1E]"
          >
            <Plus className="w-4 h-4" />
            <span>{eId ? t('Update Event', 'अद्यतन करें') : t('Publish Event', 'कार्यक्रम प्रकाशित करें')}</span>
          </button>
        </form>

        <div className="lg:col-span-7 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-3">
          <h3 className="font-serif text-xl font-bold text-[#191614]">
            {t(`Published Events (${events.length})`, `पारिवारिक कार्यक्रम (${events.length})`)}
          </h3>
          <div className="divide-y divide-[#E2D9C8] max-h-[380px] overflow-y-auto">
            {events.map((ev) => (
              <div key={ev.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#A67C2E] uppercase font-semibold">
                    {ev.category} · {ev.eventDate}
                  </p>
                  <p className="font-medium text-sm text-[#191614] truncate">{t(ev.title, ev.titleHi)}</p>
                  {ev.location && <p className="text-xs text-[#5C554E]">{ev.location}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => loadEvent(ev)}
                    className="p-1.5 rounded border border-[#D8CBB0] hover:bg-[#F2ECE1]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {!ev.createdBy.startsWith('demo') && (
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteEventItem(ev.id);
                        onStatus(t('Event deleted.', 'कार्यक्रम हटाया गया।'));
                      }}
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

      {/* Tributes Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form
          onSubmit={handleSaveTribute}
          className="lg:col-span-5 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-3.5 h-fit"
        >
          <div className="flex items-center justify-between border-b border-[#E2D9C8] pb-3">
            <h2 className="font-serif text-xl font-bold text-[#191614] inline-flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#6E182B]" />
              <span>{trId ? t('Edit Tribute', 'श्रद्धांजलि संपादित करें') : t('Add Memory / Tribute', 'नई श्रद्धांजलि जोड़ें')}</span>
            </h2>
            {trId && (
              <button type="button" onClick={resetTribute} className="text-xs text-[#6E182B] underline">
                {t('+ New', '+ नया')}
              </button>
            )}
          </div>
          <input
            required
            value={trHonoree}
            onChange={(e) => setTrHonoree(e.target.value)}
            placeholder={t('Elder / Honoree Name (English) *', 'सम्मानित पूर्वज का नाम (अंग्रेज़ी) *')}
            className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <input
            value={trHonoreeHi}
            onChange={(e) => setTrHonoreeHi(e.target.value)}
            placeholder={t('Elder / Honoree Name (Hindi)', 'नाम (हिन्दी)')}
            className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={trYears}
              onChange={(e) => setTrYears(e.target.value)}
              placeholder={t('Years (e.g. In Loving Memory)', 'स्मृति अवधि')}
              className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
            />
            <input
              required
              value={trAuthor}
              onChange={(e) => setTrAuthor(e.target.value)}
              placeholder={t('Author Name *', 'लेखक का नाम *')}
              className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
            />
          </div>
          <input
            value={trRelation}
            onChange={(e) => setTrRelation(e.target.value)}
            placeholder={t('Relationship (e.g. Grandson, Kerapa Parivar)', 'संबंध')}
            className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <textarea
            required
            rows={3}
            value={trMsg}
            onChange={(e) => setTrMsg(e.target.value)}
            placeholder={t('Remembrance Message (English) *', 'श्रद्धांजलि संदेश (अंग्रेज़ी) *')}
            className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <textarea
            rows={3}
            value={trMsgHi}
            onChange={(e) => setTrMsgHi(e.target.value)}
            placeholder={t('Remembrance Message (Hindi)', 'श्रद्धांजलि संदेश (हिन्दी)')}
            className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-[#6E182B] text-white text-sm font-medium rounded-lg hover:bg-[#4F0F1E]"
          >
            <Plus className="w-4 h-4" />
            <span>{trId ? t('Update Tribute', 'अद्यतन करें') : t('Publish Tribute', 'श्रद्धांजलि प्रकाशित करें')}</span>
          </button>
        </form>

        <div className="lg:col-span-7 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-3">
          <h3 className="font-serif text-xl font-bold text-[#191614]">
            {t(`Published Tributes (${tributes.length})`, `प्रकाशित श्रद्धांजलियां (${tributes.length})`)}
          </h3>
          <div className="divide-y divide-[#E2D9C8] max-h-[380px] overflow-y-auto">
            {tributes.map((tr) => (
              <div key={tr.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-[#191614]">{t(tr.honoreeName, tr.honoreeNameHi)}</p>
                  <p className="text-xs text-[#5C554E] line-clamp-2">{t(tr.message, tr.messageHi || tr.message)}</p>
                  <p className="text-[11px] text-[#A67C2E] mt-0.5">— {tr.authorName}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => loadTribute(tr)}
                    className="p-1.5 rounded border border-[#D8CBB0] hover:bg-[#F2ECE1]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {!tr.createdBy.startsWith('demo') && (
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteTributeItem(tr.id);
                        onStatus(t('Tribute deleted.', 'श्रद्धांजलि हटाई गई।'));
                      }}
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
    </div>
  );
}
