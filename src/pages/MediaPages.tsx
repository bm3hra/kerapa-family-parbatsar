import React, { useMemo, useState } from 'react';
import { Film, Image as ImageIcon, Plus, ShieldCheck, Upload, X } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { MediaAlbum, MediaItem } from '../types/archive';
import { HeritageImage } from '../components/HeritageImage';
import { PageHeader } from '../components/PageHeader';
import { VideoPlayer } from '../components/VideoPlayer';
import { compressImageToDataUrl } from '../lib/mediaUtils';

const ALBUMS: Array<{ key: MediaAlbum | 'all'; labelEn: string; labelHi: string }> = [
  { key: 'all', labelEn: 'All Albums', labelHi: 'सभी संग्रह' },
  { key: 'ancestors', labelEn: 'Ancestors', labelHi: 'पूर्वज' },
  { key: 'weddings', labelEn: 'Weddings', labelHi: 'विवाह' },
  { key: 'festivals', labelEn: 'Festivals', labelHi: 'त्योहार' },
  { key: 'gatherings', labelEn: 'Gatherings', labelHi: 'पारिवारिक मिलन' },
  { key: 'childhood', labelEn: 'Childhood', labelHi: 'बचपन की यादें' },
  { key: 'documents', labelEn: 'Historical Documents', labelHi: 'ऐतिहासिक दस्तावेज़' },
  { key: 'functions', labelEn: 'Family Functions', labelHi: 'पारिवारिक समारोह' },
];

