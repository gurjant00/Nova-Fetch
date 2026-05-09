export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'unknown';

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number; // seconds
  platform: Platform;
  url: string;
  qualities: string[];
  formats: string[];
}

export interface DownloadOptions {
  type: 'video' | 'audio' | 'thumbnail';
  quality?: string;
  format?: string;
  audioQuality?: string;
  trimStart?: number;
  trimEnd?: number;
  title?: string;
}

export interface DownloadProgress {
  id: string;
  title: string;
  progress: number;
  status: 'downloading' | 'processing' | 'complete' | 'error';
  type: 'video' | 'audio' | 'thumbnail';
}

export type Theme = 'dark' | 'light';
