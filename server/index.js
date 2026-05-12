import express from 'express';
import cors from 'cors';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Temp directory for downloads
const TEMP_DIR = path.join(os.tmpdir(), 'novafetch');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// ─── In-memory cache for video info (10 min TTL, max 100 entries) ───
const infoCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;
const CACHE_MAX = 100;

function getCachedInfo(url) {
  const entry = infoCache.get(url);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  if (entry) infoCache.delete(url);
  return null;
}

function setCachedInfo(url, data) {
  // Evict oldest if at capacity
  if (infoCache.size >= CACHE_MAX) {
    const oldest = infoCache.keys().next().value;
    infoCache.delete(oldest);
  }
  infoCache.set(url, { data, timestamp: Date.now() });
}

/**
 * Helper: find yt-dlp binary
 */
function getYtDlpPath() {
  const candidates = [
    path.join(__dirname, '..', 'node_modules', 'youtube-dl-exec', 'bin', 'yt-dlp.exe'),
    path.join(process.cwd(), 'node_modules', 'youtube-dl-exec', 'bin', 'yt-dlp.exe'),
    path.join(__dirname, '..', 'node_modules', 'youtube-dl-exec', 'bin', 'yt-dlp'),
    path.join(process.cwd(), 'node_modules', 'youtube-dl-exec', 'bin', 'yt-dlp'),
  ];
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  return 'yt-dlp';
}

/**
 * Helper: check if ffmpeg is available
 */
let HAS_FFMPEG = false;
let FFMPEG_PATH = 'ffmpeg';

try {
  const ffmpegStatic = await import('ffmpeg-static');
  if (ffmpegStatic.default) {
    FFMPEG_PATH = ffmpegStatic.default;
    HAS_FFMPEG = true;
  }
} catch {
  // Fallback to checking system ffmpeg
  try {
    await execAsync('ffmpeg -version', { timeout: 5000 });
    HAS_FFMPEG = true;
  } catch {
    HAS_FFMPEG = false;
  }
}

const YT_DLP = getYtDlpPath();
console.log(`  Using yt-dlp: ${YT_DLP}`);
console.log(`  FFmpeg available: ${HAS_FFMPEG} (Path: ${FFMPEG_PATH})`);

/**
 * Helper: sanitize filename
 */
function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').substring(0, 100);
}

/**
 * Helper: find the actual downloaded file (yt-dlp may modify filename)
 */
function findDownloadedFile(basePath, prefix, preferredExt) {
  const dir = path.dirname(basePath);
  const files = fs.readdirSync(dir);
  // Find files matching our prefix and not intermediate files (e.g. .f137.mp4)
  const matches = files
    .filter(f => f.startsWith(prefix) && !/\.f\w+\./.test(f))
    .map(f => path.join(dir, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  
  if (preferredExt) {
    const extMatch = matches.find(f => f.endsWith(`.${preferredExt}`));
    if (extMatch) return extMatch;
  }
  
  return matches[0] || null;
}

/**
 * Helper: run yt-dlp and capture output for debugging
 */
function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const finalArgs = [...args];
    const proc = spawn(YT_DLP, finalArgs, { 
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true 
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });
    
    const timeout = setTimeout(() => {
      proc.kill();
      reject(new Error('Download timed out'));
    }, 180000);
    
    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        console.error('yt-dlp stderr:', stderr);
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
      }
    });
    
    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * POST /api/info
 * Fetch video information from a URL
 */
app.post('/api/info', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    // Check cache first
    const cached = getCachedInfo(url);
    if (cached) {
      console.log('  [info] Cache hit for:', url);
      return res.json(cached);
    }

    const { stdout } = await runYtDlp([
      '--dump-json', '--no-download', '--no-warnings',
      '--no-check-formats',
      url,
    ]);
    const data = JSON.parse(stdout);

    // Detect platform
    let platform = 'unknown';
    const extractor = (data.extractor || data.extractor_key || '').toLowerCase();
    if (extractor.includes('youtube')) platform = 'youtube';
    else if (extractor.includes('instagram')) platform = 'instagram';
    else if (extractor.includes('tiktok')) platform = 'tiktok';
    else if (extractor.includes('facebook')) platform = 'facebook';
    else if (extractor.includes('twitter') || extractor.includes('x')) platform = 'twitter';

    // Get available qualities
    const formats = data.formats || [];
    const heights = [...new Set(formats
      .filter((f) => f.height && f.vcodec !== 'none')
      .map((f) => f.height)
    )].sort((a, b) => a - b);

    const qualityOptions = [];
    if (heights.some((h) => h <= 360)) qualityOptions.push('360p');
    if (heights.some((h) => h >= 480 && h <= 720)) qualityOptions.push('720p');
    if (heights.some((h) => h >= 1080)) qualityOptions.push('1080p');
    if (qualityOptions.length === 0) qualityOptions.push('360p', '720p');

    const response = {
      id: data.id || Date.now().toString(),
      title: data.title || 'Unknown Title',
      thumbnail: data.thumbnail || (data.thumbnails && data.thumbnails.length > 0 ? data.thumbnails[data.thumbnails.length - 1].url : ''),
      duration: data.duration || 0,
      platform,
      url,
      qualities: qualityOptions,
      formats: ['mp4', 'webm'],
    };

    // Cache the result
    setCachedInfo(url, response);

    return res.json(response);
  } catch (err) {
    console.error('Info error:', err.message);
    return res.status(500).json({ message: 'Failed to fetch video info. Please check the URL.' });
  }
});

