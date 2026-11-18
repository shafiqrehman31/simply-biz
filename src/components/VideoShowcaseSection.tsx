import React, { useEffect, useRef, useState } from 'react';
import { PageRoute, VideoItem, VideoSectionContent } from '../types';
import { DEFAULT_VIDEO_SECTION_CONTENT } from '../services/storage';
import {
  getYouTubeThumbnailUrl,
  isIndexedDbUrl,
  parseEmbedUrl,
  resolveVideoUrl,
} from '../services/videoStorage';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Film,
  Loader2,
  Play,
  AlertCircle,
} from 'lucide-react';

interface VideoShowcaseSectionProps {
  videos?: VideoItem[];
  sectionContent?: VideoSectionContent;
  onNavigate: (page: PageRoute) => void;
  onOpenQuoteModal?: () => void;
}

const VideoThumbnailCard: React.FC<{
  video: VideoItem;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ video, isSelected, onSelect }) => {
  const [thumbSrc, setThumbSrc] = useState<string>('');
  const ytThumb = getYouTubeThumbnailUrl(video.videoUrl);
  const embedUrl = parseEmbedUrl(video.videoUrl);

  useEffect(() => {
    if (ytThumb || embedUrl) return;
    let cancelled = false;
    let objUrl: string | null = null;

    resolveVideoUrl(video.videoUrl).then(({ url, isObjectUrl }) => {
      if (cancelled) {
        if (isObjectUrl && url) URL.revokeObjectURL(url);
        return;
      }
      if (isObjectUrl) objUrl = url;
      setThumbSrc(url);
    });

    return () => {
      cancelled = true;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [video.videoUrl, ytThumb, embedUrl]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-40 sm:w-44 shrink-0 text-left rounded-2xl p-2 transition-all cursor-pointer ${
        isSelected
          ? 'neo-inset bg-white ring-2 ring-[#f85508]'
          : 'neo-box bg-white/70 hover:bg-white'
      }`}
    >
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900">
        {ytThumb ? (
          <img
            src={ytThumb}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : thumbSrc ? (
          <video
            src={`${thumbSrc}#t=0.5`}
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Film className="w-5 h-5" />
          </div>
        )}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-colors ${
            isSelected ? 'bg-black/15' : 'bg-black/30 group-hover:bg-black/15'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
              isSelected
                ? 'bg-[#f85508] text-white'
                : 'bg-white/90 text-[#00106b]'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      <div className="pt-2 px-1 space-y-0.5">
        <div
          className={`text-[11px] font-bold leading-tight line-clamp-1 ${
            isSelected ? 'text-[#f85508]' : 'text-[#00106b]'
          }`}
        >
          {video.title}
        </div>
        <div className="text-[10px] text-slate-500 truncate">{video.category}</div>
      </div>
    </button>
  );
};

export const VideoShowcaseSection: React.FC<VideoShowcaseSectionProps> = ({
  videos,
  sectionContent,
  onNavigate,
  onOpenQuoteModal,
}) => {
  const activeVideos = (videos ?? [])
    .filter((v) => v.isActive !== false)
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return (a.order || 0) - (b.order || 0);
    });

  const [selectedVideoId, setSelectedVideoId] = useState<string>(
    activeVideos[0]?.id || ''
  );
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [isLoadingSrc, setIsLoadingSrc] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [detectedOrientation, setDetectedOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  const autoPlayOnSelectRef = useRef<boolean>(false);

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
    setIsBuffering(true);

    if (activeVideo.orientation === 'portrait' || activeVideo.orientation === 'landscape') {
      setDetectedOrientation(activeVideo.orientation);
    }

    resolveVideoUrl(activeVideo.videoUrl)
      .then(({ url, isObjectUrl, missingLocalBlob }) => {
        if (cancelled) {
          if (isObjectUrl && url) URL.revokeObjectURL(url);
          return;
        }
        if (isObjectUrl) {
          objectUrlToRevoke = url;
        }
        if (!url) {
          setIsBuffering(false);
          if (missingLocalBlob || isIndexedDbUrl(activeVideo.videoUrl)) {
            setVideoError(
              'This video was stored only in the uploading browser. Add it via Video URL in Admin → Video Uploads so it plays across all browsers.'
            );
          } else {
            setVideoError('Video file is currently unavailable.');
          }
        }
        setResolvedSrc(url);
      })
      .catch(() => {
        if (!cancelled) {
          setIsBuffering(false);
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

  const handleSelectThumbnail = (videoId: string) => {
    autoPlayOnSelectRef.current = true;
    setSelectedVideoId(videoId);
  };

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (!thumbStripRef.current) return;
    const offset = direction === 'left' ? -240 : 240;
    thumbStripRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="neo-box rounded-3xl p-7 sm:p-10 lg:p-12 border border-white/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Copy, Active Video Summary, Scrollable Thumbnails above CTA, and Buttons */}
          <div className="lg:col-span-6 space-y-6 min-w-0">
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

            {/* Scrollable Video Thumbnail Strip (Directly Above Get Free Itemized Quote) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[#f85508]" />
                  <span>Video Briefings ({activeVideos.length})</span>
                </div>
                {activeVideos.length > 2 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => scrollThumbnails('left')}
                      aria-label="Scroll thumbnails left"
                      className="w-7 h-7 rounded-lg neo-box flex items-center justify-center text-[#00106b] hover:text-[#f85508] cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollThumbnails('right')}
                      aria-label="Scroll thumbnails right"
                      className="w-7 h-7 rounded-lg neo-box flex items-center justify-center text-[#00106b] hover:text-[#f85508] cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div
                ref={thumbStripRef}
                className="flex items-stretch gap-3 overflow-x-auto scroll-smooth pb-2 px-0.5"
              >
                {activeVideos.map((vid) => (
                  <VideoThumbnailCard
                    key={vid.id}
                    video={vid}
                    isSelected={vid.id === activeVideo.id}
                    onSelect={() => handleSelectThumbnail(vid.id)}
                  />
                ))}
              </div>
            </div>

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

          {/* Right Column: Clean Adaptive Video Player Frame */}
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
                    onLoad={() => setIsBuffering(false)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isLoadingSrc ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 text-xs gap-2.5 p-6 text-center">
                    <Loader2 className="w-7 h-7 text-[#f85508] animate-spin" />
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
                  <>
                    <video
                      ref={videoRef}
                      key={resolvedSrc}
                      src={resolvedSrc}
                      controls
                      playsInline
                      preload="auto"
                      onLoadStart={() => setIsBuffering(true)}
                      onWaiting={() => setIsBuffering(true)}
                      onStalled={() => setIsBuffering(true)}
                      onLoadedMetadata={(e) => {
                        if (activeVideo.orientation === 'auto') {
                          const { videoWidth, videoHeight } = e.currentTarget;
                          if (videoWidth && videoHeight) {
                            setDetectedOrientation(
                              videoHeight > videoWidth ? 'portrait' : 'landscape'
                            );
                          }
                        }
                      }}
                      onLoadedData={() => setIsBuffering(false)}
                      onCanPlay={() => {
                        setIsBuffering(false);
                        if (autoPlayOnSelectRef.current && videoRef.current) {
                          autoPlayOnSelectRef.current = false;
                          videoRef.current.play().catch(() => {});
                        }
                      }}
                      onPlaying={() => setIsBuffering(false)}
                      onError={() => {
                        setIsBuffering(false);
                        setVideoError(
                          'Unable to play this video format in the current browser.'
                        );
                      }}
                      className="w-full h-full object-contain bg-black"
                    >
                      <source src={resolvedSrc} type="video/mp4" />
                      Your browser does not support embedded HTML5 video.
                    </video>

                    {isBuffering && (
                      <div className="pointer-events-none absolute inset-0 bg-slate-950/55 flex flex-col items-center justify-center gap-2 text-white text-xs font-semibold">
                        <Loader2 className="w-7 h-7 text-[#f85508] animate-spin" />
                        <span>Buffering video...</span>
                      </div>
                    )}
                  </>
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
