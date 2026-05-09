import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from './components/Header';
import LinkInput from './components/LinkInput';
import VideoPreview from './components/VideoPreview';
import DownloadPanel from './components/DownloadPanel';
import DownloadProgressSection from './components/DownloadProgress';
import ShaderBackground from './components/ui/shader-background';
import { fetchVideoInfo, downloadMedia, triggerBrowserDownload } from './api';
import type { VideoInfo, DownloadOptions, DownloadProgress, Theme } from './types';

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('novafetch-theme');
    return (saved === 'light' ? 'light' : 'dark') as Theme;
  });
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloads, setDownloads] = useState<DownloadProgress[]>([]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('novafetch-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Fetch video info
  const handleFetch = useCallback(async (url: string) => {
    setIsLoading(true);
    setVideoInfo(null);

    try {
      const info = await fetchVideoInfo(url);
      setVideoInfo(info);
      toast.success('Video info loaded!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch video info';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle download
  const handleDownload = useCallback(
    async (options: DownloadOptions) => {
      if (!videoInfo) return;

      setIsDownloading(true);
      const downloadId = Date.now().toString();

      const newDownload: DownloadProgress = {
        id: downloadId,
        title: videoInfo.title,
        progress: 0,
        status: 'downloading',
        type: options.type,
      };

      setDownloads((prev) => [newDownload, ...prev]);

      try {
        const { blob, filename } = await downloadMedia(videoInfo.url, { ...options, title: videoInfo.title }, (progress) => {
          setDownloads((prev) =>
            prev.map((d) =>
              d.id === downloadId ? { ...d, progress, status: progress < 100 ? 'downloading' : 'processing' } : d,
            ),
          );
        });

        triggerBrowserDownload(blob, filename);

        setDownloads((prev) =>
          prev.map((d) => (d.id === downloadId ? { ...d, progress: 100, status: 'complete' } : d)),
        );

        toast.success('Download complete!');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Download failed';
        setDownloads((prev) =>
          prev.map((d) => (d.id === downloadId ? { ...d, status: 'error' } : d)),
        );
        toast.error(message);
      } finally {
        setIsDownloading(false);
      }
    },
    [videoInfo],
  );

  return (
    <>
      {/* Animated background */}
      <ShaderBackground />

      {/* Main container */}
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '0 20px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header theme={theme} onToggleTheme={toggleTheme} />

        <main style={{ flex: 1, paddingBottom: '40px' }}>
          <LinkInput onFetch={handleFetch} isLoading={isLoading} />

          {/* Loading skeleton */}
          {isLoading && (
            <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '24px' }}>
              <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9' }} />
              <div style={{ padding: '20px' }}>
                <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '10px' }} />
                <div className="skeleton" style={{ height: '14px', width: '40%' }} />
              </div>
            </div>
          )}

          {/* Video preview + Download options */}
          {videoInfo && !isLoading && (
            <>
              <VideoPreview video={videoInfo} />
              <DownloadPanel
                video={videoInfo}
                onDownload={handleDownload}
                isDownloading={isDownloading}
              />
            </>
          )}

          {/* Download Progress */}
          <DownloadProgressSection downloads={downloads} />

          {/* Empty state */}
          {!videoInfo && !isLoading && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--text-muted)',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '28px',
                }}
              >
                ⚡
              </div>
              <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Ready to download
              </p>
              <p style={{ fontSize: '13px' }}>
                Paste a video link above to get started
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            padding: '20px 0',
            fontSize: '12px',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--glass-border)',
          }}
        >
          NovaFetch — Fast &amp; Modern Media Downloader
        </footer>
      </div>
    </>
  );
}
