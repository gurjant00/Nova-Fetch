import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Film,
  Music,
  Image,
  Scissors,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { VideoInfo, DownloadOptions } from '../types';
import { formatDuration } from '../utils';

interface DownloadPanelProps {
  video: VideoInfo;
  onDownload: (options: DownloadOptions) => void;
  isDownloading: boolean;
}

type TabKey = 'video' | 'audio' | 'thumbnail';

export default function DownloadPanel({ video, onDownload, isDownloading }: DownloadPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('video');
  const [quality, setQuality] = useState('720p');
  const [format, setFormat] = useState('mp4');
  const [audioQuality, setAudioQuality] = useState('320kbps');
  const [trimEnabled, setTrimEnabled] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(video.duration);
  const [showTrimmer, setShowTrimmer] = useState(false);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'video', label: 'Video', icon: <Film size={15} /> },
    { key: 'audio', label: 'MP3', icon: <Music size={15} /> },
    { key: 'thumbnail', label: 'Thumbnail', icon: <Image size={15} /> },
  ];

  const qualities = ['360p', '720p', '1080p'];
  const formats = ['mp4', 'webm'];
  const audioQualities = ['128kbps', '320kbps'];

  const handleDownload = () => {
    const options: DownloadOptions = { type: activeTab };

    if (activeTab === 'video') {
      options.quality = quality;
      options.format = format;
    }

    if (activeTab === 'audio') {
      options.audioQuality = audioQuality;
    }

    if (trimEnabled && activeTab !== 'thumbnail') {
      options.trimStart = trimStart;
      options.trimEnd = trimEnd;
    }

    onDownload(options);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card"
      style={{ padding: '24px', marginBottom: '24px' }}
    >
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          border: '1px solid var(--glass-border)',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === tab.key
                ? 'linear-gradient(135deg, var(--accent-start), var(--accent-end))'
                : 'transparent',
              color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: "'Inter', sans-serif",
            }}
            id={`tab-${tab.key}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Video Options */}
      <AnimatePresence mode="wait">
        {activeTab === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Quality */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Quality
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {qualities.map((q) => (
                  <button
                    key={q}
                    className={`quality-option ${quality === q ? 'active' : ''}`}
                    onClick={() => setQuality(q)}
                    style={{ flex: 1 }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Format
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {formats.map((f) => (
                  <button
                    key={f}
                    className={`quality-option ${format === f ? 'active' : ''}`}
                    onClick={() => setFormat(f)}
                    style={{ flex: 1 }}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'audio' && (
          <motion.div
            key="audio"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Audio Quality
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {audioQualities.map((aq) => (
                  <button
                    key={aq}
                    className={`quality-option ${audioQuality === aq ? 'active' : ''}`}
                    onClick={() => setAudioQuality(aq)}
                    style={{ flex: 1 }}
                  >
                    {aq}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'thumbnail' && (
          <motion.div
            key="thumbnail"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '16px',
                border: '1px solid var(--glass-border)',
              }}
            >
              <img
                src={video.thumbnail}
                alt="Thumbnail preview"
                style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: '16/9' }}
              />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              HD thumbnail preview — click download to save
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trim Section */}
      {activeTab !== 'thumbnail' && (
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={() => {
              setShowTrimmer(!showTrimmer);
              if (!showTrimmer) setTrimEnabled(true);
              else setTrimEnabled(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px 16px',
              background: trimEnabled ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-card)',
              border: `1px solid ${trimEnabled ? 'var(--accent-start)' : 'var(--glass-border)'}`,
              borderRadius: 'var(--radius-md)',
              color: trimEnabled ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s ease',
            }}
            id="trim-toggle"
          >
            <Scissors size={15} />
            <span style={{ flex: 1, textAlign: 'left' }}>Trim Video</span>
            {showTrimmer ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          <AnimatePresence>
            {showTrimmer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  style={{
                    padding: '20px 16px',
                    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--glass-border)',
                    borderTop: 'none',
                  }}
                >
                  {/* Start */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Start: {formatDuration(trimStart)}
                      </label>
                    </div>
                    <input
                      type="range"
                      className="trim-slider"
                      min={0}
                      max={video.duration}
                      value={trimStart}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTrimStart(Math.min(val, trimEnd - 1));
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* End */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        End: {formatDuration(trimEnd)}
                      </label>
                    </div>
                    <input
                      type="range"
                      className="trim-slider"
                      min={0}
                      max={video.duration}
                      value={trimEnd}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTrimEnd(Math.max(val, trimStart + 1));
                      }}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Duration display */}
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '8px',
                      background: 'rgba(124, 58, 237, 0.08)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Selected: {formatDuration(trimStart)} → {formatDuration(trimEnd)} ({formatDuration(trimEnd - trimStart)})
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Download Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="btn-gradient"
        onClick={handleDownload}
        disabled={isDownloading}
        id="download-btn"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '16px',
          marginTop: '20px',
          fontSize: '15px',
        }}
      >
        {isDownloading ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Loader2 size={18} />
            </motion.div>
            Processing...
          </>
        ) : (
          <>
            <Download size={18} />
            Download {activeTab === 'audio' ? 'MP3' : activeTab === 'thumbnail' ? 'Thumbnail' : 'Video'}
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
