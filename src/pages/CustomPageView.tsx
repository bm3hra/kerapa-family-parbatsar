import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Film, Images, X } from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { PageHeader } from '../components/PageHeader';
import { HeritageImage } from '../components/HeritageImage';
import { VideoPlayer } from '../components/VideoPlayer';

export function CustomPageView() {
  const { slug } = useParams<{ slug: string }>();
  const { t, customPages, isAdmin } = useArchive();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const page = customPages.find((p) => p.slug === slug);

  if (!page) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-5">
        <p className="text-xs uppercase tracking-[0.18em] text-[#A67C2E] font-semibold">
          {t('Kerapa Family Archive', 'केरापा परिवार अभिलेखागार')}
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#191614]">
          {t('Page Not Found', 'यह पृष्ठ उपलब्ध नहीं है')}
        </h1>
        <p className="text-sm text-[#5C554E] leading-relaxed">
          {t(
            'This custom archive page may still be in draft mode or has been moved by the archive administrator.',
            'यह पृष्ठ अभी ड्राफ्ट स्थिति में हो सकता है या एडमिन द्वारा हटाया जा चुका है।',
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6E182B] text-white text-sm font-medium rounded-lg hover:bg-[#4F0F1E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('Return Home', 'मुख्य पृष्ठ पर लौटें')}</span>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#D8CBB0] text-[#191614] text-sm font-medium rounded-lg hover:bg-[#F2ECE1] transition-colors"
            >
              <Edit3 className="w-4 h-4 text-[#6E182B]" />
              <span>{t('Open Admin Page Builder', 'एडमिन पेज बिल्डर खोलें')}</span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  const gallery = (page.galleryUrls || []).filter(Boolean);
  const sections = page.sections || [];

  return (
    <div>
      <PageHeader
        kickerEn={page.kicker || 'Kerapa Family Archive · Feature Page'}
        kickerHi={page.kickerHi || 'केरापा परिवार अभिलेख · विशेष पृष्ठ'}
        titleEn={page.title}
        titleHi={page.titleHi}
        subtitleEn={page.subtitle || ''}
        subtitleHi={page.subtitleHi || page.subtitle || ''}
        actions={
          isAdmin ? (
            <div className="flex items-center gap-2">
              {page.status === 'draft' && (
                <span className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#F4E6C8] text-[#7A520B] rounded-md">
                  {t('Draft Preview', 'ड्राफ्ट पूर्वावलोकन')}
                </span>
              )}
              <Link
                to={`/admin?tab=pages&editPage=${encodeURIComponent(page.id)}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6E182B] text-white text-sm font-medium rounded-lg hover:bg-[#4F0F1E] transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>{t('Edit Page', 'पृष्ठ संपादित करें')}</span>
              </Link>
            </div>
          ) : undefined
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Hero Image */}
        {page.heroImageUrl && (
          <figure className="overflow-hidden rounded-xl border border-[#E2D9C8] bg-[#F2ECE1]">
            <HeritageImage
              src={page.heroImageUrl}
              alt={t(page.title, page.titleHi)}
              fallbackTitle={t(page.title, page.titleHi)}
              className="w-full max-h-[520px] object-cover"
            />
          </figure>
        )}

        {/* Summary / Lead Story */}
        {(page.summary || page.summaryHi) && (
          <section className="bg-white border border-[#E2D9C8] rounded-xl p-6 sm:p-8">
            <p className="text-base sm:text-lg text-[#2D2926] leading-relaxed whitespace-pre-line">
              {t(page.summary || '', page.summaryHi || page.summary || '')}
            </p>
          </section>
        )}

        {/* Featured Video */}
        {page.videoUrl && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#A67C2E] font-semibold">
              <Film className="w-4 h-4 text-[#6E182B]" />
              <span>{page.videoTitle || t('Featured Archive Video', 'विशेष चलचित्र अभिलेख')}</span>
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#E2D9C8] bg-[#191614]">
              <VideoPlayer
                url={page.videoUrl}
                title={page.videoTitle || t(page.title, page.titleHi)}
              />
            </div>
          </section>
        )}

        {/* Content Sections */}
        {sections.length > 0 && (
          <div className="space-y-8">
            {sections.map((sec) => (
              <article
                key={sec.id}
                className="bg-white border border-[#E2D9C8] rounded-xl p-6 sm:p-8 space-y-5"
              >
                {(sec.heading || sec.headingHi) && (
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#191614]">
                    {t(sec.heading, sec.headingHi || sec.heading)}
                  </h2>
                )}
                {sec.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(sec.imageUrl || null)}
                    className="block w-full overflow-hidden rounded-lg border border-[#E2D9C8] bg-[#F2ECE1]"
                  >
                    <HeritageImage
                      src={sec.imageUrl}
                      alt={t(sec.heading, sec.headingHi || sec.heading)}
                      className="w-full max-h-[440px] object-cover hover:scale-[1.01] transition-transform duration-300"
                    />
                  </button>
                )}
                {(sec.body || sec.bodyHi) && (
                  <p className="text-sm sm:text-base text-[#44403C] leading-relaxed whitespace-pre-line">
                    {t(sec.body, sec.bodyHi || sec.body)}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Attached Photo Gallery */}
        {gallery.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#A67C2E] font-semibold">
              <Images className="w-4 h-4 text-[#6E182B]" />
              <span>{t('Page Photo Gallery', 'पृष्ठ चित्र संग्रह')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={`${page.id}_gal_${idx}`}
                  type="button"
                  onClick={() => setLightboxUrl(imgUrl)}
                  className="aspect-[4/3] overflow-hidden rounded-xl border border-[#E2D9C8] bg-[#F2ECE1] group"
                >
                  <HeritageImage
                    src={imgUrl}
                    alt={`${t(page.title, page.titleHi)} — ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#FAF7F2] rounded-xl overflow-hidden border border-[#D8CBB0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2D9C8]">
              <p className="font-serif text-lg font-semibold text-[#191614]">
                {t(page.title, page.titleHi)}
              </p>
              <button
                type="button"
                onClick={() => setLightboxUrl(null)}
                className="p-2 rounded-lg border border-[#E2D9C8] bg-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-[#191614] flex items-center justify-center max-h-[75vh]">
              <HeritageImage
                src={lightboxUrl}
                alt={t(page.title, page.titleHi)}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
