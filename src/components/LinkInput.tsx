import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, Search, Loader2, X } from 'lucide-react';
import { detectPlatform, getPlatformName, isValidUrl } from '../utils';

interface LinkInputProps {
  onFetch: (url: string) => void;
  isLoading: boolean;
}

export default function LinkInput({ onFetch, isLoading }: LinkInputProps) {
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);

  const platform = url ? detectPlatform(url) : null;
  const valid = url.length > 0 && isValidUrl(url);

  const handleSubmit = useCallback(() => {
    if (valid && !isLoading) {
      onFetch(url);
    }
  }, [url, valid, isLoading, onFetch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && isValidUrl(text)) {
        setUrl(text);
        onFetch(text);
      }
    } catch {
      // clipboard access denied
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card"
      style={{
        padding: '24px',
        marginBottom: '24px',
        borderColor: focused ? 'var(--accent-start)' : undefined,
        boxShadow: focused ? 'var(--shadow-glow)' : undefined,
      }}
    >
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Link size={16} style={{ color: 'var(--accent-start)' }} />
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Paste video link
        </span>
        {platform && platform !== 'unknown' && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`platform-badge platform-${platform}`}
          >
            {getPlatformName(platform)}
          </motion.span>
        )}
      </div>

      {/* Input Row */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            id="url-input"
            className="input-glass"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            style={{ paddingRight: url ? '40px' : '20px' }}
          />
          {url && (
            <button
              onClick={() => setUrl('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
              }}
              aria-label="Clear input"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          className="btn-gradient"
          onClick={handleSubmit}
          disabled={!valid || isLoading}
          id="fetch-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 28px',
            whiteSpace: 'nowrap',
          }}
        >
          {isLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Loader2 size={16} />
            </motion.div>
          ) : (
            <Search size={16} />
          )}
          {isLoading ? 'Fetching...' : 'Fetch'}
        </button>

        <button
          className="btn-ghost"
          onClick={handlePaste}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '16px 20px',
            whiteSpace: 'nowrap',
          }}
          id="paste-btn"
        >
          Paste
        </button>
      </div>

      {/* Supported platforms */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginTop: '14px',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        <span>Supports:</span>
        {['YouTube', 'Instagram', 'TikTok', 'Facebook', 'X/Twitter'].map((p) => (
          <span
            key={p}
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              fontSize: '11px',
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
