import React, { useEffect, useState } from 'react';
import { PageRoute, VideoItem, VideoSectionContent } from '../types';
import { DEFAULT_VIDEOS, DEFAULT_VIDEO_SECTION_CONTENT } from '../services/storage';
import { parseEmbedUrl, resolveVideoUrl } from '../services/videoStorage';
import { ArrowRight, Check, Film, Play, AlertCircle } from 'lucide-react';

interface VideoShowcaseSectionProps {
  videos?: VideoItem[];
  sectionContent?: VideoSectionContent;
  onNavigate: (page: PageRoute) => void;
  onOpenQuoteModal?: () => void;
}

export const VideoShowcaseSection: React.FC<VideoShowcaseSectionProps> = ({
  videos,
  sectionContent,
  onNavigate,
  onOpenQuoteModal,
}) => {
  const activeVideos = (videos && videos.length > 0 ? videos : DEFAULT_VIDEOS)
    .filter((v) => v.isActive !== false)
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return (a.order || 0) - (b.order || 0);
    });

  const [selectedVideoId, setSelectedVideoId] = useState<string>(
    activeVideos[0]?.id || DEFAULT_VIDEOS[0].id
  );
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [isLoadingSrc, setIsLoadingSrc] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [detectedOrientation, setDetectedOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const activeVideo =
    activeVideos.find((v) => v.id === selectedVideoId) || activeVideos[0];

  useEffect(() => {
    if (activeVideos.length > 0 && !activeVideos.some((v) => v.id === selectedVideoId)) {
      setSelectedVideoId(activeVideos[0].id);
    }
  }, [activeVideos, selectedVideoId]);

  useEffect(() => {
    let cancelled = false;
    let objectUrlToRevoke: string | null = null;

    if (!activeVideo) return;

    setVideoError(null);
    setIsLoadingSrc(true);

    if (activeVideo.orientation === 'portrait' || activeVideo.orientation === 'landscape') {
      setDetectedOrientation(activeVideo.orientation);
    }

    resolveVideoUrl(activeVideo.videoUrl)
      .then(({ url, isObjectUrl }) => {
        if (cancelled) {
          if (isObjectUrl && url) URL.revokeObjectURL(url);
          return;
        }
        if (isObjectUrl) {
          objectUrlToRevoke = url;
        }
        if (!url) {
          setVideoError('Video file is unavailable in this browser session. Re-upload it from the Admin Dashboard.');
        }
        setResolvedSrc(url);
      })
      .catch(() => {
        if (!cancelled) {
          setVideoError('Unable to load the selected video.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSrc(false);
      });

    return () => {
      cancelled = true;
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [activeVideo?.id, activeVideo?.videoUrl, activeVideo?.orientation]);

  if (activeVideos.length === 0 || !activeVideo) {
    return null;
  }

  const copy = sectionContent || DEFAULT_VIDEO_SECTION_CONTENT;
  const embedUrl =
    activeVideo.sourceType === 'embed'
      ? parseEmbedUrl(activeVideo.videoUrl) || activeVideo.videoUrl
      : parseEmbedUrl(activeVideo.videoUrl);

  const isPortrait =
    activeVideo.orientation === 'portrait' ||
    (activeVideo.orientation === 'auto' && detectedOrientation === 'portrait');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="neo-box rounded-3xl p-7 sm:p-10 lg:p-12 border border-white/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Context, Highlights & Playlist */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="text-xs font-bold tracking-widest text-[#f85508] uppercase">
                {copy.badgeText}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00106b] tracking-tight text-balance">
                {copy.headline}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {copy.subheadline}
              </p>
            </div>

            {/* Active Video Summary Card */}
            <div className="neo-inset rounded-2xl p-5 bg-white/60 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[#f85508] uppercase tracking-wider">
                  {activeVideo.category}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activeVideo.isFeatured ? 'Featured Briefing' : 'Advisory Video'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#00106b]">
                {activeVideo.title}
              </h3>
              {activeVideo.description && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeVideo.description}
                </p>
              )}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/70 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#f85508] shrink-0" />
                  <span>100% Foreign Ownership</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#f85508] shrink-0" />
                  <span>Itemized Government Tariffs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#f85508] shrink-0" />
                  <span>Mainland &amp; 40+ Free Zones</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#f85508] shrink-0" />
                  <span>VIP Residency &amp; Emirates ID</span>
                </li>
              </ul>
            </div>

            {/* Video Selector List (shown when multiple active videos exist) */}
            {activeVideos.length > 1 && (
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[#f85508]" />
                  <span>More Briefings ({activeVideos.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeVideos.map((vid) => {
                    const isSelected = vid.id === activeVideo.id;
                    return (
                      <button
                        key={vid.id}
                        type="button"
                        onClick={() => setSelectedVideoId(vid.id)}
                        className={`text-left p-3 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'neo-inset bg-white/80 text-[#00106b]'
                            : 'neo-box text-slate-700 hover:text-[#00106b]'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-[#f85508] text-white'
                              : 'bg-[#00106b]/10 text-[#00106b]'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{vid.title}</div>
                          <div className="text-[11px] text-slate-500 truncate">{vid.category}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onOpenQuoteModal ? onOpenQuoteModal : () => onNavigate('contact')}
                className="neo-btn-orange px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Get Free Itemized Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="neo-btn-neutral px-5 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Explore Setup Packages</span>
              </button>
            </div>
          </div>

          {/* Right Column: Adaptive Video Player Frame */}
          <div className="lg:col-span-6 flex justify-center">
            <div
              className={`w-full neo-inset rounded-3xl p-3 sm:p-4 bg-white/70 ${
                isPortrait && !embedUrl ? 'max-w-[340px]' : 'max-w-2xl'
              }`}
            >
              <div
                className={`relative w-full overflow-hidden rounded-2xl bg-slate-950 shadow-inner ${
                  embedUrl
                    ? 'aspect-video'
                    : isPortrait
                    ? 'aspect-[9/16]'
                    : 'aspect-video'
                }`}
              >
                {embedUrl ? (
                  <iframe
                    key={activeVideo.id}
                    src={embedUrl}
                    title={activeVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isLoadingSrc ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 text-xs gap-2 p-6 text-center">
                    <Film className="w-7 h-7 text-[#f85508]" />
                    <span>Loading video stream...</span>
                  </div>
                ) : videoError || !resolvedSrc ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 text-xs gap-3 p-6 text-center">
                    <AlertCircle className="w-7 h-7 text-[#f85508]" />
                    <span className="max-w-xs leading-relaxed">
                      {videoError || 'Video preview unavailable.'}
                    </span>
                  </div>
                ) : (
                  <video
                    key={resolvedSrc}
                    src={resolvedSrc}
                    controls
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                      if (activeVideo.orientation === 'auto') {
                        const { videoWidth, videoHeight } = e.currentTarget;
                        if (videoWidth && videoHeight) {
                          setDetectedOrientation(videoHeight > videoWidth ? 'portrait' : 'landscape');
                        }
                      }
                    }}
                    onError={() =>
                      setVideoError('Unable to play this video format in the current browser.')
                    }
                    className="w-full h-full object-contain bg-black"
                  >
                    Your browser does not support embedded HTML5 video.
                  </video>
                )}
              </div>

              {/* Clean Video Caption Bar */}
              <div className="flex items-center justify-between gap-3 pt-3 px-1 text-[11px] text-slate-500 font-medium">
                <span className="truncate font-semibold text-[#00106b]">{activeVideo.title}</span>
                <span className="shrink-0">www.simply-biz.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