/**
 * POST /api/download
 * Download video, audio, or thumbnail
 */
app.post('/api/download', async (req, res) => {
  const { url, type, quality, format, audioQuality, trimStart, trimEnd, title } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  const timestamp = Date.now();

  try {
    // ─── Thumbnail download ───
    if (type === 'thumbnail') {
      const { stdout } = await runYtDlp(['--dump-json', '--no-download', '--no-warnings', url]);
      const data = JSON.parse(stdout);
      const thumbUrl = data.thumbnail || (data.thumbnails && data.thumbnails.length > 0 ? data.thumbnails[data.thumbnails.length - 1].url : null);

      if (!thumbUrl) {
        return res.status(404).json({ message: 'No thumbnail found' });
      }

      const thumbResponse = await fetch(thumbUrl);
      if (!thumbResponse.ok) {
        return res.status(500).json({ message: 'Failed to download thumbnail' });
      }

      const buffer = Buffer.from(await thumbResponse.arrayBuffer());
      const filename = `${sanitizeFilename(data.title || 'thumbnail')}_thumb.jpg`;

      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('X-Filename', filename);
      return res.send(buffer);
    }

    // ─── Audio download ───
    if (type === 'audio') {
      const outputTemplate = path.join(TEMP_DIR, `${timestamp}_audio.%(ext)s`);
      const bitrate = audioQuality === '128kbps' ? '128' : '320';

      const args = [
        '-x',
        '--audio-format', 'mp3',
        '--audio-quality', `${bitrate}K`,
        '-o', outputTemplate,
        '--no-warnings',
        '--no-playlist',
      ];

      // If no FFmpeg, download best audio without conversion
      if (!HAS_FFMPEG) {
        // Download best audio stream directly
        const fallbackOutput = path.join(TEMP_DIR, `${timestamp}_audio.%(ext)s`);
        const fallbackArgs = [
          '-f', 'bestaudio',
          '-o', fallbackOutput,
          '--no-warnings',
          '--no-playlist',
          url,
        ];
        
        console.log('  [audio] No FFmpeg - downloading best audio stream directly...');
        await runYtDlp(fallbackArgs);
      } else {
        args.push('--ffmpeg-location', FFMPEG_PATH);
        args.push(url);
        console.log('  [audio] Downloading and converting to MP3...');
        await runYtDlp(args);
      }

      // Find the actual output file
      const preferredExt = HAS_FFMPEG ? 'mp3' : undefined;
      const outputFile = findDownloadedFile(path.join(TEMP_DIR, `${timestamp}_audio`), `${timestamp}_audio`, preferredExt);

      if (!outputFile || !fs.existsSync(outputFile)) {
        return res.status(500).json({ message: 'Audio extraction failed. Make sure FFmpeg is installed for MP3 conversion.' });
      }

      // Trim if needed (requires FFmpeg)
      let finalFile = outputFile;
      if (HAS_FFMPEG && trimStart !== undefined && trimEnd !== undefined) {
        const ext = path.extname(outputFile);
        const trimmedFile = path.join(TEMP_DIR, `${timestamp}_trimmed${ext}`);
        try {
          await execAsync(`"${FFMPEG_PATH}" -i "${outputFile}" -ss ${trimStart} -to ${trimEnd} -c copy "${trimmedFile}" -y`, { timeout: 60000 });
          if (fs.existsSync(trimmedFile)) {
            finalFile = trimmedFile;
            fs.unlinkSync(outputFile);
          }
        } catch (trimErr) {
          console.error('  [audio] Trim failed:', trimErr.message);
        }
      }

      const stat = fs.statSync(finalFile);
      const ext = path.extname(finalFile).substring(1);
      const safeTitle = title ? sanitizeFilename(title) : 'novafetch_audio';
      const filename = `${safeTitle}_${bitrate}kbps.${ext}`;
      const mimeTypes = { mp3: 'audio/mpeg', m4a: 'audio/mp4', webm: 'audio/webm', ogg: 'audio/ogg', opus: 'audio/opus' };

      res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('X-Filename', filename);

      const stream = fs.createReadStream(finalFile);
      stream.pipe(res);
      stream.on('end', () => { fs.unlink(finalFile, () => {}); });
      return;
    }

    // ─── Video download ───
    const ext = format || 'mp4';
    const outputTemplate = path.join(TEMP_DIR, `${timestamp}_video.%(ext)s`);

    let heightFilter = '720';
    if (quality === '360p') heightFilter = '360';
    else if (quality === '1080p') heightFilter = '1080';

    let args;

    if (HAS_FFMPEG) {
      // With FFmpeg: can merge separate video+audio streams
      let formatSelector;
      if (ext === 'webm') {
        formatSelector = `bestvideo[height<=${heightFilter}][ext=webm]+bestaudio[ext=webm]/bestvideo[height<=${heightFilter}]+bestaudio/best[height<=${heightFilter}]/best`;
      } else {
        formatSelector = `bestvideo[height<=${heightFilter}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${heightFilter}]+bestaudio/best[height<=${heightFilter}]/best`;
      }
      args = [
        '-f', formatSelector,
        '--merge-output-format', ext,
        '-o', outputTemplate,
        '--no-warnings',
        '--no-playlist',
        '--ffmpeg-location', FFMPEG_PATH,
        url,
      ];
    } else {
      // Without FFmpeg: download single stream with both video+audio already muxed
      const formatSelector = `best[height<=${heightFilter}][ext=${ext}]/best[height<=${heightFilter}]/best`;
      args = [
        '-f', formatSelector,
        '-o', outputTemplate,
        '--no-warnings',
        '--no-playlist',
        url,
      ];
    }

    console.log(`  [video] Downloading ${quality || '720p'} ${ext}... (FFmpeg: ${HAS_FFMPEG})`);
    await runYtDlp(args);

    // Find the actual output file
    const outputFile = findDownloadedFile(path.join(TEMP_DIR, `${timestamp}_video`), `${timestamp}_video`, ext);

    if (!outputFile || !fs.existsSync(outputFile)) {
      return res.status(500).json({ message: 'Video download failed' });
    }

    // Trim if needed (requires FFmpeg)
    let finalFile = outputFile;
    if (HAS_FFMPEG && trimStart !== undefined && trimEnd !== undefined) {
      const actualExt = path.extname(outputFile);
      const trimmedFile = path.join(TEMP_DIR, `${timestamp}_trimmed${actualExt}`);
      try {
        await execAsync(`"${FFMPEG_PATH}" -i "${outputFile}" -ss ${trimStart} -to ${trimEnd} -c copy "${trimmedFile}" -y`, { timeout: 60000 });
        if (fs.existsSync(trimmedFile)) {
          finalFile = trimmedFile;
          fs.unlinkSync(outputFile);
        }
      } catch (trimErr) {
        console.error('  [video] Trim failed:', trimErr.message);
      }
    }

    const stat = fs.statSync(finalFile);
    const actualExt = path.extname(finalFile).substring(1);
    const safeTitle = title ? sanitizeFilename(title) : 'novafetch_video';
    const filename = `${safeTitle}_${quality || '720p'}.${actualExt}`;

    res.setHeader('Content-Type', actualExt === 'webm' ? 'video/webm' : 'video/mp4');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Filename', filename);

    const stream = fs.createReadStream(finalFile);
    stream.pipe(res);
    stream.on('end', () => { fs.unlink(finalFile, () => {}); });

  } catch (err) {
    console.error('Download error:', err.message);
    // Clean up temp files
    try {
      const files = fs.readdirSync(TEMP_DIR).filter(f => f.startsWith(`${timestamp}_`));
      files.forEach(f => fs.unlinkSync(path.join(TEMP_DIR, f)));
    } catch {}
    return res.status(500).json({ message: `Download failed: ${err.message}` });
  }
});

/**
 * Health check
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), ffmpeg: HAS_FFMPEG });
});

app.listen(PORT, () => {
  console.log(`\n  ⚡ NovaFetch API server running at http://localhost:${PORT}\n`);
});
