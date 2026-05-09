import { motion } from 'framer-motion';
import { Clock, ExternalLink } from 'lucide-react';
import type { VideoInfo } from '../types';
import { formatDuration, getPlatformName, getPlatformClass } from '../utils';

interface VideoPreviewProps {
  video: VideoInfo;
}

export default function VideoPreview({ video }: VideoPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card"
      style={{
        overflow: 'hidden',
        marginBottom: '24px',
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {/* Duration badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Clock size={12} />
          {formatDuration(video.duration)}
        </div>

        {/* Platform badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
          }}
        >
          <span className={`platform-badge ${getPlatformClass(video.platform)}`}>
            {getPlatformName(video.platform)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '20px' }}>
        <h2
          style={{
            fontSize: '16px',
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {video.title}
        </h2>

        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-start)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ExternalLink size={12} />
          Open original
        </a>
      </div>
    </motion.div>
  );
}
