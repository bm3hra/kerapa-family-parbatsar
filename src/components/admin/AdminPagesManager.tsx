import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Edit3,
  ExternalLink,
  FilePlus2,
  Film,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useArchive } from '../../context/ArchiveContext';
import { CustomPage, CustomPageNavGroup, CustomPageSection } from '../../types/archive';
import { compressImageToDataUrl, slugifyPageTitle } from '../../lib/mediaUtils';
import { HeritageImage } from '../HeritageImage';
import { VideoPlayer } from '../VideoPlayer';

interface AdminPagesManagerProps {
  initialEditPageId?: string;
  onStatus: (msg: string) => void;
}

export function AdminPagesManager({ initialEditPageId, onStatus }: AdminPagesManagerProps) {
  const { t, customPages, saveCustomPage, deleteCustomPage } = useArchive();

  const [editingId, setEditingId] = useState('');
  const [title, setTitle] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [kicker, setKicker] = useState('');
  const [kickerHi, setKickerHi] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subtitleHi, setSubtitleHi] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryHi, setSummaryHi] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [sections, setSections] = useState<CustomPageSection[]>([]);
  const [navGroup, setNavGroup] = useState<CustomPageNavGroup>('custom');
  const [showInNav, setShowInNav] = useState(true);
  const [order, setOrder] = useState(1);
  const [visibility, setVisibility] = useState<'public' | 'family'>('public');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  const [busy, setBusy] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const loadPageForEdit = (page: CustomPage) => {
    setEditingId(page.id);
    setTitle(page.title);
    setTitleHi(page.titleHi || '');
    setSlug(page.slug);
    setSlugTouched(true);
    setKicker(page.kicker || '');
    setKickerHi(page.kickerHi || '');
    setSubtitle(page.subtitle || '');
    setSubtitleHi(page.subtitleHi || '');
    setSummary(page.summary || '');
    setSummaryHi(page.summaryHi || '');
    setHeroImageUrl(page.heroImageUrl || '');
    setVideoUrl(page.videoUrl || '');
    setVideoTitle(page.videoTitle || '');
    setGalleryUrls(page.galleryUrls || []);
    setSections(page.sections || []);
    setNavGroup(page.navGroup || 'custom');
    setShowInNav(page.showInNav);
    setOrder(page.order || 1);
    setVisibility(page.visibility || 'public');
    setStatus(page.status || 'published');
  };

  useEffect(() => {
    if (!initialEditPageId) return;
    const found = customPages.find((p) => p.id === initialEditPageId);
    if (found) {
      loadPageForEdit(found);
    }
  }, [initialEditPageId, customPages]);

  const resetForm = () => {
    setEditingId('');
    setTitle('');
    setTitleHi('');
    setSlug('');
    setSlugTouched(false);
    setKicker('');
    setKickerHi('');
    setSubtitle('');
    setSubtitleHi('');
    setSummary('');
    setSummaryHi('');
    setHeroImageUrl('');
    setVideoUrl('');
    setVideoTitle('');
    setGalleryUrls([]);
    setNewGalleryUrl('');
    setSections([]);
    setNavGroup('custom');
    setShowInNav(true);
    setOrder(customPages.length + 1);
    setVisibility('public');
    setStatus('published');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugTouched && !editingId) {
      setSlug(slugifyPageTitle(val));
    }
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingKey('hero');
    try {
      const dataUrl = await compressImageToDataUrl(file, { maxDim: 1100, maxChars: 170_000 });
      setHeroImageUrl(dataUrl);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingKey(null);
      e.target.value = '';
    }
  };

  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (galleryUrls.length >= 8) {
      onStatus(t('Maximum 8 gallery photos per custom page.', 'एक पृष्ठ में अधिकतम 8 गैलरी चित्र जोड़े जा सकते हैं।'));
      return;
    }
    setUploadingKey('gallery');
    try {
      const dataUrl = await compressImageToDataUrl(file, { maxDim: 760, maxChars: 85_000 });
      setGalleryUrls((prev) => [...prev, dataUrl]);
    } catch (err) {
      onStatus(err instanceof Error ? err.message : 'Gallery image upload failed');
    } finally {
      setUploadingKey(null);
      e.target.value = '';
    }
  };

  const handleSectionFileUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingKey(`sec_${idx}`);
    try {
      const dataUrl = await compressImageToDataUrl(file, { maxDim: 760, maxChars: 85_000 });
      setSections((prev) =>
        prev.map((sec, i) => (i === idx ? { ...sec, imageUrl: dataUrl } : sec)),
      );
    } catch (err) {
      onStatus(err instanceof Error ? err.message : 'Section image upload failed');
    } finally {
      setUploadingKey(null);
      e.target.value = '';
    }
  };

  const addSection = () => {
    if (sections.length >= 15) return;
    setSections((prev) => [
      ...prev,
      {
        id: `sec_${Date.now()}_${prev.length + 1}`,
        heading: '',
        headingHi: '',
        body: '',
        bodyHi: '',
        imageUrl: '',
      },
    ]);
  };

  const updateSection = (idx: number, patch: Partial<CustomPageSection>) => {
    setSections((prev) => prev.map((sec, i) => (i === idx ? { ...sec, ...patch } : sec)));
  };

  const removeSection = (idx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const finalSlug = slugifyPageTitle(slug || title);
      const duplicate = customPages.find((p) => p.slug === finalSlug && p.id !== editingId);
      if (duplicate) {
        onStatus(
          t(
            `A page with URL "/page/${finalSlug}" already exists. Choose a different URL slug.`,
            `"/page/${finalSlug}" URL वाला पृष्ठ पहले से मौजूद है। कृपया दूसरा URL स्लग चुनें।`,
          ),
        );
        return;
      }

      await saveCustomPage({
        id: editingId || `page_${Date.now()}`,
        slug: finalSlug,
        title: title.trim(),
        titleHi: titleHi.trim() || title.trim(),
        kicker: kicker.trim(),
        kickerHi: kickerHi.trim(),
        subtitle: subtitle.trim(),
        subtitleHi: subtitleHi.trim(),
        summary: summary.trim(),
        summaryHi: summaryHi.trim(),
        heroImageUrl: heroImageUrl.trim(),
        videoUrl: videoUrl.trim(),
        videoTitle: videoTitle.trim(),
        galleryUrls: galleryUrls.filter(Boolean),
        sections: sections.filter((s) => s.heading.trim() || s.body.trim() || s.imageUrl?.trim()),
        navGroup,
        showInNav,
        order,
        visibility,
        status,
      });

      onStatus(
        editingId
          ? t(`Page "/page/${finalSlug}" updated successfully.`, `पृष्ठ "/page/${finalSlug}" सफलतापूर्वक अद्यतन हुआ।`)
          : t(`New page "/page/${finalSlug}" created and saved!`, `नया पृष्ठ "/page/${finalSlug}" बनकर सुरक्षित हो गया!`),
      );
      resetForm();
    } catch (err) {
      onStatus(err instanceof Error ? err.message : 'Could not save custom page.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Page Builder Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-7 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-5 h-fit"
      >
        <div className="flex items-center justify-between border-b border-[#E2D9C8] pb-3">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#191614]">
              {editingId ? t('Edit Custom Page', 'कस्टम पृष्ठ संपादित करें') : t('Create New Page', 'नया पृष्ठ बनाएं')}
            </h2>
            <p className="text-xs text-[#5C554E] mt-0.5">
              {t(
                'Publish bilingual heritage pages with cover photos, rich sections, photo galleries, and embedded videos.',
                'चित्र, वीडियो और हिंदी-अंग्रेज़ी अनुभागों के साथ नए पारिवारिक पृष्ठ प्रकाशित करें।',
              )}
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-medium text-[#6E182B] underline shrink-0"
            >
              {t('+ New Page', '+ नया पृष्ठ')}
            </button>
          )}
        </div>

        {/* Titles & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#5C554E] mb-1">
              {t('Page Title (English) *', 'पृष्ठ शीर्षक (अंग्रेज़ी) *')}
            </label>
            <input
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t('e.g. Parbatsar Reunion 2026', 'उदा. परबतसर पारिवारिक मिलन 2026')}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5C554E] mb-1">
              {t('Page Title (Hindi)', 'पृष्ठ शीर्षक (हिन्दी)')}
            </label>
            <input
              value={titleHi}
              onChange={(e) => setTitleHi(e.target.value)}
              placeholder={t('e.g. परबतसर पारिवारिक मिलन 2026', 'हिन्दी शीर्षक लिखें')}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#5C554E] mb-1">
              {t('Page URL Slug *', 'पृष्ठ URL स्लग *')}
            </label>
            <div className="flex items-center bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg overflow-hidden">
              <span className="px-2.5 py-2 text-xs text-[#5C554E] bg-[#F2ECE1] border-r border-[#D8CBB0]">
                /page/
              </span>
              <input
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                }}
                placeholder="parbatsar-reunion-2026"
                className="w-full px-2.5 py-2 text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5C554E] mb-1">
              {t('Navigation Section', 'मेनू विभाग')}
            </label>
            <select
              value={navGroup}
              onChange={(e) => setNavGroup(e.target.value as CustomPageNavGroup)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
            >
              <option value="custom">{t('Special Pages (Dedicated Column)', 'विशेष पृष्ठ (अलग विभाग)')}</option>
              <option value="lineage">{t('Lineage & Identity', 'वंशावली एवं पहचान')}</option>
              <option value="chronicle">{t('Chronicle & Geography', 'इतिहास एवं स्थान')}</option>
              <option value="memories">{t('Memories & Community', 'स्मृतियां एवं संवाद')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={kicker}
            onChange={(e) => setKicker(e.target.value)}
            placeholder={t('Section Label / Kicker (English)', 'उपक्षेत्र लेबल (अंग्रेज़ी)')}
            className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <input
            value={kickerHi}
            onChange={(e) => setKickerHi(e.target.value)}
            placeholder={t('Section Label / Kicker (Hindi)', 'उपक्षेत्र लेबल (हिन्दी)')}
            className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder={t('Short Subtitle (English)', 'उपशीर्षक (अंग्रेज़ी)')}
            className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
          <input
            value={subtitleHi}
            onChange={(e) => setSubtitleHi(e.target.value)}
            placeholder={t('Short Subtitle (Hindi)', 'उपशीर्षक (हिन्दी)')}
            className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
          />
        </div>

        {/* Hero Image Upload or URL */}
        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6E182B] inline-flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              {t('Cover / Hero Image', 'मुख्य कवर चित्र')}
            </span>
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D8CBB0] rounded-lg text-xs font-medium text-[#6E182B] cursor-pointer hover:bg-[#F2ECE1]">
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploadingKey === 'hero'
                    ? t('Optimizing…', 'प्रोसेसिंग…')
                    : t('Upload Image', 'चित्र अपलोड करें')}
                </span>
                <input type="file" accept="image/*" onChange={handleHeroFileUpload} className="hidden" />
              </label>
              {heroImageUrl && (
                <button
                  type="button"
                  onClick={() => setHeroImageUrl('')}
                  className="text-xs text-red-700 hover:underline"
                >
                  {t('Remove', 'हटाएं')}
                </button>
              )}
            </div>
          </div>
          <input
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            placeholder={t('Paste image URL or upload from device above', 'चित्र URL पेस्ट करें या ऊपर से अपलोड करें')}
            className="w-full px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
          />
          {heroImageUrl && (
            <div className="h-36 rounded-lg overflow-hidden border border-[#E2D9C8] bg-white">
              <HeritageImage src={heroImageUrl} alt="Hero preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Lead Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#5C554E] mb-1">
              {t('Main Introduction / Story (English)', 'मुख्य परिचय / लेख (अंग्रेज़ी)')}
            </label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5C554E] mb-1">
              {t('Main Introduction / Story (Hindi)', 'मुख्य परिचय / लेख (हिन्दी)')}
            </label>
            <textarea
              rows={4}
              value={summaryHi}
              onChange={(e) => setSummaryHi(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
            />
          </div>
        </div>

        {/* Embedded Video */}
        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6E182B] inline-flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            {t('Featured Video (Optional)', 'विशेष वीडियो (वैकल्पिक)')}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder={t('YouTube, Vimeo, Drive, or MP4 URL', 'YouTube, Vimeo या MP4 वीडियो लिंक')}
              className="w-full px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
            />
            <input
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder={t('Video Caption / Heading', 'वीडियो शीर्षक')}
              className="w-full px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
            />
          </div>
          {videoUrl.trim() && (
            <div className="aspect-video rounded-lg overflow-hidden border border-[#E2D9C8] bg-[#191614]">
              <VideoPlayer url={videoUrl.trim()} title={videoTitle || 'Video Preview'} />
            </div>
          )}
        </div>

        {/* Dynamic Content Sections */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6E182B]">
              {t(`Content Sections (${sections.length}/15)`, `अतिरिक्त अनुभाग (${sections.length}/15)`)}
            </span>
            <button
              type="button"
              onClick={addSection}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F2ECE1] border border-[#D8CBB0] text-xs font-medium text-[#6E182B] rounded-lg hover:bg-[#EAE0CF]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Add Section Block', 'अनुभाग जोड़ें')}</span>
            </button>
          </div>

          {sections.map((sec, idx) => (
            <div key={sec.id} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5C554E]">
                  {t(`Section ${idx + 1}`, `अनुभाग ${idx + 1}`)}
                </span>
                <button
                  type="button"
                  onClick={() => removeSection(idx)}
                  className="text-xs text-red-700 inline-flex items-center gap-1 hover:underline"
                >
                  <X className="w-3.5 h-3.5" />
                  {t('Remove', 'हटाएं')}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={sec.heading}
                  onChange={(e) => updateSection(idx, { heading: e.target.value })}
                  placeholder={t('Section Heading (English)', 'शीर्षक (अंग्रेज़ी)')}
                  className="px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
                />
                <input
                  value={sec.headingHi}
                  onChange={(e) => updateSection(idx, { headingHi: e.target.value })}
                  placeholder={t('Section Heading (Hindi)', 'शीर्षक (हिन्दी)')}
                  className="px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <textarea
                  rows={3}
                  value={sec.body}
                  onChange={(e) => updateSection(idx, { body: e.target.value })}
                  placeholder={t('Section Body (English)', 'विवरण (अंग्रेज़ी)')}
                  className="px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
                />
                <textarea
                  rows={3}
                  value={sec.bodyHi}
                  onChange={(e) => updateSection(idx, { bodyHi: e.target.value })}
                  placeholder={t('Section Body (Hindi)', 'विवरण (हिन्दी)')}
                  className="px-3 py-2 text-xs bg-white border border-[#D8CBB0] rounded-lg"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#D8CBB0] rounded-lg text-xs text-[#6E182B] cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>
                    {uploadingKey === `sec_${idx}`
                      ? t('Uploading…', 'अपलोड…')
                      : t('Section Photo', 'अनुभाग चित्र')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSectionFileUpload(idx, e)}
                    className="hidden"
                  />
                </label>
                <input
                  value={sec.imageUrl || ''}
                  onChange={(e) => updateSection(idx, { imageUrl: e.target.value })}
                  placeholder={t('Or paste section image URL', 'या चित्र URL पेस्ट करें')}
                  className="flex-1 min-w-[180px] px-2.5 py-1.5 text-xs bg-white border border-[#D8CBB0] rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Attached Photo Gallery */}
        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6E182B]">
              {t(`Page Photo Gallery (${galleryUrls.length}/8)`, `पृष्ठ चित्र गैलरी (${galleryUrls.length}/8)`)}
            </span>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D8CBB0] rounded-lg text-xs font-medium text-[#6E182B] cursor-pointer hover:bg-[#F2ECE1]">
              <Upload className="w-3.5 h-3.5" />
              <span>
                {uploadingKey === 'gallery'
                  ? t('Adding…', 'जुड़ रहा है…')
                  : t('Upload Gallery Photo', 'गैलरी चित्र अपलोड करें')}
              </span>
              <input type="file" accept="image/*" onChange={handleGalleryFileUpload} className="hidden" />
            </label>
          </div>
          <div className="flex gap-2">
            <input
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              placeholder={t('Or paste photo URL and click Add', 'या चित्र URL पेस्ट करके जोड़ें')}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#D8CBB0] rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                if (!newGalleryUrl.trim() || galleryUrls.length >= 8) return;
                setGalleryUrls((prev) => [...prev, newGalleryUrl.trim()]);
                setNewGalleryUrl('');
              }}
              className="px-3 py-1.5 bg-[#6E182B] text-white text-xs rounded-lg"
            >
              {t('Add', 'जोड़ें')}
            </button>
          </div>
          {galleryUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryUrls.map((u, idx) => (
                <div key={`gal_${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-[#D8CBB0] bg-white">
                  <HeritageImage src={u} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setGalleryUrls((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full"
                    aria-label="Remove gallery photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Publish Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-[#5C554E] mb-1">{t('Status', 'स्थिति')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
            >
              <option value="published">{t('Published (Live)', 'प्रकाशित (लाइव)')}</option>
              <option value="draft">{t('Draft (Admin Only)', 'ड्राफ्ट (केवल एडमिन)')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5C554E] mb-1">{t('Visibility', 'दृश्यता')}</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'family')}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
            >
              <option value="public">{t('Public', 'सार्वजनिक')}</option>
              <option value="family">{t('Signed-In Family Only', 'केवल परिवार सदस्य')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5C554E] mb-1">{t('Menu Order', 'क्रम संख्या')}</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value) || 1)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#D8CBB0] rounded-lg"
            />
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-[#44403C]">
          <input
            type="checkbox"
            checked={showInNav}
            onChange={(e) => setShowInNav(e.target.checked)}
          />
          <span>
            {t(
              'Show link automatically in Navigation Menu & Footer',
              'नेविगेशन मेनू और फुटर में स्वचालित रूप से दिखाएं',
            )}
          </span>
        </label>

        <button
          type="submit"
          disabled={busy || uploadingKey !== null}
          className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#6E182B] text-white text-sm font-medium rounded-lg hover:bg-[#4F0F1E] disabled:opacity-60"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>
            {editingId ? t('Update Custom Page', 'पृष्ठ अद्यतन करें') : t('Publish / Save New Page', 'नया पृष्ठ सुरक्षित करें')}
          </span>
        </button>
      </form>

      {/* Existing Custom Pages List */}
      <div className="lg:col-span-5 bg-white border border-[#E2D9C8] rounded-xl p-6 space-y-4 h-fit">
        <h2 className="font-serif text-2xl font-bold text-[#191614]">
          {t(`Created Pages (${customPages.length})`, `निर्मित पृष्ठ (${customPages.length})`)}
        </h2>
        {customPages.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#FAF7F2] border border-dashed border-[#D8CBB0] text-center space-y-2">
            <FilePlus2 className="w-8 h-8 text-[#A67C2E] mx-auto" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[#191614]">
              {t('No custom pages created yet', 'अभी तक कोई नया पृष्ठ नहीं बनाया गया है')}
            </p>
            <p className="text-xs text-[#5C554E] leading-relaxed">
              {t(
                'Use the Page Builder on the left to add new pages such as Kuldevi Temple, Reunion Chronicles, News Cuttings, or Elder Interviews.',
                'बाईं ओर दिए गए पेज बिल्डर से कुलदेवी मंदिर, पारिवारिक मिलन, समाचार संग्रह या विशेष जीवनी के नए पृष्ठ बनाएं।',
              )}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2D9C8]">
            {customPages.map((p) => (
              <div key={p.id} className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#191614] truncate">
                      {t(p.title, p.titleHi)}
                    </p>
                    <p className="text-xs text-[#5C554E] font-mono truncate">/page/{p.slug}</p>
                    <p className="text-[11px] text-[#A67C2E] mt-0.5 uppercase tracking-wider font-semibold">
                      {p.status} · {p.visibility} · {p.showInNav ? t('In Menu', 'मेनू में') : t('Direct Link', 'केवल लिंक')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      to={`/page/${p.slug}`}
                      className="p-1.5 rounded border border-[#D8CBB0] text-[#173F30] hover:bg-[#F2ECE1]"
                      title={t('Open Page', 'पृष्ठ देखें')}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => loadPageForEdit(p)}
                      className="p-1.5 rounded border border-[#D8CBB0] hover:bg-[#F2ECE1]"
                      title={t('Edit Page', 'संपादित करें')}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteCustomPage(p.id);
                        onStatus(t('Custom page deleted.', 'कस्टम पृष्ठ हटाया गया।'));
                        if (editingId === p.id) resetForm();
                      }}
                      className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50"
                      title={t('Delete Page', 'हटाएं')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
