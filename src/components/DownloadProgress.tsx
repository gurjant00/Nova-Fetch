import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Film, Music, Image } from 'lucide-react';
import type { DownloadProgress as DownloadProgressType } from '../types';

interface DownloadProgressProps {
  downloads: DownloadProgressType[];
}

export default function DownloadProgress({ downloads }: DownloadProgressProps) {
  if (downloads.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Music size={14} />;
      case 'thumbnail': return <Image size={14} />;
      default: return <Film size={14} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
      case 'error': return <XCircle size={16} style={{ color: 'var(--danger)' }} />;
      default: return (
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader2 size={16} style={{ color: 'var(--accent-start)' }} />
        </motion.div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card"
      style={{ padding: '20px' }}
    >
      <h3
        style={{
          fontSize: '14px',
          fontWeight: 700,
          marginBottom: '16px',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: downloads.some((d) => d.status === 'downloading' || d.status === 'processing')
              ? 'var(--success)'
              : 'var(--text-muted)',
            boxShadow: downloads.some((d) => d.status === 'downloading' || d.status === 'processing')
              ? '0 0 8px var(--success)'
              : 'none',
          }}
        />
        Downloads
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {downloads.map((dl) => (
          <motion.div
            key={dl.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
            }}
          >
            {/* Type icon */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(124, 58, 237, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-start)',
                flexShrink: 0,
              }}
            >
              {getIcon(dl.type)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {dl.title}
              </p>
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${dl.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                {dl.progress}%
              </span>
              {getStatusIcon(dl.status)}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
