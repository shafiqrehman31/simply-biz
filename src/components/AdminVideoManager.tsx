import React, { useEffect, useRef, useState } from 'react';
import { CMSData, VideoItem, VideoSectionContent } from '../types';
import {
  DEFAULT_VIDEO_SECTION_CONTENT,
  DEFAULT_VIDEOS,
  deleteVideoFromCloud,
  saveCMSData,
  saveVideoSectionToCloud,
  saveVideoToCloud,
  syncAllVideosToCloud,
  syncVideosFromFirestore,
} from '../services/storage';
import {
  buildIndexedDbUrl,
  checkServerUploadAvailable,
  deleteVideoBlob,
  deleteVideoFromServer,
  extractIndexedDbId,
  formatFileSize,
  isIndexedDbUrl,
  isServerStreamUrl,
  normalizeDirectVideoUrl,
  parseEmbedUrl,
  resolveVideoUrl,
  saveVideoBlob,
  uploadVideoToServer,
} from '../services/videoStorage';
import {
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Film,
  Link2,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Star,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';

interface AdminVideoManagerProps {
  cmsData: CMSData;
  onUpdateCMS: (data: CMSData) => void;
  onSaveSuccess: (msg: string) => void;
}

const AdminVideoPreview: React.FC<{ video: VideoItem }> = ({ video }) => {
  const [src, setSrc] = useState<string>('');
  const [missingLocal, setMissingLocal] = useState<boolean>(false);
  const [playError, setPlayError] = useState<boolean>(false);

  const embedUrl =
    video.sourceType === 'embed'
      ? parseEmbedUrl(video.videoUrl) || video.videoUrl
      : parseEmbedUrl(video.videoUrl);

  useEffect(() => {
    if (embedUrl) return;
    let cancelled = false;
    let objUrl: string | null = null;
    setMissingLocal(false);
    setPlayError(false);

    resolveVideoUrl(video.videoUrl).then(({ url, isObjectUrl, missingLocalBlob }) => {
      if (cancelled) {
        if (isObjectUrl && url) URL.revokeObjectURL(url);
        return;
      }
      if (isObjectUrl) objUrl = url;
      setMissingLocal(Boolean(missingLocalBlob));
      setSrc(url);
    });

    return () => {
      cancelled = true;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [video.videoUrl, embedUrl]);

  if (embedUrl) {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-950">
        <iframe
          src={embedUrl}
          title={video.title}
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    );
  }

  if (!src || playError) {
    return (
      <div className="w-full h-44 rounded-xl bg-slate-900 flex flex-col items-center justify-center text-slate-300 text-xs gap-2 p-4 text-center">
        <Video className="w-6 h-6 text-[#f85508]" />
        <span>
          {missingLocal
            ? 'Saved in another browser only'
            : playError
            ? 'Preview unsupported in this browser'
            : 'Preview unavailable'}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-48 rounded-xl overflow-hidden bg-black flex items-center justify-center">
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        onError={() => setPlayError(true)}
        className="w-full h-full object-contain"
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
};

export const AdminVideoManager: React.FC<AdminVideoManagerProps> = ({
  cmsData,
  onUpdateCMS,
  onSaveSuccess,
}) => {
  const videos = cmsData.videos ?? [];
  const [sectionDraft, setSectionDraft] = useState<VideoSectionContent>(
    cmsData.videoSectionContent || DEFAULT_VIDEO_SECTION_CONTENT
  );

  // Environment capability check (Express upload server vs static CDN like Vercel)
  const [serverUploadAvailable, setServerUploadAvailable] = useState<boolean>(true);
  const [checkedServer, setCheckedServer] = useState<boolean>(false);

  // Upload form state
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
  const [externalUrl, setExternalUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('UAE Business Setup Guide');
  const [description, setDescription] = useState<string>('');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [isFeaturedNew, setIsFeaturedNew] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showStaticFileGuidance, setShowStaticFileGuidance] = useState<boolean>(false);

  // Library operations state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  // Edit existing video modal state
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSectionDraft(cmsData.videoSectionContent || DEFAULT_VIDEO_SECTION_CONTENT);
  }, [cmsData.videoSectionContent]);

  useEffect(() => {
    let active = true;
    checkServerUploadAvailable().then((available) => {
      if (!active) return;
      setServerUploadAvailable(available);
      setCheckedServer(true);
      setUploadMode(available ? 'file' : 'url');
    });

    syncVideosFromFirestore()
      .then((synced) => {
        if (!active) return;
        onUpdateCMS({
          ...cmsData,
          videos: synced,
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const handleRefreshLibrary = async () => {
    setIsSyncing(true);
    setLibraryError(null);
    try {
      const synced = await syncVideosFromFirestore();
      onUpdateCMS({
        ...cmsData,
        videos: synced,
      });
      onSaveSuccess(`Synced ${synced.length} video${synced.length === 1 ? '' : 's'} from Cloud Database.`);
    } catch (err) {
      setLibraryError(err instanceof Error ? err.message : 'Unable to sync videos from Cloud Database.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreSampleVideo = async () => {
    setLibraryError(null);
    try {
      await Promise.all(DEFAULT_VIDEOS.map((vid) => saveVideoToCloud(vid)));
      const updated = [...DEFAULT_VIDEOS, ...videos.filter((v) => v.id !== DEFAULT_VIDEOS[0].id)];
      const updatedCMS: CMSData = { ...cmsData, videos: updated };
      onUpdateCMS(updatedCMS);
      saveCMSData(updatedCMS);
      onSaveSuccess('Restored the default Simply Biz briefing video.');
    } catch (err) {
      setLibraryError(err instanceof Error ? err.message : 'Failed to restore sample video.');
    }
  };

  const handleFileSelected = (file: File | null) => {
    setUploadError(null);
    setShowStaticFileGuidance(false);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl('');
    }
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith('video/') && !/\.(mp4|mov|webm|m4v|mkv|avi)$/i.test(file.name)) {
      setUploadError('Please select a valid video file (MP4, WebM, MOV, M4V, MKV, or AVI).');
      return;
    }

    const preview = URL.createObjectURL(file);
    setSelectedFile(file);
    setFilePreviewUrl(preview);

    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      setTitle(cleanName);
    }
  };

  const publishVideoItem = async (newVideo: VideoItem, saveToCloud: boolean) => {
    const baseVideos = newVideo.isFeatured
      ? videos.map((v) => ({ ...v, isFeatured: false }))
      : videos;

    const updatedVideos = [newVideo, ...baseVideos];

    if (saveToCloud) {
      setUploadStatusText('Syncing video to Cloud Database...');
      if (newVideo.isFeatured) {
        await syncAllVideosToCloud(updatedVideos);
      } else {
        await saveVideoToCloud(newVideo);
      }
    }

    const updatedCMS: CMSData = {
      ...cmsData,
      videos: updatedVideos,
    };
    onUpdateCMS(updatedCMS);
    saveCMSData(updatedCMS);

    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl('');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setExternalUrl('');
    setTitle('');
    setDescription('');
    setOrientation('auto');
    setIsFeaturedNew(false);
    setShowStaticFileGuidance(false);
  };

  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setLibraryError(null);
    setShowStaticFileGuidance(false);

    if (!title.trim()) {
      setUploadError('Please enter a video title before publishing.');
      return;
    }

    if (uploadMode === 'file' && !selectedFile) {
      setUploadError('Please select a video file to upload.');
      return;
    }

    if (uploadMode === 'url' && !externalUrl.trim()) {
      setUploadError('Please enter a video URL, YouTube, Vimeo, Google Drive, or Dropbox link.');
      return;
    }

    setIsUploading(true);
    setUploadStatusText('Publishing video...');

    try {
      let id = `video-${Date.now()}`;
      let videoUrl = '';
      let sourceType: VideoItem['sourceType'] = 'url';
      let fileName: string | undefined;
      let fileSizeBytes: number | undefined;
      let resolvedOrientation: VideoItem['orientation'] = orientation;

      if (uploadMode === 'file' && selectedFile) {
        fileName = selectedFile.name;
        fileSizeBytes = selectedFile.size;

        setUploadStatusText('Uploading & optimizing video for all browsers...');
        const serverResult = await uploadVideoToServer(selectedFile);
        id = serverResult.id;
        videoUrl = serverResult.videoUrl;
        fileSizeBytes = serverResult.fileSizeBytes || selectedFile.size;
        sourceType = 'uploaded';
        if (orientation === 'auto' && serverResult.detectedOrientation !== 'auto') {
          resolvedOrientation = serverResult.detectedOrientation;
        }
      } else {
        const normalized = normalizeDirectVideoUrl(externalUrl);
        const embed = parseEmbedUrl(normalized);
        videoUrl = normalized;
        sourceType = embed ? 'embed' : 'url';
      }

      const newVideo: VideoItem = {
        id,
        title: title.trim(),
        description:
          description.trim() ||
          'Expert UAE business setup briefing by Simply Biz corporate advisors.',
        category: category.trim() || 'UAE Business Setup Guide',
        videoUrl,
        sourceType,
        fileName,
        fileSizeBytes,
        orientation: resolvedOrientation,
        isActive: true,
        isFeatured: isFeaturedNew || videos.length === 0,
        order: videos.length + 1,
        createdAt: new Date().toISOString(),
      };

      await publishVideoItem(newVideo, true);
      onSaveSuccess(`Video "${newVideo.title}" published and synced across all browsers.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to publish video. Please try again.';
      if (msg === 'STATIC_HOSTING_NO_UPLOAD_SERVER') {
        setShowStaticFileGuidance(true);
        setUploadError(
          'This live domain uses static web hosting without a built-in media file server. To display your video to all visitors across every browser, host it on YouTube, Vimeo, Google Drive, or Dropbox and paste the share link under "Video URL".'
        );
      } else {
        setUploadError(msg);
      }
    } finally {
      setIsUploading(false);
      setUploadStatusText('');
    }
  };

  const handleSaveLocalBrowserPreview = async () => {
    if (!selectedFile || !title.trim()) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const id = `video-${Date.now()}`;
      await saveVideoBlob(id, selectedFile);
      const newVideo: VideoItem = {
        id,
        title: title.trim(),
        description:
          description.trim() ||
          'Expert UAE business setup briefing by Simply Biz corporate advisors.',
        category: category.trim() || 'UAE Business Setup Guide',
        videoUrl: buildIndexedDbUrl(id),
        sourceType: 'uploaded',
        fileName: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        orientation,
        isActive: true,
        isFeatured: isFeaturedNew || videos.length === 0,
        order: videos.length + 1,
        createdAt: new Date().toISOString(),
      };
      await publishVideoItem(newVideo, false);
      onSaveSuccess(`Video "${newVideo.title}" saved for local preview in this browser.`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to save local preview.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSectionCopy = async () => {
    const updatedCMS: CMSData = {
      ...cmsData,
      videoSectionContent: sectionDraft,
    };
    onUpdateCMS(updatedCMS);
    saveCMSData(updatedCMS);
    await saveVideoSectionToCloud(sectionDraft);
    onSaveSuccess('Front-end video showcase headings updated across all browsers.');
  };

  const handleSetFeatured = async (id: string) => {
    setLibraryError(null);
    try {
      const updatedVideos = videos.map((v) => ({
        ...v,
        isFeatured: v.id === id,
        isActive: v.id === id ? true : v.isActive,
      }));
      await syncAllVideosToCloud(updatedVideos);
      const updatedCMS: CMSData = { ...cmsData, videos: updatedVideos };
      onUpdateCMS(updatedCMS);
      saveCMSData(updatedCMS);
      onSaveSuccess('Featured video updated on the homepage showcase.');
    } catch (err) {
      setLibraryError(err instanceof Error ? err.message : 'Unable to update featured video.');
    }
  };

  const handleToggleActive = async (id: string) => {
    setLibraryError(null);
    try {
      const updatedVideos = videos.map((v) =>
        v.id === id ? { ...v, isActive: !v.isActive } : v
      );
      const changed = updatedVideos.find((v) => v.id === id);
      if (changed) {
        await saveVideoToCloud(changed);
      }
      const updatedCMS: CMSData = { ...cmsData, videos: updatedVideos };
      onUpdateCMS(updatedCMS);
      saveCMSData(updatedCMS);
      onSaveSuccess('Video visibility updated.');
    } catch (err) {
      setLibraryError(err instanceof Error ? err.message : 'Unable to toggle video visibility.');
    }
  };

  const handleDeleteVideo = async (video: VideoItem) => {
    setDeletingId(video.id);
    setLibraryError(null);
    try {
      await deleteVideoFromCloud(video.id);

      if (isIndexedDbUrl(video.videoUrl)) {
        await deleteVideoBlob(extractIndexedDbId(video.videoUrl));
      } else if (isServerStreamUrl(video.videoUrl)) {
        await deleteVideoFromServer(video.videoUrl);
      }

      const remaining = videos.filter((v) => v.id !== video.id);
      const updatedCMS: CMSData = {
        ...cmsData,
        videos: remaining,
      };
      onUpdateCMS(updatedCMS);
      saveCMSData(updatedCMS);
      onSaveSuccess(`Deleted "${video.title}" from all browsers and Cloud Database.`);
    } catch (err) {
      setLibraryError(
        err instanceof Error ? err.message : 'Could not delete video from Cloud Database.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveEditedVideo = async () => {
    if (!editingVideo || !editingVideo.title.trim()) return;
    setLibraryError(null);
    try {
      const updatedVideos = videos.map((v) =>
        v.id === editingVideo.id
          ? editingVideo
          : editingVideo.isFeatured
          ? { ...v, isFeatured: false }
          : v
      );
      if (editingVideo.isFeatured) {
        await syncAllVideosToCloud(updatedVideos);
      } else {
        await saveVideoToCloud(editingVideo);
      }
      const updatedCMS: CMSData = { ...cmsData, videos: updatedVideos };
      onUpdateCMS(updatedCMS);
      saveCMSData(updatedCMS);
      setEditingVideo(null);
      onSaveSuccess('Video details updated across all browsers.');
    } catch (err) {
      setLibraryError(err instanceof Error ? err.message : 'Failed to save video details.');
    }
  };

  const urlEmbedPreview = uploadMode === 'url' ? parseEmbedUrl(externalUrl) : null;
  const normalizedUrlPreview = uploadMode === 'url' ? normalizeDirectVideoUrl(externalUrl) : '';

  return (
    <div className="space-y-8">
      {/* Top Grid: Upload Studio + Section Copy Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Publish Video Form */}
        <form
          onSubmit={handlePublishVideo}
          className="lg:col-span-7 neo-box rounded-3xl p-6 sm:p-8 space-y-5 border border-white"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xl font-bold text-[#00106b] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#f85508]" />
                <span>Add Video to Showcase</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {serverUploadAvailable
                  ? 'Upload MP4/MOV/WebM files or paste a YouTube, Vimeo, Google Drive, Dropbox, or MP4 link.'
                  : 'Paste a YouTube, Vimeo, Google Drive, Dropbox, or direct MP4 URL to publish across all browsers.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 neo-inset p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('url');
                  setUploadError(null);
                  setShowStaticFileGuidance(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  uploadMode === 'url'
                    ? 'bg-[#00106b] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#00106b]'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Video URL</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('file');
                  setUploadError(null);
                  setShowStaticFileGuidance(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  uploadMode === 'file'
                    ? 'bg-[#00106b] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#00106b]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
            </div>
          </div>

          {checkedServer && !serverUploadAvailable && uploadMode === 'file' && !uploadError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="font-bold">Static Hosting Notice</div>
              <p className="leading-relaxed">
                This live website runs on static hosting, which does not include a media file server for raw uploads. Use <strong>Video URL</strong> (YouTube, Vimeo, Google Drive, Dropbox, or MP4 link) so visitors in every browser can watch your video.
              </p>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className="px-3 py-1.5 rounded-lg bg-[#00106b] text-white text-[11px] font-bold cursor-pointer"
              >
                Switch to Video URL
              </button>
            </div>
          )}

          {uploadError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 leading-relaxed space-y-2.5">
              <div>{uploadError}</div>
              {showStaticFileGuidance && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadMode('url');
                      setUploadError(null);
                      setShowStaticFileGuidance(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#00106b] text-white text-[11px] font-bold cursor-pointer"
                  >
                    Switch to Video URL
                  </button>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleSaveLocalBrowserPreview}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-[11px] font-bold cursor-pointer"
                    >
                      Save Preview for This Browser Only
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {uploadMode === 'file' ? (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Select Video File (MP4, MOV, WebM, MKV, AVI)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0] || null;
                  handleFileSelected(file);
                }}
                className="neo-inset rounded-2xl p-6 text-center cursor-pointer hover:bg-white/70 transition-colors border border-dashed border-slate-300"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl neo-box flex items-center justify-center mx-auto mb-3 text-[#f85508]">
                  <Film className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-[#00106b]">{selectedFile.name}</div>
                    <div className="text-xs text-slate-500">
                      {formatFileSize(selectedFile.size)} · Click to choose a different file
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-[#00106b]">
                      Click to browse or drag &amp; drop a video file
                    </div>
                    <div className="text-xs text-slate-500">
                      Supports portrait (9:16) and widescreen (16:9) files up to 250 MB
                    </div>
                  </div>
                )}
              </div>

              {filePreviewUrl && (
                <div className="w-full h-56 rounded-2xl overflow-hidden bg-black">
                  <video
                    src={filePreviewUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Video URL (YouTube, Vimeo, Google Drive, Dropbox, or Direct .MP4 Link)
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://drive.google.com/file/d/... or https://.../video.mp4"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full neo-inset rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
              />
              {externalUrl.trim() && (
                <div className="w-full h-56 rounded-2xl overflow-hidden bg-black">
                  {urlEmbedPreview ? (
                    <iframe
                      src={urlEmbedPreview}
                      title="Video URL preview"
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={normalizedUrlPreview}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Video Title *</label>
              <input
                type="text"
                placeholder="e.g. Dubai Mainland Setup Walkthrough"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. UAE Business Setup Guide"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              placeholder="Briefly explain what visitors will learn from this video..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Player Aspect Ratio
              </label>
              <select
                value={orientation}
                onChange={(e) =>
                  setOrientation(e.target.value as 'auto' | 'portrait' | 'landscape')
                }
                className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
              >
                <option value="auto">Auto-detect from video</option>
                <option value="portrait">Portrait / Vertical (9:16)</option>
                <option value="landscape">Widescreen / Landscape (16:9)</option>
              </select>
            </div>

            <label className="flex items-center gap-2.5 pt-4 sm:pt-5 text-xs font-bold text-[#00106b] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeaturedNew}
                onChange={(e) => setIsFeaturedNew(e.target.checked)}
                className="w-4 h-4 rounded accent-[#f85508]"
              />
              <span>Set as primary featured homepage video</span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-xs font-semibold text-[#00106b]">
              {uploadStatusText}
            </span>
            <button
              type="submit"
              disabled={isUploading}
              className="neo-btn-orange px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>
                {isUploading
                  ? 'Publishing Video...'
                  : uploadMode === 'url'
                  ? 'Publish Video Link'
                  : 'Upload & Publish Video'}
              </span>
            </button>
          </div>
        </form>

        {/* Right: Front-End Video Section Copy Editor */}
        <div className="lg:col-span-5 neo-box rounded-3xl p-6 sm:p-8 space-y-5 border border-white">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-xl font-bold text-[#00106b]">Front-End Section Copy</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize the kicker, headline, and intro shown next to the homepage video player.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section Kicker</label>
              <input
                type="text"
                value={sectionDraft.badgeText}
                onChange={(e) =>
                  setSectionDraft({ ...sectionDraft, badgeText: e.target.value })
                }
                className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section Headline
              </label>
              <input
                type="text"
                value={sectionDraft.headline}
                onChange={(e) =>
                  setSectionDraft({ ...sectionDraft, headline: e.target.value })
                }
                className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section Description
              </label>
              <textarea
                rows={4}
                value={sectionDraft.subheadline}
                onChange={(e) =>
                  setSectionDraft({ ...sectionDraft, subheadline: e.target.value })
                }
                className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800 leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveSectionCopy}
              className="w-full neo-btn-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#f85508]" />
              <span>Save Section Copy</span>
            </button>
          </div>

          <div className="neo-inset rounded-2xl p-4 bg-white/60 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-[#00106b] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cross-Browser Playback</span>
            </div>
            <p className="leading-relaxed">
              Videos added via YouTube, Vimeo, Google Drive, Dropbox, or MP4 links—and server-uploaded MP4s—sync in Cloud Firestore so every browser sees live updates and deletions immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Published Video Library */}
      <div className="neo-box rounded-3xl p-6 sm:p-8 space-y-6 border border-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl font-bold text-[#00106b]">
              Video Library ({videos.length})
            </h3>
            <p className="text-xs text-slate-500">
              Manage active homepage videos, set which briefing loads first, or permanently delete videos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshLibrary}
              disabled={isSyncing}
              className="neo-btn-neutral px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00106b] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync from Cloud'}</span>
            </button>
          </div>
        </div>

        {libraryError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {libraryError}
          </div>
        )}

        {videos.length === 0 ? (
          <div className="neo-inset rounded-2xl p-10 text-center space-y-3 bg-white/50">
            <Video className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-[#00106b]">No videos in the library</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Add a Video URL or upload a video file above to display the video showcase section on the homepage.
            </p>
            <button
              type="button"
              onClick={handleRestoreSampleVideo}
              className="neo-btn-neutral px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#f85508]" />
              <span>Restore Sample Briefing Video</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="neo-inset rounded-2xl p-4 bg-white/70 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <AdminVideoPreview video={vid} />

                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                    <span className="text-[#f85508] uppercase tracking-wider truncate">
                      {vid.category}
                    </span>
                    <span className="text-slate-500 shrink-0">
                      {isIndexedDbUrl(vid.videoUrl)
                        ? 'Local Browser Only'
                        : vid.sourceType === 'uploaded'
                        ? `Cloud MP4${vid.fileSizeBytes ? ` · ${formatFileSize(vid.fileSizeBytes)}` : ''}`
                        : vid.sourceType === 'local'
                        ? 'Built-in Asset'
                        : vid.sourceType === 'embed'
                        ? 'Embedded Link'
                        : 'External URL'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#00106b] leading-snug">
                      {vid.title}
                    </h4>
                    {vid.description && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {vid.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetFeatured(vid.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        vid.isFeatured
                          ? 'bg-[#f85508] text-white'
                          : 'neo-box text-slate-600 hover:text-[#00106b]'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${vid.isFeatured ? 'fill-white' : ''}`} />
                      <span>{vid.isFeatured ? 'Featured' : 'Feature'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(vid.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        vid.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {vid.isActive ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingVideo(vid)}
                      className="p-1.5 rounded-lg neo-box text-[#00106b] hover:text-[#f85508] cursor-pointer"
                      title="Edit video details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === vid.id}
                      onClick={() => handleDeleteVideo(vid)}
                      className="p-1.5 rounded-lg neo-box text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-50"
                      title="Delete video"
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

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="neo-box rounded-3xl p-6 sm:p-8 w-full max-w-lg space-y-4 border border-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-lg font-bold text-[#00106b]">Edit Video Details</h4>
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="p-1.5 rounded-lg neo-box text-slate-500 hover:text-[#00106b] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video Title</label>
                <input
                  type="text"
                  value={editingVideo.title}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, title: e.target.value })
                  }
                  className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editingVideo.category}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, category: e.target.value })
                  }
                  className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingVideo.description}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, description: e.target.value })
                  }
                  className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Player Aspect Ratio
                </label>
                <select
                  value={editingVideo.orientation}
                  onChange={(e) =>
                    setEditingVideo({
                      ...editingVideo,
                      orientation: e.target.value as 'auto' | 'portrait' | 'landscape',
                    })
                  }
                  className="w-full neo-inset rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  <option value="auto">Auto-detect</option>
                  <option value="portrait">Portrait (9:16)</option>
                  <option value="landscape">Landscape (16:9)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="neo-btn-neutral px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedVideo}
                className="neo-btn-orange px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
