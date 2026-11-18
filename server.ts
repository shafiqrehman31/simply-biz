import express from 'express';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.resolve(__dirname, 'uploads', 'videos');
const MAX_UPLOAD_BYTES = 250 * 1024 * 1024; // 250 MB

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

interface ProbeStream {
  codec_type?: string;
  codec_name?: string;
  pix_fmt?: string;
  width?: number;
  height?: number;
}

interface ProbeResult {
  format?: {
    format_name?: string;
  };
  streams?: ProbeStream[];
}

async function probeVideo(filePath: string): Promise<ProbeResult | null> {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=format_name:stream=codec_type,codec_name,pix_fmt,width,height',
      '-of',
      'json',
      filePath,
    ]);
    return JSON.parse(stdout) as ProbeResult;
  } catch {
    return null;
  }
}

async function normalizeToUniversalMp4(
  inputPath: string,
  outputPath: string
): Promise<{ orientation: 'portrait' | 'landscape' | 'auto' }> {
  const probe = await probeVideo(inputPath);
  const streams = probe?.streams || [];
  const videoStream = streams.find((s) => s.codec_type === 'video');
  const audioStream = streams.find((s) => s.codec_type === 'audio');
  const formatName = probe?.format?.format_name || '';

  let orientation: 'portrait' | 'landscape' | 'auto' = 'auto';
  if (videoStream?.width && videoStream?.height) {
    orientation = videoStream.height > videoStream.width ? 'portrait' : 'landscape';
  }

  const isUniversalVideo =
    videoStream?.codec_name === 'h264' &&
    videoStream?.pix_fmt === 'yuv420p';
  const isUniversalAudio = !audioStream || audioStream.codec_name === 'aac';
  const isMp4Container = formatName.includes('mp4');

  if (isMp4Container && isUniversalVideo && isUniversalAudio) {
    try {
      await execFileAsync('ffmpeg', [
        '-y',
        '-i',
        inputPath,
        '-c',
        'copy',
        '-movflags',
        '+faststart',
        outputPath,
      ]);
      return { orientation };
    } catch {
      // Fall through to full re-encode
    }
  }

  // Transcode any format (.mov, HEVC/H.265, .webm, .mkv, .avi, etc.) to universal H.264/AAC MP4
  await execFileAsync('ffmpeg', [
    '-y',
    '-i',
    inputPath,
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '23',
    '-pix_fmt',
    'yuv420p',
    '-profile:v',
    'main',
    '-level',
    '4.0',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    outputPath,
  ]);

  return { orientation };
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  // Enable cross-origin playback and upload access across preview/shared origins and browsers
  app.use('/api', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-File-Name, Range');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Stream uploaded video with full HTTP 206 Range support for Chrome, Safari, Firefox, Edge & mobile
  app.get('/api/videos/stream/:filename', (req, res) => {
    const safeName = path.basename(req.params.filename || '');
    if (!/^[a-zA-Z0-9_.-]+\.(mp4|webm|mov)$/.test(safeName)) {
      res.status(400).json({ error: 'Invalid video filename.' });
      return;
    }

    const filePath = path.join(UPLOAD_DIR, safeName);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Video file not found.' });
      return;
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(safeName).toLowerCase();
    const contentType =
      ext === '.webm'
        ? 'video/webm'
        : ext === '.mov'
        ? 'video/quicktime'
        : 'video/mp4';

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (Number.isNaN(start) || start >= fileSize || end >= fileSize || start > end) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
        return;
      }

      const chunkSize = end - start + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });

  // Streamed binary video upload + automatic universal H.264/AAC MP4 normalization
  app.post('/api/videos/upload', (req, res) => {
    const rawNameHeader = req.headers['x-file-name'];
    const originalName =
      typeof rawNameHeader === 'string'
        ? decodeURIComponent(rawNameHeader)
        : 'upload.mp4';
    const rawExt = path.extname(path.basename(originalName)).toLowerCase();
    const safeExt = /\.(mp4|mov|webm|m4v|mkv|avi|ogg|3gp)$/.test(rawExt) ? rawExt : '.mp4';

    const videoId = `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const tempPath = path.join(UPLOAD_DIR, `tmp-${videoId}${safeExt}`);
    const finalFilename = `${videoId}.mp4`;
    const finalPath = path.join(UPLOAD_DIR, finalFilename);

    let receivedBytes = 0;
    let aborted = false;
    const writeStream = fs.createWriteStream(tempPath);

    req.on('data', (chunk: Buffer) => {
      receivedBytes += chunk.length;
      if (receivedBytes > MAX_UPLOAD_BYTES && !aborted) {
        aborted = true;
        writeStream.destroy();
        fs.unlink(tempPath, () => {});
        res.status(413).json({
          error: 'Video exceeds the 250 MB upload limit. Please compress or trim the video.',
        });
      }
    });

    req.on('error', (err) => {
      if (aborted) return;
      aborted = true;
      writeStream.destroy();
      fs.unlink(tempPath, () => {});
      res.status(500).json({ error: `Upload stream error: ${err.message}` });
    });

    writeStream.on('error', (err) => {
      if (aborted) return;
      aborted = true;
      fs.unlink(tempPath, () => {});
      res.status(500).json({ error: `Failed writing video upload: ${err.message}` });
    });

    writeStream.on('finish', async () => {
      if (aborted) return;
      if (receivedBytes === 0) {
        fs.unlink(tempPath, () => {});
        res.status(400).json({ error: 'Uploaded video file is empty.' });
        return;
      }

      try {
        const { orientation } = await normalizeToUniversalMp4(tempPath, finalPath);
        const finalStats = fs.statSync(finalPath);
        res.json({
          success: true,
          id: videoId,
          filename: finalFilename,
          videoUrl: `/api/videos/stream/${finalFilename}`,
          fileSizeBytes: finalStats.size,
          detectedOrientation: orientation,
        });
      } catch (err) {
        console.error('Video normalization failed:', err);
        // Fallback: if temp file is already MP4, rename it instead of failing completely
        if (safeExt === '.mp4' && fs.existsSync(tempPath)) {
          try {
            fs.renameSync(tempPath, finalPath);
            const finalStats = fs.statSync(finalPath);
            res.json({
              success: true,
              id: videoId,
              filename: finalFilename,
              videoUrl: `/api/videos/stream/${finalFilename}`,
              fileSizeBytes: finalStats.size,
              detectedOrientation: 'auto',
            });
            return;
          } catch {
            // fall through
          }
        }
        res.status(422).json({
          error:
            err instanceof Error
              ? `Could not process video format: ${err.message}`
              : 'Could not convert video to web-compatible MP4.',
        });
      } finally {
        fs.unlink(tempPath, () => {});
      }
    });

    req.pipe(writeStream);
  });

  // Delete uploaded video file
  app.delete('/api/videos/:filename', (req, res) => {
    const safeName = path.basename(req.params.filename || '');
    if (!/^[a-zA-Z0-9_.-]+\.(mp4|webm|mov)$/.test(safeName)) {
      res.status(400).json({ error: 'Invalid filename.' });
      return;
    }
    const filePath = path.join(UPLOAD_DIR, safeName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Simply Biz server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Simply Biz server:', err);
  process.exit(1);
});
