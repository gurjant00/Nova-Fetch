import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 0',
        marginBottom: '8px',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src="/logo.png" 
          alt="NovaFetch" 
          style={{ 
            height: '64px', 
            width: 'auto',
            display: 'block',
            filter: 'drop-shadow(0 0 10px rgba(124, 58, 237, 0.3))'
          }} 
        />
      </div>

      {/* Theme Toggle — plain button, no scale animation */}
      <button
        onClick={onToggleTheme}
        className="btn-ghost"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
        }}
        aria-label="Toggle theme"
        id="theme-toggle"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        <span style={{ fontSize: '13px' }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>
    </motion.header>
  );
}