export function PhotoGalleryPage() {
  const { t, media, user, isAdmin, saveMediaItem, signInWithGoogle } = useArchive();
  const [albumFilter, setAlbumFilter] = useState<MediaAlbum | 'all'>('all');
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [album, setAlbum] = useState<MediaAlbum>('gatherings');
  const [url, setUrl] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [consent, setConsent] = useState(true);
  const [notice, setNotice] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setNotice('');
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setUrl(dataUrl);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not process selected image.');
    } finally {
      setUploadingFile(false);
    }
  };

  const photos = useMemo(() => {
    return media.filter(
      (item) =>
        item.mediaType === 'photo' &&
        (albumFilter === 'all' || item.album === albumFilter),
    );
  }, [media, albumFilter]);

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !consent) return;
    await saveMediaItem({
      id: `photo_${Date.now()}`,
      mediaType: 'photo',
      album,
      title: title.trim(),
      titleHi: titleHi.trim() || title.trim(),
      caption: caption.trim() || undefined,
      url: url.trim(),
      dateLabel: dateLabel.trim() || undefined,
      taggedMemberNames: tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      consentVerified: consent,
      visibility: 'public',
      status: isAdmin ? 'approved' : 'pending',
      isDemoData: false,
    });
    setNotice(
      isAdmin
        ? t('Photograph added to gallery.', 'चित्र संग्रह में जोड़ा गया।')
        : t('Photograph submitted for Admin consent approval.', 'चित्र एडमिन स्वीकृति के लिए भेजा गया।'),
    );
    setTitle('');
    setTitleHi('');
    setUrl('');
    setCaption('');
  };

  return (
    <div>
      <PageHeader
        kickerEn="Visual Heritage · Albums"
        kickerHi="चित्र दीर्घा"
        titleEn="Family Photo Gallery"
        titleHi="केरापा परिवार चित्र संग्रह"
        subtitleEn="Curated albums of ancestors, weddings, festivals, gatherings, childhood memories, and historical documents — published strictly with consent."
        subtitleHi="पूर्वजों, विवाह, त्योहारों, पारिवारिक मिलन और ऐतिहासिक दस्तावेज़ों का सहमति-आधारित उच्च गुणवत्ता संग्रह।"
        isDemo={photos.some((p) => p.isDemoData)}
        actions={
          user ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220]"
            >
              <Plus className="w-4 h-4" />
              <span>{t('Add Photograph', 'चित्र जोड़ें')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg hover:bg-[#4E1220]"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{t('Sign In to Contribute Photo', 'चित्र जोड़ने हेतु लॉगिन करें')}</span>
            </button>
          )
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-wrap gap-2">
          {ALBUMS.map((al) => (
            <button
              key={al.key}
              type="button"
              onClick={() => setAlbumFilter(al.key)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
                albumFilter === al.key
                  ? 'bg-[#6B1D2F] text-white border-[#6B1D2F]'
                  : 'bg-white text-[#57534E] border-[#E5DEC9] hover:border-[#B6862D]'
              }`}
            >
              {t(al.labelEn, al.labelHi)}
            </button>
          ))}
        </div>

        {photos.length === 0 ? (
          <div className="bg-white border border-[#E5DEC9] rounded-xl p-12 text-center text-[#57534E]">
            {t('No photographs in this album yet.', 'इस श्रेणी में अभी कोई चित्र नहीं है।')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxItem(photo)}
                className="group text-left bg-white border border-[#E5DEC9] rounded-xl overflow-hidden hover:border-[#B6862D] transition-colors flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#F3ECE0]">
                  <HeritageImage
                    src={photo.url}
                    alt={t(photo.title, photo.titleHi)}
                    fallbackTitle={t(photo.title, photo.titleHi)}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="p-5 space-y-1.5">
                  <p className="text-xs text-[#B6862D] font-medium capitalize">
                    {photo.album}
                    {photo.dateLabel ? ` · ${photo.dateLabel}` : ''}
                    {photo.isDemoData ? ` · ${t('DEMO DATA', 'नमूना')}` : ''}
                  </p>
                  <h2 className="font-serif text-xl font-semibold text-[#1C1917]">
                    {t(photo.title, photo.titleHi)}
                  </h2>
                  {(photo.caption || photo.captionHi) && (
                    <p className="text-sm text-[#57534E] line-clamp-2">
                      {t(photo.caption || '', photo.captionHi || '')}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Viewer */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#FBF8F3] rounded-xl max-w-4xl w-full overflow-hidden border border-[#D8CBB0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DEC9]">
              <div>
                <p className="text-xs text-[#6B1D2F] font-semibold uppercase tracking-[0.14em]">
                  {lightboxItem.album} {lightboxItem.dateLabel ? `· ${lightboxItem.dateLabel}` : ''}
                </p>
                <h3 className="font-serif text-2xl font-bold text-[#1C1917]">
                  {t(lightboxItem.title, lightboxItem.titleHi)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="p-2 rounded-lg border border-[#E5DEC9] bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-[#1C1917] max-h-[62vh] flex items-center justify-center overflow-hidden">
              <HeritageImage
                src={lightboxItem.url}
                alt={t(lightboxItem.title, lightboxItem.titleHi)}
                className="max-h-[62vh] w-auto object-contain"
              />
            </div>
            <div className="p-6 space-y-2">
              <p className="text-sm text-[#44403C]">
                {t(lightboxItem.caption || '', lightboxItem.captionHi || '')}
              </p>
              {lightboxItem.taggedMemberNames && lightboxItem.taggedMemberNames.length > 0 && (
                <p className="text-xs text-[#57534E]">
                  {t('Tagged', 'संबंधित')}: {lightboxItem.taggedMemberNames.join(', ')}
                </p>
              )}
              <p className="text-xs text-[#1B4332] inline-flex items-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('Consent-verified publication', 'सहमति-सत्यापित प्रकाशन')}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#FBF8F3] border border-[#E5DEC9] rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <h2 className="font-serif text-2xl font-bold">{t('Submit Photograph', 'चित्र जोड़ें')}</h2>
              <button type="button" onClick={() => setShowAdd(false)} className="p-1.5 border rounded-lg bg-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {notice && <p className="text-sm text-[#1B4332] bg-[#ECFDF5] p-3 rounded-lg">{notice}</p>}
            <form onSubmit={handleAddPhoto} className="space-y-3">
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
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={album}
                  onChange={(e) => setAlbum(e.target.value as MediaAlbum)}
                  className="px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                >
                  {ALBUMS.filter((a) => a.key !== 'all').map((a) => (
                    <option key={a.key} value={a.key}>
                      {t(a.labelEn, a.labelHi)}
                    </option>
                  ))}
                </select>
                <input
                  value={dateLabel}
                  onChange={(e) => setDateLabel(e.target.value)}
                  placeholder={t('Year / Date (e.g. 1995)', 'वर्ष / तिथि')}
                  className="px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-[#F2ECE1] border border-[#D8CBB0] rounded-lg cursor-pointer hover:bg-[#EAE0CF] text-[#6E182B]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploadingFile
                        ? t('Optimizing image…', 'चित्र तैयार हो रहा है…')
                        : t('Upload Photo from Device', 'डिवाइस से चित्र अपलोड करें')}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-[#57534E]">
                    {t('or paste image link below', 'या नीचे चित्र URL पेस्ट करें')}
                  </span>
                </div>
                <input
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t('Image URL or Uploaded Photo *', 'चित्र URL या अपलोड किया गया चित्र *')}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
                />
                {url && (
                  <div className="h-32 rounded-lg overflow-hidden border border-[#E5DEC9] bg-[#F3ECE0]">
                    <HeritageImage src={url} alt={title || 'Preview'} className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t('Tagged members (comma separated)', 'सदस्य टैग (अल्पविराम से)')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t('Caption & context', 'विवरण')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              <label className="flex items-start gap-2 text-xs text-[#57534E]">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                <span>
                  {t(
                    'I confirm family consent has been obtained to preserve this photograph in the archive.',
                    'मैं पुष्टि करता/करती हूँ कि इस चित्र के प्रकाशन हेतु परिवार की सहमति प्राप्त है।',
                  )}
                </span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-[#57534E]">
                  {t('Close', 'बंद करें')}
                </button>
                <button type="submit" className="px-4 py-2 bg-[#6B1D2F] text-white text-sm rounded-lg">
                  {t('Submit Photo', 'भेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function VideoGalleryPage() {
  const { t, media, user, isAdmin, saveMediaItem, signInWithGoogle } = useArchive();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [notice, setNotice] = useState('');

  const videos = useMemo(() => media.filter((m) => m.mediaType === 'video'), [media]);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    await saveMediaItem({
      id: `video_${Date.now()}`,
      mediaType: 'video',
      album: 'functions',
      title: title.trim(),
      titleHi: titleHi.trim() || title.trim(),
      caption: caption.trim() || undefined,
      url: url.trim(),
      dateLabel: dateLabel.trim() || undefined,
      consentVerified: true,
      visibility: 'public',
      status: isAdmin ? 'approved' : 'pending',
      isDemoData: false,
    });
    setNotice(
      isAdmin
        ? t('Video added to gallery.', 'चलचित्र संग्रह में जोड़ा गया।')
        : t('Video submitted for Admin approval.', 'चलचित्र एडमिन स्वीकृति के लिए भेजा गया।'),
    );
    setTitle('');
    setUrl('');
    setCaption('');
  };

  return (
    <div>
      <PageHeader
        kickerEn="Oral & Visual Archive · Videos"
        kickerHi="चलचित्र संग्रह"
        titleEn="Family Video Gallery"
        titleHi="केरापा परिवार चलचित्र संग्रह"
        subtitleEn="Recorded elder oral histories, wedding celebrations, Parbatsar reunions, and ceremonial blessings."
        subtitleHi="वरिष्ठजनों के संस्मरण, पारिवारिक समारोह और परबतसर मिलन के चलचित्र अभिलेख।"
        actions={
          user ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{t('Add Video Archive', 'चलचित्र जोड़ें')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B1D2F] text-white text-sm font-medium rounded-lg"
            >
              <Film className="w-4 h-4" />
              <span>{t('Sign In to Submit Video', 'चलचित्र जोड़ने हेतु लॉगिन करें')}</span>
            </button>
          )
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {videos.length === 0 ? (
          <div className="bg-white border border-[#E5DEC9] rounded-xl p-12 text-center space-y-3">
            <Film className="w-10 h-10 text-[#B6862D] mx-auto" strokeWidth={1.5} />
            <h2 className="font-serif text-2xl font-semibold text-[#1C1917]">
              {t('Video Archive Ready for Family Recordings', 'चलचित्र संग्रह परिवार के वीडियो हेतु तैयार है')}
            </h2>
            <p className="text-sm text-[#57534E] max-w-lg mx-auto leading-relaxed">
              {t(
                'No placeholder videos are fabricated. Sign in as a family member or Admin to archive interviews with elders, wedding highlights, and Parbatsar gatherings.',
                'कोई काल्पनिक वीडियो नहीं जोड़ा गया है। वरिष्ठजनों के साक्षात्कार और पारिवारिक समारोह जोड़ने के लिए लॉगिन करें।',
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((v) => (
              <div key={v.id} className="bg-white border border-[#E5DEC9] rounded-xl overflow-hidden">
                <div className="aspect-video bg-[#1C1917] flex items-center justify-center">
                  <VideoPlayer url={v.url} title={t(v.title, v.titleHi)} />
                </div>
                <div className="p-5 space-y-1.5">
                  <p className="text-xs text-[#B6862D]">{v.dateLabel || v.album}</p>
                  <h3 className="font-serif text-xl font-semibold">{t(v.title, v.titleHi)}</h3>
                  {(v.caption || v.captionHi) && (
                    <p className="text-sm text-[#57534E]">{t(v.caption || '', v.captionHi || v.caption || '')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#FBF8F3] border border-[#E5DEC9] rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <h2 className="font-serif text-2xl font-bold">{t('Submit Video Link', 'चलचित्र जोड़ें')}</h2>
              <button type="button" onClick={() => setShowAdd(false)} className="p-1.5 border rounded-lg bg-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {notice && <p className="text-sm text-[#1B4332] bg-[#ECFDF5] p-3 rounded-lg">{notice}</p>}
            <form onSubmit={handleAddVideo} className="space-y-3">
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
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('YouTube, Vimeo, Google Drive, or Direct MP4 URL *', 'YouTube, Vimeo या MP4 वीडियो URL *')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              {url.trim() && (
                <div className="aspect-video rounded-lg overflow-hidden border border-[#E5DEC9] bg-[#1C1917]">
                  <VideoPlayer url={url.trim()} title={title || 'Video preview'} />
                </div>
              )}
              <input
                value={dateLabel}
                onChange={(e) => setDateLabel(e.target.value)}
                placeholder={t('Year / Occasion', 'वर्ष / अवसर')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t('Description', 'विवरण')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8CBB0] rounded-lg"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-[#57534E]">
                  {t('Close', 'बंद करें')}
                </button>
                <button type="submit" className="px-4 py-2 bg-[#6B1D2F] text-white text-sm rounded-lg">
                  {t('Submit Video', 'भेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
