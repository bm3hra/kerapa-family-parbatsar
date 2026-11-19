import React, { useMemo, useState } from 'react';
import { Edit3, Film, Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react';
import { useArchive } from '../../context/ArchiveContext';
import { MediaAlbum, MediaItem } from '../../types/archive';
import { compressImageToDataUrl } from '../../lib/mediaUtils';
import { HeritageImage } from '../HeritageImage';
import { VideoPlayer } from '../VideoPlayer';

interface AdminMediaManagerProps {
  defaultType?: 'photo' | 'video';
  onStatus: (msg: string) => void;
}

const ALBUMS: Array<{ key: MediaAlbum; labelEn: string; labelHi: string }> = [
  { key: 'ancestors', labelEn: 'Ancestors', labelHi: 'पूर्वज' },
  { key: 'weddings', labelEn: 'Weddings', labelHi: 'विवाह' },
  { key: 'festivals', labelEn: 'Festivals', labelHi: 'त्योहार' },
  { key: 'gatherings', labelEn: 'Gatherings', labelHi: 'पारिवारिक मिलन' },
  { key: 'childhood', labelEn: 'Childhood', labelHi: 'बचपन की यादें' },
  { key: 'documents', labelEn: 'Historical Documents', labelHi: 'ऐतिहासिक दस्तावेज़' },
  { key: 'functions', labelEn: 'Family Functions', labelHi: 'पारिवारिक समारोह' },
];

export function AdminMediaManager({ defaultType = 'photo', onStatus }: AdminMediaManagerProps) {
  const { t, media, saveMediaItem, deleteMediaItem } = useArchive();

  const [editingId, setEditingId] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>(defaultType);
  const [album, setAlbum] = useState<MediaAlbum>('gatherings');
  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [caption, setCaption] = useState('');
  const [captionHi, setCaptionHi] = useState('');
  const [url, setUrl] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'family'>('public');
  const [consentVerified, setConsentVerified] = useState(true);

  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video'>('all');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const filteredMedia = useMemo(() => {
    if (filterType === 'all') return media;
    return media.filter((m) => m.mediaType === filterType);
  }, [media, filterType]);

  const loadForEdit = (item: MediaItem) => {
    setEditingId(item.id);
    setMediaType(item.mediaType);
    setAlbum(item.album);
    setTitle(item.title);
    setTitleHi(item.titleHi || '');
    setCaption(item.caption || '');
    setCaptionHi(item.captionHi || '');
    setUrl(item.url);
    setDateLabel(item.dateLabel || '');
    setTags((item.taggedMemberNames || []).join(', '));
    setVisibility(item.visibility);
    setConsentVerified(item.consentVerified);
  };

  const resetForm = (nextType: 'photo' | 'video' = mediaType) => {
    setEditingId('');
    setMediaType(nextType);
    setTitle('');
    setTitleHi('');
    setCaption('');
    setCaptionHi('');
    setUrl('');
    setDateLabel('');
    setTags('');
    setVisibility('public');
    setConsentVerified(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImageToDataUrl(file, { maxDim: 1000, maxChars: 180_000 });
      setUrl(dataUrl);
      setMediaType('photo');
    } catch (err) {
      onStatus(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setBusy(true);
    try {
      await saveMediaItem({
        id: editingId || `${mediaType}_${Date.now()}`,
        mediaType,
        album,
        title: title.trim(),
        titleHi: titleHi.trim() || title.trim(),
        caption: caption.trim() || undefined,
        captionHi: captionHi.trim() || undefined,
        url: url.trim(),
        dateLabel: dateLabel.trim() || undefined,
        taggedMemberNames: tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        consentVerified,
        visibility,
        status: 'approved',
        isDemoData: false,
      });
      onStatus(
        mediaType === 'photo'
          ? t('Photograph published to Photo Gallery.', 'चित्र फोटो गैलरी में प्रकाशित हो गया।')
          : t('Video published to Video Gallery.', 'चलचित्र वीडियो गैलरी में प्रकाशित हो गया।'),
      );
      resetForm(mediaType);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : 'Could not save media item.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Add / Edit Image or Video Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-5 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-4 h-fit"
      >
        <div className="flex items-center justify-between border-b border-[#E2D9C8] pb-3">
          <h2 className="font-serif text-2xl font-bold text-[#191614]">
            {editingId
              ? t('Edit Image / Video', 'मीडिया संपादित करें')
              : t('Add New Image or Video', 'नया चित्र या वीडियो जोड़ें')}
          </h2>
          {editingId && (
            <button type="button" onClick={() => resetForm()} className="text-xs text-[#6E182B] underline">
              {t('+ New', '+ नया')}
            </button>
          )}
        </div>

        {/* Photo / Video Type Switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F2ECE1] rounded-lg">
          <button
            type="button"
            onClick={() => setMediaType('photo')}
            className={`inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${
              mediaType === 'photo' ? 'bg-[#6E182B] text-white' : 'text-[#5C554E] hover:text-[#191614]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{t('Add Image / Photo', 'चित्र जोड़ें')}</span>
          </button>
          <button
            type="button"
            onClick={() => setMediaType('video')}
            className={`inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${
              mediaType === 'video' ? 'bg-[#6E182B] text-white' : 'text-[#5C554E] hover:text-[#191614]'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>{t('Add Video', 'वीडियो जोड़ें')}</span>
          </button>
        </div>

        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('Title (English) *', 'शीर्षक (अंग्रेज़ी) *')}
          className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
        />
        <input
          value={titleHi}
          onChange={(e) => setTitleHi(e.target.value)}
          placeholder={t('Title (Hindi)', 'शीर्षक (हिन्दी)')}
          className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
        />

        <div className="grid grid-cols-2 gap-2.5">
          <select
            value={album}
            onChange={(e) => setAlbum(e.target.value as MediaAlbum)}
            className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          >
            {ALBUMS.map((al) => (
              <option key={al.key} value={al.key}>
                {t(al.labelEn, al.labelHi)}
              </option>
            ))}
          </select>
          <input
            value={dateLabel}
            onChange={(e) => setDateLabel(e.target.value)}
            placeholder={t('Year / Occasion', 'वर्ष / अवसर')}
            className="px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
        </div>

        {/* Media Source: File Upload for Photo or Video URL */}
        {mediaType === 'photo' ? (
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#6E182B] text-white text-xs font-medium rounded-lg cursor-pointer hover:bg-[#4F0F1E]">
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploading
                    ? t('Optimizing Photo…', 'चित्र तैयार हो रहा है…')
                    : t('Upload Photo from Device', 'डिवाइस से चित्र अपलोड करें')}
                </span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <span className="text-[11px] text-[#5C554E]">{t('or paste URL below', 'या नीचे URL पेस्ट करें')}</span>
            </div>
            <input
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('Image URL or Uploaded Photo *', 'चित्र URL या अपलोड किया चित्र *')}
              className="w-full px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
            />
            {url && (
              <div className="h-40 rounded-lg overflow-hidden border border-[#E2D9C8] bg-white">
                <HeritageImage src={url} alt={title || 'Preview'} className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-2.5">
            <label className="block text-xs font-medium text-[#6E182B]">
              {t(
                'Video Link (YouTube, YouTube Shorts, Vimeo, Google Drive, or MP4)',
                'वीडियो लिंक (YouTube, Vimeo, Google Drive या MP4)',
              )}
            </label>
            <input
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
            />
            {url.trim() && (
              <div className="aspect-video rounded-lg overflow-hidden border border-[#E2D9C8] bg-[#191614]">
                <VideoPlayer url={url.trim()} title={title || 'Video Preview'} />
              </div>
            )}
          </div>
        )}

        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder={t('Tagged Family Members (comma separated)', 'संबंधित सदस्य नाम (अल्पविराम से)')}
          className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <textarea
            rows={2}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t('Caption / Story (English)', 'विवरण (अंग्रेज़ी)')}
            className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <textarea
            rows={2}
            value={captionHi}
            onChange={(e) => setCaptionHi(e.target.value)}
            placeholder={t('Caption / Story (Hindi)', 'विवरण (हिन्दी)')}
            className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'public' | 'family')}
            className="px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          >
            <option value="public">{t('Public Gallery', 'सार्वजनिक गैलरी')}</option>
            <option value="family">{t('Family Members Only', 'केवल परिवार सदस्य')}</option>
          </select>
          <label className="inline-flex items-center gap-1.5 text-xs text-[#44403C]">
            <input
              type="checkbox"
              checked={consentVerified}
              onChange={(e) => setConsentVerified(e.target.checked)}
            />
            <span>{t('Consent Verified', 'सहमति सत्यापित')}</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={busy || uploading}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-[#6E182B] text-white text-sm font-medium rounded-lg hover:bg-[#4F0F1E] disabled:opacity-60"
        >
          <Plus className="w-4 h-4" />
          <span>
            {editingId
              ? t('Update Media Item', 'अद्यतन करें')
              : mediaType === 'photo'
                ? t('Publish Photo to Gallery', 'चित्र प्रकाशित करें')
                : t('Publish Video to Gallery', 'वीडियो प्रकाशित करें')}
          </span>
        </button>
      </form>

      {/* Existing Media Library */}
      <div className="lg:col-span-7 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-2xl font-bold text-[#191614]">
            {t(`Media Archive (${filteredMedia.length})`, `चित्र एवं चलचित्र संग्रह (${filteredMedia.length})`)}
          </h2>
          <div className="flex gap-1.5">
            {(['all', 'photo', 'video'] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setFilterType(kind)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border capitalize ${
                  filterType === kind
                    ? 'bg-[#6E182B] text-white border-[#6E182B]'
                    : 'bg-[#FAF7F2] border-[#D8CBB0] text-[#5C554E]'
                }`}
              >
                {kind === 'all'
                  ? t('All', 'सभी')
                  : kind === 'photo'
                    ? t('Photos', 'चित्र')
                    : t('Videos', 'वीडियो')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[680px] overflow-y-auto pr-1">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="border border-[#E2D9C8] rounded-xl overflow-hidden bg-[#FAF7F2] flex flex-col"
            >
              <div className="aspect-[16/10] bg-[#191614] overflow-hidden relative">
                {item.mediaType === 'photo' ? (
                  <HeritageImage
                    src={item.url}
                    alt={t(item.title, item.titleHi)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <VideoPlayer url={item.url} title={t(item.title, item.titleHi)} />
                )}
              </div>
              <div className="p-3.5 flex items-start justify-between gap-2 bg-white flex-1">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-[#A67C2E] font-semibold">
                    {item.mediaType} · {item.album}
                  </p>
                  <p className="font-semibold text-sm text-[#191614] truncate">
                    {t(item.title, item.titleHi)}
                  </p>
                  {item.dateLabel && <p className="text-xs text-[#5C554E]">{item.dateLabel}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => loadForEdit(item)}
                    className="p-1.5 rounded border border-[#D8CBB0] hover:bg-[#F2ECE1]"
                    title={t('Edit', 'संपादित करें')}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {!item.createdBy.startsWith('demo') && (
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteMediaItem(item.id);
                        onStatus(t('Media item removed.', 'मीडिया हटाया गया।'));
                        if (editingId === item.id) resetForm();
                      }}
                      className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50"
                      title={t('Delete', 'हटाएं')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
